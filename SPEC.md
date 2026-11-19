# Number game: specification

Version 0.6, 2026-11-19. Prototype A is built. Every number here is a starting value to tune after watching her play.

## 1. Goal

She chooses to play, and while she plays she is doing the thinking herself.

The game teaches three things that come before addition facts:

1. Seeing a small quantity without counting it.
2. Starting a count from a number she already has, not from 1.
3. Reading a teen number as ten and some more.
4. Finding how many more it takes to get from one number to another.

Her level is uneven and moving: she uses good strategies when numbers mean something to her and falls back to counting from 1 on bare problems. The game therefore finds her level by testing it, and the ladder is built to be extended.

## 2. Design rules

These come from what has and hasn't worked for her. A change that breaks one of them needs a reason written in the change log.

| Rule | Why |
|---|---|
| Nothing countable stays on screen unless it is a solid token | She counts every cell of a ten-frame; she could not count inside the "pepperoni is 10" |
| The math screen is plain; theme lives in stickers and tokens | iReady's story and monsters became the point |
| A miss starts a walkthrough that she performs | The "boing" number-line jumps are what has worked at home |
| No clocks, scores, or speed rewards are ever shown | No pressure for now |
| The number line is something she moves along, never something she draws | Drawing it turns into a drawing project |
| Sessions are short and end while she wants more | Keeps her coming back |
| As few settings as possible | Easier to maintain |
| The game tests her level and never assumes it | She counted on from 6 unprompted (birthdays) days after counting 6 + 2 from 1 |
| Skills are data in `config/skills.json` | New stages are added as she grows, without rewriting the engine |

## 3. Platform and files

- Static web app: plain HTML, CSS, and JavaScript. No framework, build step, server, or accounts.
- Kept in a GitHub repository and served with GitHub Pages, opened from a bookmark.
- First target: a laptop with a trackpad, in a current Chrome or Safari, full screen.
- Sharing target: any phone or tablet browser, opened from a link. It stays a web page; no app store.
- The repository is public. Nothing about a particular child goes in it; home observations live in a private `NOTES.md` outside the repository.

```
numbergame/
  SPEC.md              this file; change it first, then the code
  index.html           child screen: start, play, sticker book
  parent.html          progress, settings, export
  manifest.webmanifest lets a phone or tablet add the game to its home screen
  config/
    skills.json        skill ladder and mastery rule
    settings.json      defaults for everything in section 12
    themes.json        token sets and sticker list
  engine/
    session.js         runs one session
    scheduler.js       picks the next item
    store.js           local storage, export, import
    audio.js           sound effects and the speaker button
    reward.js          sticker award and sticker book
  games/
    track.js           the number track and marker (shared)
    flash.js           item type 1
    cup.js             item type 2
    ten.js             item type 3
    more.js            item type 4
  assets/              empty in version 1
```

- The engine decides what comes next. Files in `games/` only draw an item and report the answer.
- Changing the ladder, ranges, or session length means editing `config/`, not code.
- Sounds are generated in the browser, and tokens and stickers are emoji, so version 1 needs no asset files.

## 4. Screen

- **Top:** the question ("How many?" or "How many hops?") with a small speaker button that reads it aloud.
- **Middle:** the picture for the item.
- **Bottom:** the number track with a marker.
- No score, timer, progress percentage, or character. A row of 12 small circles fills in as items are finished, so she can see the session is short.

### Number track

- Runs 0–10 for skills S1–S3 and 0–20 from S4 on.
- All cells share one neutral color, with every numeral shown. Every fifth cell (0, 5, 10, 15, 20) is slightly darker as a quiet landmark.
- The marker is a large dot sitting on one cell.

## 5. Input

| Action | Keys | Trackpad |
|---|---|---|
| Move the marker one cell | Left and right arrows | Click a cell (the whole column above it counts), or the on-screen ◀ ▶ buttons |
| Confirm the answer | Spacebar or Enter | The on-screen ✓ button, or click the marker's cell again |
| Start, continue | Spacebar | Click the button |

- Both inputs always work. There is no setting.
- Each arrow press is one hop with a short "boing". Holding a key does not repeat.
- The marker starts on the value of the part she is given: 0 if nothing is given, 5 for a five-token, 10 for a ten-token, the cup's number for a cup.

### Touch and small screens

Required before the link is shared. These are known pitfalls of web pages on phones, taken from published mobile-web checklists so they are not rediscovered by trial.

| Rule | Reason |
|---|---|
| A tap does everything a click does; on touch devices a large "Hop" button and a "Done" button stand in for the right arrow and spacebar | Phones have no keys |
| Controls react when the finger lands (pointer down), with `touch-action: manipulation` | Removes the tap delay and double-tap zoom |
| Only the first finger counts; extra touches are ignored | Children rest a palm or thumb on the screen |
| Hover highlights apply only where a real pointer exists | A tap otherwise leaves a stuck highlight |
| Tap targets are at least 48 px, and the 0–20 track wraps into two rows of ten on narrow screens | Small fingers, small screens |
| The page fills the visible screen (`100dvh`), does not scroll or bounce, and keeps clear of notches | Otherwise the track slides under the browser bars |
| Text selection and the long-press menu are off on game controls only | A long press otherwise pops up a copy menu |
| Sound starts only after the first tap on "Play" | Phone browsers block sound before a touch |
| Each release is tried on a real phone and a real tablet | Desktop emulation misses these behaviors |

## 6. Item types

Each skill begins, the first time only, with two or three warm-up rounds that she plays herself: the dots stay on screen, faded, and each hop turns one solid, then she confirms. After the warm-ups a "Your turn" card appears, and from then on the dots flash and hide. The warm-ups for a skill are listed in `config/skills.json`, and they do not count as session items. A plus sign sits between the given part and the loose ones.

### 6.1 Flash

- **Shows:** loose dots for 1.5 seconds, then fades them out over 0.6 seconds. The empty box pulses just before the dots appear. From S2 on, a five-token stays visible and only the loose dots are hidden.
- **Asks:** how many in all.
- **After a miss:** the dots return and stay. The marker goes back to its start, and each hop lights one dot, as in the Cup walkthrough.

### 6.2 Cup

- **Shows:** a cup with a numeral on it, and 1–3 loose dots beside it. The loose dots stay visible.
- **Asks:** how many in all.
- **Marker starts:** on the cup's number.
- **After a miss:** the marker returns to the cup's number. Each right-arrow press makes one hop and lights up one loose dot. When the dots are used up, the marker stops, the numeral grows, and she confirms.

### 6.3 Ten-token

- **Shows:** one ten-token and 1–9 loose ones, flashed like the Flash type. The token stays visible.
- **Asks:** how many in all.
- **Marker starts:** on 10.
- **After a miss:** the marker makes one big jump from 0 to 10 by itself, then she hops the ones as in the Cup walkthrough.
- **Order:** the number of ones is random each time, never one more than the last item.

### 6.4 How many more

- **Shows:** the marker on a start number and a flag on a later number, both on the track. Above the track sits a small counter row numbered 0–10.
- **Asks:** "How many hops?" She sets the counter with the arrows and confirms.
- **Then:** the marker makes that many hops. If it lands on the flag, the item is correct.
- **After a miss:** the marker returns to the start. She hops it to the flag herself, and each hop fills one cell of the counter. When it reaches the flag, the counter's numeral grows and she confirms.

### 6.5 Rules shared by all types

- A miss makes no error sound and shows no cross.
- The walkthrough cannot be skipped and ends on the right answer.
- A missed item comes back once, at least three items later in the same session.
- Only the first attempt is recorded as correct or not.

## 7. Skill ladder

| Skill | Type | Content | Track |
|---|---|---|---|
| S1 | Flash | 1–5 dots in dice-like patterns | 0–10 |
| S2 | Flash | five-token plus 1–5 dots (6–10) | 0–10 |
| S3 | Cup | cup 3–8 plus 1–2 dots, total at most 10 | 0–10 |
| S4 | Cup | cup 5–9 plus 1–3 dots, total at most 12 | 0–20 |
| S5 | Ten-token | ten plus 1–9 | 0–20 |
| S6 | Cup | cup 11–17 plus 1–3 dots | 0–20 |
| S7 | How many more | start 3–9, flag 1–6 further on | 0–20 |

Each skill is one entry in `config/skills.json`:

```json
{"id": "S7", "type": "more", "start": [3, 9], "gap": [1, 6], "track": 20, "enabled": true}
```

Stages planned beyond S7, entered in the config with `"enabled": false` until built:

| Skill | Type | Content |
|---|---|---|
| S8 | How many more | flag fixed at 10 (pairs that make 10) |
| S9 | Ten-token | up arrow as a jump of ten; two tens plus ones |
| S10 | Cup | 9 + n and 8 + n, crossing ten |
| S11 | New type | doubles and near-doubles |
| S12 | New type | a 0–100 track |

### Placement

- Her first sessions are a placement run that looks like normal play.
- Each skill, in ladder order, gets 6 probe items. With 5 or more correct on the first try, the skill is marked passed and the run moves up.
- The first skill she does not pass becomes her current skill.
- Skills passed by placement stay in the review mix, and the falling-back rule still applies to them.

### Progress

- **Session mix:** about 70% items from the current skill, 30% from skills already passed.
- **Passing a skill:** at least 85% first-try correct over the last 20 items of that skill, reached on two different days.
- **Falling back:** below 50% over 10 items returns her to the previous skill for the next session.
- Response times play no part in passing. They are recorded for the parent page only.

## 8. Session

1. Start screen: one large "Play" button and a "Sticker book" button.
2. 12 items, about 3–4 minutes.
3. End: she picks one sticker from three, and it drops into the book with a chime.
4. After 2 sessions in a day, the start screen shows only the sticker book and "See you tomorrow".

## 9. Stickers and tokens

- **Stickers:** one per finished session, whatever the accuracy. Emoji in her taste, for example 👑 🦄 🧁 🫧 💎 🌸 🦋 🌈 🎀 ⭐.
- **Sticker book:** a grid showing every sticker earned, in order. No arranging in version 1.
- **Tokens:** each child picks one set at first launch. Each set has a one, a five, and a ten, for example 🫧 / 🌸 / 👑. The set changes only from the parent page.
- **Themes:** `config/themes.json` holds several token and sticker sets (for example princess, animals, space, vehicles), so other children have something that suits them.
- **Meaning of a token:** the first time a five or ten appears, a card shows that many ones, an equals sign, the token, and its numeral (●●●●● = 🌸 = 5). The card stays until she presses ✓.
- **Token label:** a token always has its numeral beneath it, the way the cup carries its number.
- **Token jump:** in warm-ups and walkthroughs, the marker makes one big jump from 0 to the token's number before the hops begin.

## 10. Sound and words

- **Sounds:** "boing" on each hop, a soft tone on landing, a chime on a sticker. One switch turns them all off.
- **Words on screen:** "How many?", "How many hops?", "Your turn", "Play", "Sticker book", "See you tomorrow".
- **Speech:** only the speaker button. The math itself is silent.
- **Number names:** off. See open question 1.

## 11. Data

Everything is stored in the browser's local storage on that laptop. Clearing browser data erases it, so the parent page has an export button.

One record per attempt:

```json
{
  "time": "2026-11-20T16:02:11",
  "session": 14,
  "skill": "S3",
  "item": {"type": "cup", "given": 6, "added": 2},
  "answer": 8,
  "given_answer": 7,
  "first_try": false,
  "response_ms": 5400,
  "input": "keys",
  "hops": 1
}
```

Also stored: current skill, per-skill history, stickers earned, token set, settings.

### Profiles

- The start screen asks "Who is playing?" when a device has more than one profile. A profile is a first name or nickname plus a sticker as its picture.
- Each profile has its own progress, stickers, and token set. Profiles exist only on that device.

### Keeping progress safe

- **Format version:** saved data carries a version number, and each release upgrades older data in place. An update never wipes a child's stickers.
- **Safari's seven-day rule:** Safari deletes a site's saved data after seven days of browser use without a visit to that site. Games added to the home screen are exempt.
- **What the game does about it:** the manifest makes "Add to Home Screen" work, and the parent page explains it in one line and offers export.
- **No collection:** nothing leaves the device. There are no accounts, analytics, or cookies.

## 12. Parent page

**Settings (four):**

| Setting | Default |
|---|---|
| Items per session | 12 |
| Sounds | on |
| Token set | her choice |
| Current skill | set by placement; can be overridden by hand |

**Shows:**

- Current skill and first-try accuracy for each skill.
- Median response time per skill, as a rough signal of counting versus knowing.
- The most-missed items.
- Sessions per day.
- Buttons: export data, import data, reset, add or remove a profile.

**Fixed in `config/settings.json`, not on the page:** flash duration (1500 ms) and fade (600 ms), sessions per day (2), session mix (70/30), mastery rule, placement rule (6 probes, 5 to pass), requeue distance (3 items).

## 13. Build order and testing

1. **Prototype A (built):** track, marker, both inputs, the Flash, Cup, and Ten-token types, and the placement run over S1–S6. No stickers, no token choice (the first theme is used). A bare parent page shows the placement result, with download and erase buttons.
2. Watch three sessions without helping. Record:
   - Does she ask to play again?
   - Arrows or trackpad, and is either one a struggle?
   - Does she count on the screen with a finger?
   - Does she follow the walkthrough after a miss, or mash keys?
   - Where does placement put her, and does that match what you see at home?
3. **Prototype B:** add stickers, the sticker book, and progress rules.
4. **Version 1:** the How many more type (S7) and the parent page.
5. **Sharing release:** touch rules from section 5, profiles, extra themes, the manifest, and data versioning. Tried on a real phone and tablet before the link goes out.

Change one thing per version and note it in section 17.

### Testing switches

Added to the game's address: `?reset` erases saved data, `?nolimit` lifts the two-sessions-a-day limit, `?speed=4` shortens the pauses. `tests/play.py` plays the game with a simulated child.

## 14. Later, not in version 1

- Stages S8–S12 from section 7.
- A track with only 0, 5, 10, 15, 20 labeled.
- Arranging stickers on a page.
- Recorded parent voice in place of browser speech.

## 15. Open questions

1. **Number names.** Should the game say "fifteen" once after a correct teen answer? It would link the word to the numeral, and it conflicts with keeping the math silent. Currently off.
2. **Flash with arrows.** On S1 the marker starts at 0, so answering 4 takes four presses. If that turns into counting, start the marker elsewhere or favor clicking for this type.
3. **Flash duration.** Raised from 1 second to 1.5 seconds plus a fade after the first adult try. Long enough to survive a blink, short enough that five dots are hard to count one by one. Adjust after watching her.

## 16. Observations at home

Dated notes on what a child does away from the game decide where the ladder goes next. They are kept in a private `NOTES.md` that is never committed to the public repository.

## 17. Change log

- 0.1 (2026-11-15): first version.
- 0.2 (2026-11-18): placement run replaces starting at S1; How many more type and S7 added; S8–S12 listed as disabled config entries; parent override of current skill; Prototype A covers three item types; observations section added.
- 0.3 (2026-11-18): sharing by link added as a goal; touch and small-screen rules; profiles; several themes; data format version; Safari storage rule and home-screen manifest; observations moved to a private notes file; sharing release added to the build order.
- 0.4 (2026-11-18): Prototype A built. On-screen ◀ ▶ ✓ buttons added; the Flash walkthrough now uses one hop per dot like the others; examples are set per skill; a bare parent page was brought forward; testing switches documented.
- 0.5 (2026-11-18): after the first adult playthrough. Hands-on warm-ups and a "Your turn" card replace the self-playing "Watch" examples; the flash is longer and fades out; the track is one color with a landmark at every five.
- 0.6 (2026-11-19): the token introduction no longer passes by itself; it shows ones = token = numeral and waits for ✓. Tokens carry their numeral. The big jump from 0 now applies to the five-token as well as the ten.
