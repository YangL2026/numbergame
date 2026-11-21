// Decides which item comes next: placement, the session mix, and the rule
// that keeps her succeeding.
import { GAMES } from '../games/index.js';

const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (range) => (Array.isArray(range) ? randInt(range[0], range[1]) : range);

// Skills that are switched on and whose item type has been built.
export function activeSkills(config) {
  return config.skills.skills.filter((s) => s.enabled && GAMES[s.type]);
}

export function fixedItem(skill, given, added) {
  return {
    skill: skill.id, type: skill.type, first: skill.first, track: skill.track,
    given, added, answer: given + added,
  };
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

// What this session is for, decided once at its start.
export function planSession(profile, config) {
  const skills = activeSkills(config);
  const passed = skills.filter((s) => profile.passed.includes(s.id));
  if (!profile.placement.done) {
    const skill = skills[profile.placement.index];
    return { mode: 'placement', skill, review: passed.filter((s) => s.id !== skill.id) };
  }
  const skill = skills.find((s) => s.id === profile.skill) || skills[0];
  return { mode: 'normal', skill, review: passed.filter((s) => s.id !== skill.id) };
}

// Hands out items one at a time within a session.
export class Picker {
  constructor(plan, config, total) {
    this.plan = plan;
    this.config = config;
    this.total = total;
    this.recent = [];     // first-try results on the current skill, newest last
    this.backedOff = false;
    this.lateOneDone = false;
    this.count = 0;
  }

  next(prev) {
    const { plan, config } = this;
    const S = config.settings;
    const noReview = plan.review.length === 0;
    let skill;
    let probe = false;
    if (this.backedOff && !noReview) {
      // One more try at the current skill near the end, otherwise review.
      const late = this.count === this.total - 2 && !this.lateOneDone;
      if (late) { this.lateOneDone = true; skill = plan.skill; probe = plan.mode === 'placement'; }
      else skill = plan.review[randInt(0, plan.review.length - 1)];
    } else if (plan.mode === 'placement') {
      const probes = config.skills.placement.probes;
      if (this.count < probes || noReview) { skill = plan.skill; probe = true; }
      else skill = plan.review[randInt(0, plan.review.length - 1)];
    } else if (noReview || Math.random() < S.currentShare) {
      skill = plan.skill;
    } else {
      skill = plan.review[randInt(0, plan.review.length - 1)];
    }
    this.count += 1;
    return { item: makeItem(skill, prev), probe };
  }

  // Called after each first attempt on a non-retry item.
  record(item, ok) {
    if (item.skill !== this.plan.skill.id) return;
    const { misses, window } = this.config.settings.keepSucceeding;
    this.recent.push(ok);
    const last = this.recent.slice(-window);
    if (last.filter((r) => !r).length >= misses) this.backedOff = true;
  }
}

// At the end of a placement session: did she pass the probed skill?
export function finishPlacement(profile, config, probeResults) {
  const skills = activeSkills(config);
  const P = profile.placement;
  const { pass } = config.skills.placement;
  const skillId = skills[P.index].id;
  P.results[skillId] = probeResults;
  const right = probeResults.filter(Boolean).length;
  if (right >= pass) {
    if (!profile.passed.includes(skillId)) profile.passed.push(skillId);
    P.index += 1;
    if (P.index >= skills.length) {
      P.done = true;
      P.top = true;
      profile.skill = skills[skills.length - 1].id;
    }
  } else {
    P.done = true;
    profile.skill = skillId;
  }
}

// After a normal session: move up on mastery, or back on a bad run.
export function updateProgress(profile, config) {
  const skills = activeSkills(config);
  const M = config.skills.mastery;
  const idx = skills.findIndex((s) => s.id === profile.skill);
  if (idx < 0) return;
  const tries = profile.log.filter((r) => r.skill === profile.skill && !r.retry);
  const last = tries.slice(-M.window);
  const days = new Set(last.map((r) => r.time.slice(0, 10)));
  const acc = last.length ? last.filter((r) => r.first_try).length / last.length : 0;
  if (last.length >= M.window && acc >= M.accuracy && days.size >= M.days) {
    if (!profile.passed.includes(profile.skill)) profile.passed.push(profile.skill);
    if (idx + 1 < skills.length) profile.skill = skills[idx + 1].id;
    return;
  }
  const recent = tries.slice(-M.fallbackWindow);
  const recentAcc = recent.length ? recent.filter((r) => r.first_try).length / recent.length : 1;
  if (recent.length >= M.fallbackWindow && recentAcc < M.fallbackAccuracy && idx > 0) {
    profile.skill = skills[idx - 1].id;
  }
}
