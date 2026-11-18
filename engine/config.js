// Loads the three config files. Everything tunable lives in config/, not in code.
async function getJson(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load ' + path);
  return res.json();
}

export async function loadConfig(base = '') {
  const [skills, settings, themes] = await Promise.all([
    getJson(base + 'config/skills.json'),
    getJson(base + 'config/settings.json'),
    getJson(base + 'config/themes.json'),
  ]);
  return { skills, settings, themes };
}
