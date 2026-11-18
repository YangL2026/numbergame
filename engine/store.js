// Saved data lives in this browser's local storage. Nothing leaves the device.
const KEY = 'numbergame';
export const FORMAT = 1;

export function newProfile() {
  return {
    name: '',
    theme: null,
    placement: { done: false, index: 0, top: false, results: {} },
    skill: null,     // current skill id, set when placement ends
    passed: [],      // skill ids passed so far
    demos: {},       // skill ids whose intro has been shown
    sessions: [],    // { date, items, firstTry }
    log: [],         // one record per attempt
  };
}

function fresh() {
  return { format: FORMAT, active: 'p1', profiles: { p1: newProfile() } };
}

// Upgrade older saved data in place. Add a step here whenever FORMAT changes.
function migrate(data) {
  if (!data || typeof data !== 'object' || !data.profiles) return fresh();
  data.format = FORMAT;
  return data;
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { /* unreadable data: start fresh */ }
  return fresh();
}

export function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}

export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
