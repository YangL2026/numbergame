// Shared drawing helpers for the pictures in the middle of the screen.
const el = (tag, cls) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  return node;
};

// A one, five, or ten token from the chosen theme. "dot" draws a plain circle.
export function token(kind, theme) {
  const value = theme[kind];
  const node = el('span', 'tok tok-' + kind);
  if (value === 'dot') node.classList.add('dot');
  else node.textContent = value;
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
        const dot = token('one', theme);
        cell.appendChild(dot);
        dots.push(dot);
      }
      group.appendChild(cell);
    }
  } else {
    group.classList.add('rows');
    for (let i = 0; i < n; i++) {
      const dot = token('one', theme);
      group.appendChild(dot);
      dots.push(dot);
    }
  }
  return { el: group, dots };
}

// Puts the given part (token or cup) beside the loose ones.
export function assemble(givenEl, loose, flashes) {
  const picture = el('div', 'picture');
  if (givenEl) {
    const wrap = el('div', 'given');
    wrap.appendChild(givenEl);
    picture.appendChild(wrap);
    picture.appendChild(el('span', 'plus')).textContent = '+';
  }
  picture.appendChild(loose.el);
  return {
    el: picture,
    loose: loose.dots,
    flashes,
    hideLoose() { loose.el.classList.remove('fading', 'ready'); loose.el.classList.add('hidden'); },
    showLoose() { loose.el.classList.remove('hidden', 'fading', 'ready'); },
    fadeLoose() { loose.el.classList.add('fading'); },
    cue() { loose.el.classList.add('ready'); },
  };
}

// Shown once: that many ones are the same as one token.
export function tokenIntro(kind, theme) {
  const count = kind === 'ten' ? 10 : 5;
  const card = el('div', 'intro');
  const ones = el('div', 'intro-ones loose rows');
  for (let i = 0; i < count; i++) ones.appendChild(token('one', theme));
  const arrow = el('span', 'intro-arrow');
  arrow.textContent = '→';
  const big = token(kind, theme);
  big.classList.add('intro-token');
  card.append(ones, arrow, big);
  return card;
}
