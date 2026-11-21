// The student bunny and the teacher rabbit, drawn in code. Each has a few faces.
// Everything is an SVG string; the numbers below are the drawing.

const LINE = '#5a4a52';

function bunnyFace(face) {
  const L = LINE;
  let eyes;
  if (face === 'happy') {
    eyes = `<path d="M -31 -2 Q -20 -14 -9 -2 M 9 -2 Q 20 -14 31 -2" fill="none" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;
  } else {
    const [dx, dy] = { thinking: [3, -4], sad: [0, 3] }[face] || [0, 0];
    eyes = [-20, 20].map((cx) => `
      <circle cx="${cx}" cy="-2" r="11" fill="#fff" stroke="${L}" stroke-width="2.5"/>
      <circle cx="${cx + dx}" cy="${-2 + dy}" r="7.5" fill="${L}"/>
      <circle cx="${cx + dx - 2.5}" cy="${-5 + dy}" r="2.8" fill="#fff"/>
      <circle cx="${cx + dx + 2.5}" cy="${dy}" r="1.3" fill="#fff"/>`).join('');
  }
  const brows = {
    sad: `<path d="M -30 -20 Q -22 -24 -12 -18 M 12 -18 Q 22 -24 30 -20" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`,
    thinking: `<path d="M -29 -19 Q -20 -22 -11 -19 M 11 -22 Q 20 -27 29 -22" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`,
  }[face] || '';
  const mouth = {
    neutral: `<path d="M -6 22 Q 0 27 6 22" fill="none" stroke="${L}" stroke-width="2.5" stroke-linecap="round"/>`,
    happy: `<path d="M -12 20 Q 0 36 12 20 Z" fill="#e8607f" stroke="${L}" stroke-width="2.5" stroke-linejoin="round"/><path d="M -6 20 Q 0 26 6 20" fill="#fff"/>`,
    thinking: `<ellipse cx="4" cy="24" rx="4" ry="4.5" fill="#e8607f" stroke="${L}" stroke-width="2.5"/>`,
    sad: `<path d="M -7 26 Q 0 21 7 26" fill="none" stroke="${L}" stroke-width="2.5" stroke-linecap="round"/>`,
  }[face];
  const extra = {
    thinking: `<text x="52" y="-50" font-family="sans-serif" font-weight="800" font-size="34" fill="#b9a9c8">?</text>`,
    happy: `<text x="-70" y="-40" font-size="22" fill="#ffb347">✦</text><text x="46" y="-56" font-size="18" fill="#ffb347">✦</text>`,
  }[face] || '';
  return `<path d="M -4 13 L 4 13 L 0 18 Z" fill="#f08ab0"/>${brows}${eyes}${mouth}${extra}`;
}

export function bunnySvg(face = 'neutral') {
  const L = LINE;
  const FUR = '#fff8fb';
  const INNER = '#ffc6d8';
  const droop = { sad: 10, thinking: 4 }[face] || 0;
  const cheek = face === 'happy' ? 10 : 8;
  const ear = (x, rot) => `<g transform="translate(${x} -66) rotate(${rot})">
      <ellipse rx="12" ry="38" fill="${FUR}" stroke="${L}" stroke-width="3"/>
      <ellipse cy="4" rx="6" ry="26" fill="${INNER}"/></g>`;
  return `<svg viewBox="-72 -108 144 200" xmlns="http://www.w3.org/2000/svg" class="char bunny face-${face}">
    ${ear(-24, -14 - droop)}${ear(24, 14 + droop)}
    <ellipse cy="56" rx="40" ry="28" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    <ellipse cx="-22" cy="80" rx="16" ry="8" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    <ellipse cx="22" cy="80" rx="16" ry="8" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    <circle r="52" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    <circle cx="-32" cy="14" r="${cheek}" fill="#ffd3df"/><circle cx="32" cy="14" r="${cheek}" fill="#ffd3df"/>
    ${bunnyFace(face)}
    <g transform="translate(38 -44) rotate(20)">
      <path d="M 0 0 L -16 -11 L -16 11 Z M 0 0 L 16 -11 L 16 11 Z" fill="#ff7fa8" stroke="${L}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle r="4.5" fill="#ffb3c9" stroke="${L}" stroke-width="2.5"/></g>
  </svg>`;
}

export function teacherSvg(face = 'neutral') {
  const L = '#4a4440';
  const FUR = '#d9d2cc';
  const INNER = '#f3c9c0';
  const ear = (x, rot) => `<g transform="translate(${x} -80) rotate(${rot})">
      <ellipse rx="14" ry="44" fill="${FUR}" stroke="${L}" stroke-width="3"/>
      <ellipse cy="4" rx="7" ry="30" fill="${INNER}"/></g>`;
  const brows = face === 'notyet'
    ? `<path d="M -30 -24 Q -20 -30 -10 -25 M 10 -31 Q 20 -36 30 -30" fill="none" stroke="${L}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<path d="M -30 -24 Q -20 -30 -10 -25 M 10 -25 Q 20 -30 30 -24" fill="none" stroke="${L}" stroke-width="3.5" stroke-linecap="round"/>`;
  const mouth = face === 'pleased'
    ? `<path d="M -11 31 Q 0 40 11 31" fill="none" stroke="${L}" stroke-width="2.5" stroke-linecap="round"/>`
    : `<path d="M -8 32 Q 0 36 8 32" fill="none" stroke="${L}" stroke-width="2.5" stroke-linecap="round"/>`;
  return `<svg viewBox="-72 -128 144 240" xmlns="http://www.w3.org/2000/svg" class="char teacher face-${face}">
    ${ear(-26, -8)}${ear(26, 8)}
    <ellipse cy="62" rx="48" ry="36" fill="#6f8fb8" stroke="${L}" stroke-width="3"/>
    <path d="M -14 30 L 0 62 L 14 30" fill="#fff" stroke="${L}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 0 40 L -12 33 L -12 47 Z M 0 40 L 12 33 L 12 47 Z" fill="#d94f4f" stroke="${L}" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="-26" cy="94" rx="18" ry="9" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    <ellipse cx="26" cy="94" rx="18" ry="9" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    <circle r="54" fill="${FUR}" stroke="${L}" stroke-width="3"/>
    ${brows}
    <circle cx="-20" cy="-6" r="14" fill="#eaf4ff" fill-opacity="0.6" stroke="${L}" stroke-width="3"/>
    <circle cx="20" cy="-6" r="14" fill="#eaf4ff" fill-opacity="0.6" stroke="${L}" stroke-width="3"/>
    <path d="M -6 -6 L 6 -6 M -34 -8 L -50 -14 M 34 -8 L 50 -14" fill="none" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="-20" cy="-5" r="5.5" fill="${L}"/><circle cx="20" cy="-5" r="5.5" fill="${L}"/>
    <circle cx="-18" cy="-7" r="1.8" fill="#fff"/><circle cx="22" cy="-7" r="1.8" fill="#fff"/>
    <path d="M -5 13 L 5 13 L 0 19 Z" fill="#c98a80"/>
    <path d="M 0 22 Q -10 14 -24 22 Q -16 30 0 24 Q 16 30 24 22 Q 10 14 0 22 Z" fill="#8a7f78" stroke="${L}" stroke-width="2"/>
    ${mouth}
    <path d="M -30 10 L -56 6 M -30 16 L -56 20 M 30 10 L 56 6 M 30 16 L 56 20" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

// Swaps the drawing inside a holder element for the given face.
export function setFace(holder, who, face) {
  if (holder.dataset.face === face) return;
  holder.dataset.face = face;
  holder.innerHTML = who === 'bunny' ? bunnySvg(face) : teacherSvg(face);
}
