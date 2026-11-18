# Number game: progress log

## Steps

| # | Step | Who | Status |
|---|---|---|---|
| 1 | Create an empty public GitHub repository | You | Done: `YangL2026/numbergame` |
| 2 | Attach the repository; commit `SPEC.md` and `PROGRESS.md` | Claude | Done |
| 3 | Build Prototype A (track, three item types, placement run) | Claude | Done |
| 4 | Turn on GitHub Pages and open the game on the laptop | You | Next |
| 5 | Try Prototype A yourself and report problems | You | Not started |
| 6 | Three sessions with her, watched without helping; notes in `NOTES.md` | You | Not started |
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
