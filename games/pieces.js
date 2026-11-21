// Shared drawing helpers for the pictures in the equation strip.
export const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};

// A loose one: a plain dot, or the theme's emoji for later stages.
export function one(theme) {
  const node = el('span', 'tok tok-one');
  if (!theme || theme.one === 'dot') node.classList.add('dot');
  else node.textContent = theme.one;
  return node;
}

// Where dots sit on a 3 x 3 grid for 1 to 5, like dice faces.
const DICE = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9] };

// The loose ones. Up to 5 use a dice pattern; more than 5 fill rows of five.
export function looseGroup(n, theme) {
  const group = el('div', 'loose');
  const dots = [];
  if (n <= 5) {
    group.classList.add('dice');
    for (let pos = 1; pos <= 9; pos++) {
      const cell = el('span', 'spot');
      if (DICE[n].includes(pos)) {
        const dot = one(theme);
        cell.appendChild(dot);
        dots.push(dot);
      }
      group.appendChild(cell);
    }
  } else {
    group.classList.add('rows');
    for (let i = 0; i < n; i++) {
      const dot = one(theme);
      group.appendChild(dot);
      dots.push(dot);
    }
  }
  return { el: group, dots };
}

// The first part of the strip: what she starts with.
export function firstPart(kind, value) {
  const wrap = el('div', 'first first-' + kind);
  if (kind === 'zero' || kind === 'num') {
    wrap.appendChild(el('span', 'first-num', String(value)));
  } else if (kind === 'hand' || kind === 'hands') {
    wrap.appendChild(el('span', 'hand', kind === 'hand' ? '✋' : '✋✋'));
    wrap.appendChild(el('span', 'first-label', String(value)));
  } else if (kind === 'cup') {
    wrap.appendChild(el('div', 'cup', String(value)));
  }
  return wrap;
}
