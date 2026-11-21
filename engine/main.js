// Start screen, name choice, and the hand-off into a session.
import { loadConfig } from './config.js';
import * as store from './store.js';
import { Sound } from './audio.js';
import { runSession } from './session.js';
import { bunnySvg, teacherSvg } from '../games/characters.js';

const root = document.getElementById('app');
const params = new URLSearchParams(location.search);

// Testing switches: ?reset clears saved data, ?nolimit lifts the daily limit,
// ?speed=4 shortens the pauses.
if (params.has('reset')) store.reset();

const config = await loadConfig();
const data = store.load();
const profile = data.profiles[data.active];
const save = () => store.save(data);
const sound = new Sound(config.settings.sounds);
const theme = config.themes.sets.find((t) => t.id === profile.theme) || config.themes.sets[0];
const speed = Math.max(1, Number(params.get('speed')) || 1);

function sessionsToday() {
  const day = store.today();
  return profile.sessions.filter((s) => s.date === day).length;
}

// First launch: she picks the bunny's name from a short list.
function showNames() {
  const names = config.settings.bunnyNames;
  root.innerHTML = `
    <div class="screen">
      <div class="char-holder big">${bunnySvg('neutral')}</div>
      <p class="big">What is her name?</p>
      <div class="names">${names.map((n) => `<button type="button" class="name-btn">${n}</button>`).join('')}</div>
    </div>`;
  root.querySelectorAll('.name-btn').forEach((b) => b.addEventListener('click', () => {
    profile.name = b.textContent;
    save();
    showStart();
  }));
}

function showStart(message) {
  if (!profile.name) { showNames(); return; }
  const limited = !params.has('nolimit') && sessionsToday() >= config.settings.sessionsPerDay;
  root.innerHTML = `
    <div class="screen">
      <div class="cast">
        <div class="char-holder">${bunnySvg(message ? 'happy' : 'neutral')}<span class="cap">${profile.name}</span></div>
        <div class="char-holder teacher-sm">${teacherSvg(message ? 'pleased' : 'neutral')}<span class="cap">${config.settings.teacherName}</span></div>
      </div>
      ${message ? `<p class="big">${message}</p>` : ''}
      ${limited
        ? '<p class="big">See you tomorrow</p>'
        : '<button type="button" class="play-btn">Play</button>'}
    </div>
    <a class="parent-link" href="parent.html">For parents</a>`;
  if (limited) return;

  const begin = async () => {
    document.removeEventListener('keydown', onKey);
    sound.unlock();
    const result = await runSession({ root, config, profile, theme, sound, save, speed });
    profile.sessions.push({ date: store.today(), items: result.items, firstTry: result.firstTry });
    save();
    showStart('All done!');
  };
  const onKey = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); begin(); }
  };
  document.addEventListener('keydown', onKey);
  root.querySelector('.play-btn').addEventListener('click', begin, { once: true });
}

showStart();
