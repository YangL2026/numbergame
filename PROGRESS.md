# Number game: progress log

## Steps

| # | Step | Who | Status |
|---|---|---|---|
| 1 | Create an empty public GitHub repository | You | Done: `YangL2026/numbergame` |
| 2 | Attach the repository; commit `SPEC.md` and `PROGRESS.md` | Claude | Done |
| 3 | Build Prototype A (track, three item types, placement run) | Claude | Done |
| 4 | Turn on GitHub Pages and open the game on the laptop | You | Done: https://yangl2026.github.io/numbergame/ |
| 5 | Try Prototype A yourself and report problems | You | Done |
| 6 | Three sessions with her, watched without helping; notes in `NOTES.md` | You | Paused after session 1 |
| 6a | Revise the design after session 1 (spec 0.7) | Both | Done |
| 6b | Build Prototype A2 (equation strip, Start step, bunny and teacher, kinder scheduling) | Claude | Done |
| 6c | Try Prototype A2 yourself, then her three sessions | You | Next |
| 7 | Review the notes and placement result; update the spec | Both | Not started |
| 8 | Build Prototype B (stickers, sticker book, progress rules) | Claude | Not started |
| 9 | Build Version 1 (How many more type, parent page) | Claude | Not started |
| 10 | Build the sharing release (touch, profiles, themes, manifest) | Claude | Not started |
| 11 | Try it on a real phone and tablet, then share the link | You | Not started |

## Log

### 2026-11-15
- Looked at existing tools and what other parents built. Decided to build a custom game.
- Wrote `SPEC.md` version 0.1: three item types, answers on a number track, guided walkthrough after a miss, sticker book.

### 2026-11-18
- Spec 0.2: placement run, How many more item type, longer ladder kept as config.
- Spec 0.3: sharing by link added as a goal; touch rules, profiles, themes, saved-data versioning; home observations moved to a private `NOTES.md`.
- Decided how to build: a public GitHub repository served by GitHub Pages, with `SPEC.md` as the project's memory.
- Step 1 done: repository `YangL2026/numbergame` created.
- Step 2 blocked: attaching the repository failed with "link your GitHub account to let Claude access repositories".
- Installed the Claude GitHub App on `numbergame` (from github.com/apps/claude); attaching then worked.
- Step 2 done: `SPEC.md`, `PROGRESS.md`, and a `.gitignore` that keeps `NOTES.md` out of the repository were committed.
- Step 3 done: Prototype A built and pushed. Spec updated to 0.4 to match what was built.
- Checked with a simulated player in a headless browser: a perfect player passes S1-S6 in three sessions and is placed at the top; a player who misses every cup item is placed at S3; arrow keys, the on-screen buttons, and clicking the track all work; no page errors.
- Not yet checked: sound (the test browser has no speakers), a real trackpad, and phone layout (the track does not fit a phone yet; that is the sharing release).
- Step 4 done: GitHub Pages is on and the start screen loads at https://yangl2026.github.io/numbergame/.
- Step 5, first round of feedback from Yang: (1) the "Watch" examples were confusing and easy to miss; (2) the one-second flash was too short, gone in a blink; (3) the pink and blue blocks on the track drew attention without meaning anything.
- Changes made (spec 0.5): hands-on warm-ups followed by a "Your turn" card; flash raised to 1.5 seconds with a fade; track in one color with a quiet landmark at every five. Re-tested with the simulated players; no errors.

### 2026-11-19
- Step 5, second round: warm-ups, "Your turn", and the longer flash feel right. New feedback: the flower appeared and vanished before its meaning was clear.
- Changes made (spec 0.6): the token card shows ones = token = numeral and waits for ✓; tokens carry their numeral under them; the marker jumps from 0 to 5 for the flower as it does to 10 for the crown. Re-tested; no errors.
- Step 5 done: third adult playthrough, the flower card is clear. Prototype A is ready for her.
- Step 6, session 1 played. Two problems found: the five-token stage was not understood, and the prototype did not feel like a game. Details are in the private notes. Further sessions are on hold until the design is revised.
- Step 6a: worked out the revision. Yang's diagnosis: the flower stage changed too much at once and nothing linked the first term to the marker. Yang's ideas adopted: the equation strip from S1 with the answer flying into its box, and a story (student bunny, teacher rabbit who grades). Claude's additions: the bunny is the marker and makes a visible opening jump to the first number; hands replace the flower and crown; a new skill only at a session start; keep-succeeding rule; 8 items. Characters drawn in SVG and approved. Spec 0.7 written.

### 2026-11-21
- Spec 0.8: the Start step. Yang's observation that she wanted to go back to 0 when the marker began at 5 led to making the start her own move: she puts the bunny on the first number and confirms before the dots appear. A new S2 stage (start at 1-3) sits between the 0 stage and the hand.
- Step 6b done: Prototype A2 built and pushed. Equation strip from S1, Start and Add steps, bunny as the marker with four faces, teacher with speech bubble, answer flies into its box, hands for 5 and 10, name choice at first launch, 8-item sessions, one placement skill per session, keep-succeeding rule, mastery and fall-back rules. Simulated players: a perfect player passes S1-S7 in seven sessions; a player who misses every cup item is placed at S4 and later falls back to S3; no page errors.
