// Cup: a number hidden under a cup, plus loose dots that stay visible.
import { looseGroup, assemble } from './pieces.js';

export function build(item, theme) {
  const cup = document.createElement('div');
  cup.className = 'cup';
  cup.textContent = String(item.given);
  return assemble(cup, looseGroup(item.added, theme), false);
}
