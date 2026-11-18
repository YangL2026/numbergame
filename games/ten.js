// Ten-token: one solid ten stays visible; the loose ones flash and hide.
import { token, looseGroup, assemble } from './pieces.js';

export function build(item, theme) {
  return assemble(token('ten', theme), looseGroup(item.added, theme), true);
}
