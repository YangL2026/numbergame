// Decides which item comes next and runs the placement rule.
import { GAMES } from '../games/index.js';

const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (range) => (Array.isArray(range) ? randInt(range[0], range[1]) : range);

// Skills that are switched on and whose item type has been built.
export function activeSkills(config) {
  return config.skills.skills.filter((s) => s.enabled && GAMES[s.type]);
}

export function fixedItem(skill, given, added) {
  return { skill: skill.id, type: skill.type, track: skill.track, given, added, answer: given + added };
}

export function makeItem(skill, prev) {
  let item = null;
  for (let tries = 0; tries < 40; tries++) {
    item = fixedItem(skill, pick(skill.given), pick(skill.added));
    if (skill.maxTotal && item.answer > skill.maxTotal) continue;
    if (item.answer > skill.track) continue;
    if (prev && prev.given === item.given && prev.added === item.added) continue;
    // Ten-token items never run 10+1, 10+2, 10+3 in a row.
    if (skill.type === 'ten' && prev && prev.type === 'ten' && item.added === prev.added + 1) continue;
    return item;
  }
  return item;
}

export function nextItem(profile, config, prev) {
  const skills = activeSkills(config);
  const P = profile.placement;
  if (!P.done) {
    return { item: makeItem(skills[P.index], prev), probe: true };
  }
  const current = skills.find((s) => s.id === profile.skill) || skills[0];
  const review = skills.filter((s) => profile.passed.includes(s.id) && s.id !== current.id);
  const useReview = review.length > 0 && Math.random() < config.settings.reviewShare;
  const skill = useReview ? review[randInt(0, review.length - 1)] : current;
  return { item: makeItem(skill, prev), probe: false };
}

// Placement: each skill gets up to `probes` items. `pass` correct on the first
// try moves her up; once that can no longer be reached, this is her skill.
export function recordProbe(profile, config, skillId, ok) {
  const skills = activeSkills(config);
  const P = profile.placement;
  const { probes, pass } = config.skills.placement;
  const results = P.results[skillId] || (P.results[skillId] = []);
  results.push(ok);
  const right = results.filter(Boolean).length;
  const wrong = results.length - right;
  if (right >= pass) {
    if (!profile.passed.includes(skillId)) profile.passed.push(skillId);
    P.index += 1;
    if (P.index >= skills.length) {
      P.done = true;
      P.top = true;
      profile.skill = skills[skills.length - 1].id;
    }
  } else if (wrong > probes - pass) {
    P.done = true;
    profile.skill = skillId;
  }
}
