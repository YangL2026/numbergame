// Runs one play session: the Start step, the Add step, feedback, walkthroughs.
import { Track } from '../games/track.js';
import { GAMES } from '../games/index.js';
import { buildStrip } from '../games/equation.js';
import { setFace } from '../games/characters.js';
import { speak } from './audio.js';
import { activeSkills, fixedItem, planSession, Picker, finishPlacement, updateProgress } from './scheduler.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runSession({ root, config, profile, theme, sound, save, speed = 1 }) {
  const S = config.settings;
  const total = S.itemsPerSession;
  const wait = (ms) => sleep(ms / speed);
  root.style.setProperty('--fade', (S.fadeMs / speed) + 'ms');

  root.innerHTML = `
    <div class="play">
      <header class="top">
        <div class="teacher-holder"></div>
        <div class="bubble"><span class="bubble-text"></span>
          <button type="button" class="speak" aria-label="Read aloud">🔊</button></div>
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
  const teacherEl = root.querySelector('.teacher-holder');
  const bubbleText = root.querySelector('.bubble-text');
  const stage = root.querySelector('.stage');
  const prog = root.querySelector('.prog');
  const btnLeft = root.querySelector('.ctl.left');
  const btnRight = root.querySelector('.ctl.right');
  const btnOk = root.querySelector('.ctl.ok');
  const track = new Track(root.querySelector('.track'), sound);
  for (let i = 0; i < total; i++) prog.appendChild(document.createElement('span'));

  const teacher = (face) => setFace(teacherEl, 'teacher', face);
  teacher('neutral');
  const say = (text) => { bubbleText.textContent = text; };

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
  root.querySelector('.speak').addEventListener('click', () => speak(bubbleText.textContent));

  // Start step: she must put the bunny on `target` and confirm.
  function waitStart(target) {
    return new Promise((resolve) => {
      let hops = 0;
      setMode('start', (a) => {
        if (a.type === 'move') { if (track.hop(a.dir)) hops += 1; }
        else if (a.type === 'cell') { if (a.n !== track.value) { track.set(a.n, { sound: true }); hops += 1; } else if (a.n === target) { setMode('busy', null); resolve(hops); } }
        else if (a.type === 'ok') { if (track.value === target) { setMode('busy', null); resolve(hops); } else track.wobble(); }
      });
    });
  }

  // Add step: move anywhere, then confirm.
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
        if (a.type === 'move') { if (track.hop(a.dir)) hops += 1; }
        else if (a.type === 'cell') { if (a.n === track.value) finish(); else { track.set(a.n, { sound: true }); hops += 1; } }
        else if (a.type === 'ok') finish();
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

  // ---- pieces of an item ----
  function showStrip(item) {
    track.build(item.track);
    track.set(0, { anim: null });
    track.face('neutral');
    stage.innerHTML = '';
    const strip = buildStrip(item, theme);
    stage.appendChild(strip.el);
    return strip;
  }

  async function startStep(item, strip) {
    teacher('neutral');
    say('Start at ' + item.given);
    strip.highlightFirst(true);
    const hops = await waitStart(item.given);
    strip.tickFirst();
    track.bounce();
    sound.soft();
    await wait(400);
    return hops;
  }

  async function showDots(item, strip) {
    say('How many?');
    track.face('thinking');
    if (GAMES[item.type].flashes) {
      strip.cue();
      await wait(600);
      strip.showDots();
      await wait(S.flashMs);
      strip.fadeDots();
      await wait(S.fadeMs);
      strip.hideDots();
    } else {
      strip.showDots();
      await wait(300);
    }
  }

  // The numeral under the bunny flies into the answer box.
  async function flyAnswer(strip, n, ok) {
    const from = track.numRect();
    const to = strip.answerBox.getBoundingClientRect();
    const flyer = document.createElement('span');
    flyer.className = 'flyer';
    flyer.textContent = String(n);
    document.body.appendChild(flyer);
    flyer.style.left = from.left + from.width / 2 + 'px';
    flyer.style.top = from.top + from.height / 2 + 'px';
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = flyer.animate(
      [{ transform: 'translate(-50%, -50%) scale(1)' }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.4)` }],
      { duration: 550 / speed, easing: 'cubic-bezier(.3,.8,.4,1)' });
    await anim.finished.catch(() => {});
    flyer.remove();
    strip.setAnswer(n, ok);
  }

  async function right(strip, n) {
    await flyAnswer(strip, n, true);
    track.face('happy');
    track.bounce();
    teacher('pleased');
    say('Yes!');
    strip.showDots();
    track.land();
    sound.land();
    await wait(1200);
  }

  // After a miss: she performs the solution herself, one hop per loose dot.
  async function guided(item, strip) {
    play.classList.add('guided');
    strip.showDots();
    strip.dimDots();
    track.set(item.given, { sound: true });
    track.face('thinking');
    await wait(500);
    btnRight.classList.add('pulse');
    for (let i = 0; i < strip.loose.length; i++) {
      await waitHop();
      track.hop(1);
      strip.lightDot(i);
    }
    btnRight.classList.remove('pulse');
    track.land();
    btnOk.classList.add('pulse');
    await waitOk();
    btnOk.classList.remove('pulse');
    play.classList.remove('guided');
    await right(strip, item.answer);
  }

  async function wrong(item, strip, n) {
    await flyAnswer(strip, n, false);
    track.face('sad');
    teacher('notyet');
    say('Not yet');
    await wait(1100);
    strip.clearAnswer();
    await guided(item, strip);
  }

  // A full-screen card that waits for ✓.
  async function card(text) {
    play.classList.add('card');
    stage.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'yourturn';
    p.textContent = text;
    stage.appendChild(p);
    await wait(1200);
    btnOk.classList.add('pulse');
    await waitOk();
    btnOk.classList.remove('pulse');
    play.classList.remove('card');
  }

  // Warm-up: Start step, then the dots stay, faded, and each hop lights one.
  async function warmup(item) {
    const strip = showStrip(item);
    await startStep(item, strip);
    say('How many?');
    await guided(item, strip);
  }

  // The first time a skill appears: warm-ups, then "Your turn".
  async function introduce(skillId) {
    if (profile.demos[skillId]) return;
    const skill = activeSkills(config).find((s) => s.id === skillId);
    if (!skill) return;
    const warmups = skill.warmup || [];
    for (const [given, added] of warmups) await warmup(fixedItem(skill, given, added));
    if (warmups.length) await card('Your turn');
    profile.demos[skillId] = true;
    save();
  }

  // ---- the session loop ----
  const session = profile.sessions.length + 1;
  const plan = planSession(profile, config);
  const picker = new Picker(plan, config, total);
  const probeResults = [];
  const queue = []; // missed items waiting to come back
  let count = 0;
  let firstTry = 0;
  let prev = null;

  await introduce(plan.skill.id);

  while (count < total) {
    let item;
    let probe = false;
    let retry = false;
    const due = queue.findIndex((entry) => entry.due <= count);
    if (due >= 0) {
      item = queue.splice(due, 1)[0].item;
      retry = true;
    } else {
      ({ item, probe } = picker.next(prev));
    }

    const strip = showStrip(item);
    const startHops = await startStep(item, strip);
    await showDots(item, strip);
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
      start_hops: startHops,
      probe,
      retry,
    });
    if (!retry) picker.record(item, ok);
    if (probe) probeResults.push(ok);
    if (ok) firstTry += 1;
    save();

    if (ok) await right(strip, answer.value);
    else {
      await wrong(item, strip, answer.value);
      if (!retry) queue.push({ item, due: count + 1 + S.requeueDistance });
    }

    prog.children[count].classList.add('done');
    count += 1;
    prev = item;
  }

  if (plan.mode === 'placement') finishPlacement(profile, config, probeResults);
  else updateProgress(profile, config);
  save();

  document.removeEventListener('keydown', onKey);
  handler = null;
  return { items: total, firstTry };
}
