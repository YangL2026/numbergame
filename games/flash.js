// Flash: loose dots show for a moment, then hide. A five-token, if any, stays.
import { token, looseGroup, assemble } from './pieces.js';

export function build(item, theme) {
  const given = item.given === 5 ? token('five', theme) : null;
  return assemble(given, looseGroup(item.added, theme), true, given ? 5 : 0);
}
