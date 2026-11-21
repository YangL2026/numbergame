# Number game: specification

Version 0.8, 2026-11-21. Prototype A is built; this version revises it after her first session. Every number here is a starting value to tune after watching her play.

## 1. Goal

She chooses to play, and while she plays she is doing the thinking herself.

The game teaches four things that come before addition facts:

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
| Nothing on screen is disconnected from the math; the characters only react to answers | iReady's monsters did things unrelated to the problem, and the problem became the toll she paid to see them |
| The structure of a problem appears while its content is easy; a stage changes one thing at a time | The flower stage changed three things at once and lost her |
| Where a count starts is her move, never the game's | She wanted to go back to 0 when the marker began at 5; starting from the start is the habit to replace |
| A miss starts a walkthrough that she performs | The "boing" number-line jumps are what has worked at home |
| A miss belongs to the bunny, not to her; the teacher never shows a cross | She left session one saying she didn't understand |
| She keeps succeeding about four times in five | Session one ended in a run of misses on the stage she had just failed |
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
  PROGRESS.md          step list and dated log
  index.html           child screen: start, play, sticker book
  parent.html          progress, settings, export
  manifest.webmanifest lets a phone or tablet add the game to its home screen
  config/
    skills.json        skill ladder, placement and mastery rules
    settings.json      defaults for everything in section 13
    themes.json        sticker sets and later token sets
  engine/
    session.js         runs one session
    scheduler.js       picks the next item
    store.js           local storage, export, import
    audio.js           sound effects and the speaker button
    reward.js          sticker award and sticker book
  games/
    track.js           the number track and the bunny on it (shared)
    equation.js        the equation strip (shared)
    characters.js      draws the bunny and the teacher with their faces
    flash.js           item type 1
    cup.js             item type 2
    ten.js             item type 3
    more.js            item type 4
  assets/
    characters.svg     teacher drawing
    bunny-sheet.svg    the bunny's four faces, for reference
  tests/
    play.py            plays the game with a simulated child
```

- The engine decides what comes next. Files in `games/` only draw an item and report the answer.
- Changing the ladder, ranges, or session length means editing `config/`, not code.
- Sounds are generated in the browser. The characters are drawn in SVG, so no image files are needed.

## 4. Characters

Two rabbits, both drawn in code (`games/characters.js`), in the style of `assets/`.

- **The student:** a small white bunny with big eyes, pink cheeks, and a bow. She is the one answering, with the child's help. She is also the marker: she stands on the number track and hops along it.
- **The teacher:** a larger grey rabbit with round glasses, a mustache, a blue vest, and a bow tie. He asks the question and checks the answer.

**Faces.** The bunny has four: neutral, thinking (eyes up, small "o" mouth, a faint question mark), happy (eyes closed, open smile, two sparkles), and not-yet (ears drooped, eyes down, small frown). The teacher has three: neutral, pleased (smile), and not-yet (one eyebrow raised; never stern).

**What they do, and only this:**

| Moment | Bunny | Teacher |
|---|---|---|
| Item appears | neutral, standing on 0 | bubble says "Start at 5" (the first number) |
| Child puts the bunny on the first number and confirms | neutral, small bounce | neutral; the first box gets a tick |
| Dots flash, child moves the bunny | thinking | bubble says "How many?" |
| Child confirms, answer is right | happy, little bounce | pleased, green tick on the answer, bubble says "Yes!" |
| Child confirms, answer is wrong | not-yet | not-yet face, bubble says "Not yet", no cross, no sound |
| Walkthrough | thinking while hopping, happy at the end | pleased, tick on the corrected answer |
| Session ends | happy | hands over the sticker |

**Rules.** The characters never act on their own: no idle animation, no jokes between items, no reaction that is not to an answer. The only "funny thing" in the game is the bunny being pleased when the answer is right.

**Names.** At first launch the child picks the bunny's name from a short list on screen (no typing). The teacher's name is fixed in `config/settings.json`; the parent says it aloud so the child can use it.

## 5. Screen

- **Top left:** the teacher with his speech bubble. The bubble holds the question ("How many?") and, after an answer, "Yes!" or "Not yet". A small speaker button beside it reads the bubble aloud.
- **Top right:** a row of 8 small circles that fill in as items finish, so she can see the session is short.
- **Middle:** the equation strip (section 6).
- **Bottom:** the number track, with the bunny standing on one cell.
- No score, timer, or percentage.

### Number track

- Runs 0–10 for skills S1–S3 and 0–20 from S4 on.
- All cells share one neutral color, with every numeral shown. Every fifth cell (0, 5, 10, 15, 20) is slightly darker as a quiet landmark.
- The bunny stands on one cell. The cell under her is outlined.

## 6. The equation strip

Every item is shown as the same three-part strip, the shape of a school worksheet line:

```
[ first part ]  +  [ dots box ]  =  [ answer ]
```

- **First part:** what she starts with. A plain "0" in S1, a small numeral 1–3 in S2, a hand (✋ with "5" under it) in S3, a cup with its number in S4 and S5, two hands (✋✋ with "10") in S6, and so on. This is where she puts the bunny before anything is added.
- **Dots box:** the loose ones. In Flash and Ten-token items the dots flash and fade; in Cup items they stay.
- **Answer:** an empty box with a faint "?". When she confirms, the numeral under the bunny flies up into it. A right answer gets a green tick beside the box. A wrong answer wobbles, fades, and is replaced by the right one at the end of the walkthrough.

The strip appears in S1, while the content is trivial, so that later stages change only what is in the first box.

### How an item runs: two steps, both hers

**Start.** The strip appears with the first part and an empty dots box. The bunny stands on 0, the first box highlights, and the teacher's bubble says "Start at 5" (whatever the first number is). She moves the bunny there, by clicking the cell or hopping, and presses ✓. The first box gets a tick. On S1 the number is 0, so she only presses ✓.

**Add.** Only now do the dots appear in the box, then flash and fade (or stay, for Cup items). The bubble changes to "How many?" and the bunny's face turns to thinking. She hops the bunny and confirms. The number under the bunny flies into the answer box and the teacher reacts (section 4).

Keeping the two moments apart is the point: "where I start" is settled, by her, before "how many I add" appears. Pressing ✓ on a cell other than the first number does nothing but a small wobble; the step cannot be skipped.

## 7. Input

| Action | Keys | Trackpad |
|---|---|---|
| Move the bunny one cell | Left and right arrows | Click a cell (the whole column above it counts), or the on-screen ◀ ▶ buttons |
| Confirm the answer | Spacebar or Enter | The on-screen ✓ button, or click the bunny's cell again |
| Start, continue | Spacebar | Click the button |

- Both inputs always work. There is no setting.
- Each arrow press is one hop with a short "boing". Holding a key does not repeat.
- After the Start step, the bunny stands on the first number; from there every hop is counting on. Hopping back below it is allowed and recorded (a hop count much larger than the dots means she counted from 0).

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

## 8. Item types

Each skill begins, the first time only, with two or three warm-up rounds that she plays herself: the Start step as usual, then the dots stay on screen, faded, and each hop turns one solid, then she confirms. After the warm-ups a "Your turn" card appears, and from then on the dots flash and hide. The warm-ups for a skill are listed in `config/skills.json`, and they do not count as session items.

### 8.1 Flash

- **Shows:** loose dots in the dots box for 1.5 seconds, then fades them out over 0.6 seconds. The box pulses just before the dots appear. The first part is "0" (S1), a numeral 1–3 (S2), or a hand (S3).
- **Asks:** how many in all.
- **After a miss:** the dots return, faded. The bunny goes back to the first number, and each hop lights one dot.

### 8.2 Cup

- **Shows:** a cup with a numeral on it as the first part, and 1–3 loose dots that stay visible.
- **Asks:** how many in all.
- **After a miss:** the bunny returns to the cup's number. Each right-arrow press makes one hop and lights up one loose dot. When the dots are used up, the bunny stops, the number flies into the answer box, and she confirms.

### 8.3 Ten-token

- **Shows:** two hands (10) as the first part and 1–9 loose ones, flashed like the Flash type.
- **Asks:** how many in all.
- **After a miss:** the bunny returns to 10, then she hops the ones as in the Cup walkthrough.
- **Order:** the number of ones is random each time, never one more than the last item.

### 8.4 How many more

- **Shows:** the bunny on a start number and a flag on a later number, both on the track. The strip reads `[start] + [ ? ] = [flag]`, with the empty middle box as the thing to find. A small counter row numbered 0–10 sits above the track.
- **Asks:** "How many hops?" She sets the counter with the arrows and confirms.
- **Then:** the bunny makes that many hops. If she lands on the flag, the item is correct.
- **After a miss:** the bunny returns to the start. The child hops her to the flag, and each hop fills one cell of the counter. On reaching the flag the count flies into the middle box.

### 8.5 Rules shared by all types

- A miss makes no error sound and shows no cross.
- The walkthrough cannot be skipped and ends on the right answer.
- A missed item comes back once, at least three items later in the same session.
- Only the first attempt is recorded as correct or not.

## 9. Skill ladder

| Skill | Type | First part | Content | Track |
|---|---|---|---|---|
| S1 | Flash | 0 | 1–5 dots in dice-like patterns | 0–10 |
| S2 | Flash | 1–3 | plus 1–3 dots; the start is not 0 | 0–10 |
| S3 | Flash | ✋ 5 | plus 1–5 dots (6–10) | 0–10 |
| S4 | Cup | cup 3–8 | plus 1–2 dots, total at most 10 | 0–10 |
| S5 | Cup | cup 5–9 | plus 1–3 dots, total at most 12 | 0–20 |
| S6 | Ten-token | ✋✋ 10 | plus 1–9 | 0–20 |
| S7 | Cup | cup 11–17 | plus 1–3 dots | 0–20 |
| S8 | How many more | start 3–9 | flag 1–6 further on | 0–20 |

Each skill is one entry in `config/skills.json`:

```json
{"id": "S8", "type": "more", "start": [3, 9], "gap": [1, 6], "track": 20, "enabled": true}
```

Stages planned beyond S8, entered in the config with `"enabled": false` until built:

| Skill | Type | Content |
|---|---|---|
| S9 | How many more | flag fixed at 10 (pairs that make 10) |
| S10 | Ten-token | up arrow as a jump of ten; two tens plus ones; themed tokens replace hands |
| S11 | Cup | 9 + n and 8 + n, crossing ten |
| S12 | New type | doubles and near-doubles |
| S13 | New type | a 0–100 track |

### Placement

- Her first sessions are a placement run that looks like normal play.
- A session probes one skill: its warm-ups, then 6 probe items, with the remaining items drawn from skills already passed. With 5 or more probes correct on the first try, the skill is passed and the next session probes the next skill.
- The first skill she does not pass becomes her current skill.
- Skills passed by placement stay in the review mix, and the falling-back rule still applies to them.

### Progress

- **A new skill starts only at the start of a session**, with its warm-ups. It never appears partway through one.
- **Session mix:** about half the items from the current skill, half from skills already passed.
- **Keeping her succeeding:** if she misses 2 of the last 4 current-skill items, the rest of that session comes from passed skills, except for one more current-skill item near the end. The aim is at least 4 right in 5 across a session.
- **Passing a skill:** at least 85% first-try correct over the last 20 items of that skill, reached on two different days.
- **Falling back:** below 50% over 10 items returns her to the previous skill for the next session.
- Response times play no part in passing. They are recorded for the parent page only.

## 10. Session

1. Start screen: the bunny and the teacher, one large "Play" button, and a "Sticker book" button.
2. 8 items, about 2–3 minutes.
3. End: the teacher holds out three stickers; she picks one, and it drops into the book with a chime.
4. After 2 sessions in a day, the start screen shows only the sticker book and "See you tomorrow".

## 11. Stickers and tokens

- **Stickers:** one per finished session, whatever the accuracy. Emoji in her taste, for example 👑 🦄 🧁 🫧 💎 🌸 🦋 🌈 🎀 ⭐.
- **Sticker book:** a grid showing every sticker earned, in order. No arranging in version 1.
- **Hands for five and ten:** through S9 the five is a hand and the ten is two hands, drawn in the characters' style, each with its numeral beneath. A hand needs no explanation; she already knows 5 + 5 = 10 on her fingers.
- **Themed tokens:** from S10 on, a child's chosen token set (for example 🌸 for 5 and 👑 for 10) can replace the hands, introduced the same way: the strip shows the token with its numeral, and she puts the bunny on that number in the Start step. No equivalence card.
- **Themes:** `config/themes.json` holds several sticker sets and token sets (for example princess, animals, space, vehicles), so other children have something that suits them.

## 12. Sound and words

- **Sounds:** "boing" on each hop, a soft tick when the Start step is confirmed, a soft two-note tone on a tick, a chime on a sticker. One switch turns them all off. A wrong answer makes no sound.
- **Words on screen:** "Start at 5" (any number), "How many?", "How many hops?", "Yes!", "Not yet", "Your turn", "Play", "Sticker book", "See you tomorrow", and the names.
- **Speech:** only the speaker button, which reads the teacher's bubble. The math itself is silent.
- **Number names:** off. See open question 1.

## 13. Data

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

Also stored: current skill, per-skill history, stickers earned, bunny's name, token set, settings.

### Profiles

- The start screen asks "Who is playing?" when a device has more than one profile. A profile is a first name or nickname plus a sticker as its picture.
- Each profile has its own progress, stickers, bunny name, and token set. Profiles exist only on that device.

### Keeping progress safe

- **Format version:** saved data carries a version number, and each release upgrades older data in place. An update never wipes a child's stickers.
- **Safari's seven-day rule:** Safari deletes a site's saved data after seven days of browser use without a visit to that site. Games added to the home screen are exempt.
- **What the game does about it:** the manifest makes "Add to Home Screen" work, and the parent page explains it in one line and offers export.
- **No collection:** nothing leaves the device. There are no accounts, analytics, or cookies.

## 14. Parent page

**Settings (four):**

| Setting | Default |
|---|---|
| Items per session | 8 |
| Sounds | on |
| Token set | her choice (used from S10) |
| Current skill | set by placement; can be overridden by hand |

**Shows:**

- Current skill and first-try accuracy for each skill.
- Median response time per skill, as a rough signal of counting versus knowing.
- The most-missed items.
- Sessions per day.
- Buttons: export data, import data, reset, add or remove a profile.

**Fixed in `config/settings.json`, not on the page:** flash duration (1500 ms) and fade (600 ms), sessions per day (2), session mix (50/50), the keep-succeeding rule (2 misses in 4), mastery rule, placement rule (6 probes, 5 to pass), requeue distance (3 items), the teacher's name.

## 15. Build order and testing

1. **Prototype A (built):** track, marker, both inputs, the Flash, Cup, and Ten-token types, and the placement run over S1–S6. Her first session showed the five-token stage was not understood and the game did not feel like a game.
2. **Prototype A2 (next):** the equation strip, the Start step, the bunny as marker with her faces, the teacher with his bubble, the answer flying into its box, the S2 stage, hands for five and ten, name choice, 8-item sessions, and the kinder scheduling. No stickers yet.
3. Three sessions with her, watched without helping. Record:
   - Does she ask to play again?
   - Arrows or trackpad, and is either one a struggle?
   - Does she count on the screen with a finger?
   - After a miss, does she follow the faded dots, or press keys at random?
   - Does the hand make sense without explanation?
   - Where does placement put her, and does that match what you see at home?
4. **Prototype B:** stickers and the sticker book.
5. **Version 1:** the How many more type (S8) and the full parent page.
6. **Sharing release:** touch rules from section 7, profiles, extra themes, the manifest, and data versioning. Tried on a real phone and tablet before the link goes out.

Change one thing per version and note it in section 19.

### Testing switches

Added to the game's address: `?reset` erases saved data, `?nolimit` lifts the two-sessions-a-day limit, `?speed=4` shortens the pauses. `tests/play.py` plays the game with a simulated child.

## 16. Later, not in version 1

- Stages S9–S13 from section 9.
- Fading the Start step: once she places the bunny right ten times in a row at a stage, the bunny could go there by herself.
- A track with only 0, 5, 10, 15, 20 labeled.
- Arranging stickers on a page.
- Recorded parent voice in place of browser speech.
- A second student character to choose from (kitten, unicorn).

## 17. Open questions

1. **Number names.** Should the game say "fifteen" once after a correct teen answer? It would link the word to the numeral, and it conflicts with keeping the math silent. Currently off.
2. **"0 +" in S1.** The equation strip starts with a plain 0 so that the shape is learned early. If the 0 itself confuses her, S1 can show the first box empty.
3. **The track allows counting from 0.** Nothing stops her hopping back to 0 and counting up through the first number. The hidden dots are the defense: she still has to remember how many to add. Hop counts in the log will show whether she does it.
4. **The bunny's face at track size.** She stands on a cell about 120 px tall, so her face is small. If the faces do not read at that size, a larger copy of her face can sit beside the equation strip.
5. **Flash duration.** 1.5 seconds plus a fade. Long enough to survive a blink, short enough that five dots are hard to count one by one. Adjust after watching her.

## 18. Observations at home

Dated notes on what a child does away from the game decide where the ladder goes next. They are kept in a private `NOTES.md` that is never committed to the public repository.

## 19. Change log

- 0.1 (2026-11-15): first version.
- 0.2 (2026-11-18): placement run replaces starting at S1; How many more type and S7 added; S8–S12 listed as disabled config entries; parent override of current skill; Prototype A covers three item types; observations section added.
- 0.3 (2026-11-18): sharing by link added as a goal; touch and small-screen rules; profiles; several themes; data format version; Safari storage rule and home-screen manifest; observations moved to a private notes file; sharing release added to the build order.
- 0.4 (2026-11-18): Prototype A built. On-screen ◀ ▶ ✓ buttons added; the Flash walkthrough now uses one hop per dot like the others; examples are set per skill; a bare parent page was brought forward; testing switches documented.
- 0.5 (2026-11-18): after the first adult playthrough. Hands-on warm-ups and a "Your turn" card replace the self-playing "Watch" examples; the flash is longer and fades out; the track is one color with a landmark at every five.
- 0.6 (2026-11-19): the token introduction no longer passes by itself; it shows ones = token = numeral and waits for ✓. Tokens carry their numeral. The big jump from 0 now applies to the five-token as well as the ten.
- 0.7 (2026-11-20): after her first session. Every item is an equation strip from S1 on; the bunny is the marker and makes a visible opening jump to the first number; the answer flies into its box and the teacher ticks it; a student bunny and a teacher rabbit, with faces, replace the plain screen (design rule revised: nothing disconnected from the math); hands replace the flower and crown through S8, and the equivalence card is dropped; a new skill starts only at a session start; keep-succeeding rule; 8 items per session; placement probes one skill per session.
- 0.8 (2026-11-21): the Start step. She puts the bunny on the first number herself and confirms before the dots appear (the game no longer jumps for her); the teacher's bubble says "Start at N"; a new S2 stage (start at 1–3) sits between the 0 stage and the hand, and later skills are renumbered. Prototype A2 built from this version; the hands are emoji (✋) for now, to be redrawn in the characters' style later.
