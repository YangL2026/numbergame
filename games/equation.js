// The equation strip: [ first ] + [ dots ] = [ answer ].
import { el, firstPart, looseGroup } from './pieces.js';

export function buildStrip(item, theme) {
  const root = el('div', 'eq');
  root.dataset.type = item.type;
  root.dataset.given = String(item.given);
  root.dataset.added = String(item.added);

  const first = el('div', 'box first-box');
  first.appendChild(firstPart(item.first, item.given));
  const tick1 = el('span', 'tick', '✓');
  first.appendChild(tick1);

  const loose = looseGroup(item.added, theme);
  const dotsBox = el('div', 'box dots-box hidden');
  dotsBox.appendChild(loose.el);

  const answer = el('div', 'box answer-box');
  const q = el('span', 'q', '?');
  const num = el('span', 'ans');
  const tick2 = el('span', 'tick', '✓');
  answer.append(q, num, tick2);

  root.append(first, el('span', 'sign', '+'), dotsBox, el('span', 'sign', '='), answer);

  const show = (node, on) => node.classList.toggle('on', on);
  return {
    el: root,
    loose: loose.dots,
    highlightFirst(on) { first.classList.toggle('hl', on); },
    tickFirst() { first.classList.remove('hl'); show(tick1, true); },
    cue() { dotsBox.classList.add('ready'); },
    showDots() { dotsBox.classList.remove('hidden', 'fading', 'ready'); },
    fadeDots() { dotsBox.classList.add('fading'); },
    hideDots() { dotsBox.classList.remove('fading', 'ready'); dotsBox.classList.add('hidden'); },
    dimDots() { loose.dots.forEach((d) => d.classList.add('dim')); },
    lightDot(i) { loose.dots[i].classList.remove('dim'); loose.dots[i].classList.add('lit'); },
    // Puts a number in the answer box. ok: tick it; wrong: wobble, then clear.
    setAnswer(n, ok) {
      q.classList.add('off');
      num.textContent = String(n);
      num.classList.remove('wobble');
      void num.offsetWidth;
      if (ok) show(tick2, true); else num.classList.add('wobble');
    },
    clearAnswer() { num.textContent = ''; num.classList.remove('wobble'); show(tick2, false); q.classList.remove('off'); },
    answerBox: answer,
  };
}
