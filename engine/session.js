// Runs one play session: present an item, take the answer, give feedback.
import { Track } from '../games/track.js';
import { GAMES } from '../games/index.js';
import { tokenIntro } from '../games/pieces.js';
import { speak } from './audio.js';
import { activeSkills, fixedItem, nextItem, recordProbe } from './scheduler.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const QUESTION = 'How many?';

export async function runSession({ root, config, profile, theme, sound, save, speed = 1 }) {
  const S = config.settings;
  const total = S.itemsPerSession;
  const wait = (ms) => sleep(ms / speed);

  root.innerHTML = `
    <div class="play">
      <header class="top">
        <button type="button" class="speak" aria-label="Read the question aloud">🔊</button>
        <h1 class="q">${QUESTION}</h1>
        <div class="prog" aria-hidden="true"></div>
      </header>
      <section class="stage"></section>
      <section class="trackwrap">
        <div class="track"></div>
        <div class="controls">
          <button type="button" class="ctl left" aria-label="Hop back">◀</button>
          <button type="button" class="ctl right" aria-label="Hop forward">▶</button>
          <button type="button" class="ctl ok" aria-label="Done">✓</button>
        </div>
      </section>
    </div>`;

  const play = root.querySelector('.play');
  const q = root.querySelector('.q');
  const stage = root.querySelector('.stage');
  const prog = root.querySelector('.prog');
  const btnLeft = root.querySelector('.ctl.left');
  const btnRight = root.querySelector('.ctl.right');
  const btnOk = root.querySelector('.ctl.ok');
  const track = new Track(root.querySelector('.track'), sound);
  for (let i = 0; i < total; i++) prog.appendChild(document.createElement('span'));

  // ---- input: keys, on-screen buttons, and the track all feed one handler ----
  let handler = null;
  const emit = (action) => { if (handler) handler(action); };
  // What the game is waiting for; also readable by tests through data-mode.
  const setMode = (mode, fn) => { play.dataset.mode = mode; handler = fn; };

  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (!e.repeat) emit({ type: 'move', dir: e.key === 'ArrowRight' ? 1 : -1, src: 'keys' });
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!e.repeat) emit({ type: 'ok', src: 'keys' });
    }
  };
  document.addEventListener('keydown', onKey);

  const press = (button, action) => button.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary) return;
    e.preventDefault();
    emit(action);
  });
  press(btnLeft, { type: 'move', dir: -1, src: 'pointer' });
  press(btnRight, { type: 'move', dir: 1, src: 'pointer' });
  press(btnOk, { type: 'ok', src: 'pointer' });
  track.onCell = (n) => emit({ type: 'cell', n, src: 'pointer' });
  root.querySelector('.speak').addEventListener('click', () => speak(q.textContent));

  // Free answering: move anywhere, then confirm.
  function waitAnswer() {
    return new Promise((resolve) => {
      let hops = 0;
      const used = new Set();
      const finish = () => {
        setMode('busy', null);
        resolve({ value: track.value, hops, input: used.size > 1 ? 'both' : [...used][0] || 'keys' });
      };
      setMode('answer', (a) => {
        used.add(a.src);
        if (a.type === 'move') {
          if (track.hop(a.dir)) hops += 1;
        } else if (a.type === 'cell') {
          if (a.n === track.value) finish();
          else { track.set(a.n, { sound: true }); hops += 1; }
        } else if (a.type === 'ok') {
          finish();
        }
      });
    });
  }

  // Walkthrough: only a forward hop counts.
  function waitHop() {
    return new Promise((resolve) => {
      setMode('hop', (a) => {
        if ((a.type === 'move' && a.dir === 1) || a.type === 'cell') { setMode('busy', null); resolve(); }
      });
    });
  }

  function waitOk() {
    return new Promise((resolve) => {
      setMode('ok', (a) => {
        if (a.type === 'ok' || (a.type === 'cell' && a.n === track.value)) { setMode('busy', null); resolve(); }
      });
    });
  }

  // ---- showing an item ----
  async function present(item) {
    track.build(item.track);
    track.set(item.given);
    stage.innerHTML = '';
    const pic = GAMES[item.type].build(item, theme);
    if (pic.flashes) pic.hideLoose();
    stage.appendChild(pic.el);
    if (pic.flashes) {
      await wait(600);
      pic.showLoose();
      await wait(S.flashMs);
      pic.hideLoose();
    } else {
      await wait(300);
    }
    return pic;
  }

  async function celebrate(pic) {
    pic.showLoose();
    track.land();
    sound.land();
    await wait(1100);
  }

  // After a miss: she performs the solution herself, one hop per loose dot.
  async function guided(item, pic) {
    play.classList.add('guided');
    pic.showLoose();
    pic.loose.forEach((dot) => dot.classList.add('dim'));
    await wait(500);
    if (item.type === 'ten') {
      track.set(0);
      await wait(500);
      track.set(10, { sound: true, big: true });
      await wait(700);
    } else {
      track.set(item.given);
    }
    btnRight.classList.add('pulse');
    for (const dot of pic.loose) {
      await waitHop();
      track.hop(1);
      dot.classList.remove('dim');
      dot.classList.add('lit');
    }
    btnRight.classList.remove('pulse');
    track.land();
    sound.land();
    btnOk.classList.add('pulse');
    await waitOk();
    btnOk.classList.remove('pulse');
    play.classList.remove('guided');
    await wait(300);
  }

  // A worked example that plays by itself.
  async function demo(item) {
    play.classList.add('demo');
    q.textContent = 'Watch';
    const pic = await present(item);
    for (let i = 0; i < item.added; i++) {
      await wait(650);
      track.hop(1);
    }
    await wait(500);
    btnOk.classList.add('pulse');
    await wait(700);
    btnOk.classList.remove('pulse');
    await celebrate(pic);
    q.textContent = QUESTION;
    play.classList.remove('demo');
  }

  // The first time a skill appears: token meaning, then worked examples.
  async function introduce(skillId) {
    if (profile.demos[skillId]) return;
    const skill = activeSkills(config).find((s) => s.id === skillId);
    if (!skill) return;
    if (skill.intro) {
      play.classList.add('demo');
      q.textContent = 'Watch';
      stage.innerHTML = '';
      stage.appendChild(tokenIntro(skill.intro, theme));
      await wait(3200);
      play.classList.remove('demo');
    }
    for (const [given, added] of skill.demo || []) {
      await demo(fixedItem(skill, given, added));
    }
    q.textContent = QUESTION;
    profile.demos[skillId] = true;
    save();
  }

  // ---- the session loop ----
  const session = profile.sessions.length + 1;
  const queue = []; // missed items waiting to come back
  let count = 0;
  let firstTry = 0;
  let prev = null;

  while (count < total) {
    let item;
    let probe = false;
    let retry = false;
    const due = queue.findIndex((entry) => entry.due <= count);
    if (due >= 0) {
      item = queue.splice(due, 1)[0].item;
      retry = true;
    } else {
      ({ item, probe } = nextItem(profile, config, prev));
    }

    await introduce(item.skill);
    const pic = await present(item);
    const started = performance.now();
    const answer = await waitAnswer();
    const ok = answer.value === item.answer;

    profile.log.push({
      time: new Date().toISOString(),
      session,
      skill: item.skill,
      item: { type: item.type, given: item.given, added: item.added },
      answer: item.answer,
      given_answer: answer.value,
      first_try: ok,
      response_ms: Math.round(performance.now() - started),
      input: answer.input,
      hops: answer.hops,
      probe,
      retry,
    });
    if (probe) recordProbe(profile, config, item.skill, ok);
    if (ok) firstTry += 1;
    save();

    if (ok) {
      await celebrate(pic);
    } else {
      await guided(item, pic);
      if (!retry) queue.push({ item, due: count + 1 + S.requeueDistance });
    }

    prog.children[count].classList.add('done');
    count += 1;
    prev = item;
  }

  document.removeEventListener('keydown', onKey);
  handler = null;
  return { items: total, firstTry };
}
