# Four-minute What If story formula

## Default format and promise

The default is a **complete 3:30–4:30 story**, targeting **4:00 (240 seconds)**. It is NOT a 15–25 second teaser and must not end with a cliffhanger, a "part two", or an unanswered central question. Short format is only for an explicit user request (set `format: "short"` in episode.json).

A question is the opening premise, **not the whole episode**. Give an identifiable protagonist a goal, concrete constraints, choices and consequences, and a meaningful conclusion. Tell an engaging original story rather than reciting a generic list of superpowers.

## Story spine (recommended timings)

| Part | Time | Job |
|---|---:|---|
| 1. Hook / flash-forward | 0:00–0:20 | Show an intriguing consequence or moment of jeopardy; start with action |
| 2. What if + rules | 0:20–0:50 | State the question and 2–3 explicit conditions or limitations |
| 3. Discovery | 0:50–1:25 | Follow the character testing the rules; establish a goal and stakes |
| 4. Journey / escalating choices | 1:25–2:15 | A chain of cause → choice → consequence, changing locations or relationships when justified |
| 5. Reality check | 2:15–2:55 | Bring in two or three *verified* facts/numbers and explain what remains speculative |
| 6. Crisis / decision | 2:55–3:35 | An irreversible cost or difficult choice; protagonist acts, rather than watching |
| 7. Ending / reflection | 3:35–4:00 | Show the outcome, resolve the central narrative, and earn one closing thought |

These are directional targets. Let story logic determine the exact lengths, not rigid timestamp compliance.

## Story requirements

1. **A central character with a goal.** What do they want before the hypothetical? What changes after it?
2. **Conditions established early.** Define what the world allows and does not allow; obey the rules thereafter. The hypothesis may break physics, but its consequences must follow consistently from the premise.
3. **A causal journey.** Each major scene must change the character's knowledge, relationships, options or stakes. No repetitive montage of unrelated demonstrations.
4. **Evidence woven into events.** Verify scientific or historical claims with actual sources in `science`, include units and assumptions, distinguish known facts from story assumptions. Don't invent data to support the premise.
5. **Real ending.** Resolve the external problem and show what it costs, saves, or teaches the protagonist. A final thought-provoking sentence is fine, but not a cliffhanger replacing the conclusion.
6. **Visual direction.** Set the emotional tone and location of each sequence; characters need meaningful acting and camera choices, not simply moving mouths to narration.

## Script and pace

Aim for **approximately 500–620 spoken words** at a natural storytelling pace around **130–155 words/minute**, then adjust using the rendered voice duration, not word count alone. `script` is an array of scenes or beats: each entry may be several sentences, with an identifiable `beat` and `text`. Use second-person or third-person consistently. Vary sentence length; leave breathing room for moments that matter.

Plan **about 35–65 shots** rather than 9–14 (adapt to action); many shots will be 3–8 seconds, with occasional longer moving shots and quicker cuts during the hook or crisis. Avoid 200+ cuts or artificially keeping 27 cuts/min for the whole story. A calm emotional moment can hold if something meaningful develops inside it.

At the draft stage define:
- `format: "story"` (default if absent for new episodes)
- `targetSeconds: 240`
- `story`: an object with `protagonist`, `goal`, `conditions`, `stakes`, `turningPoint`, and `resolution`
- `script`: 7–14 scene or beat entries with `beat`, `text`, optional `location` and `intent`
- `science`: sources, claim, working/assumptions

After voice generation, adjust pacing/story and rerun voice only when necessary. Maintain shot cue alignment with `words.json`; don't assume fixed timings.

## Ending checklist

- Can viewers explain what happened to the protagonist?
- Did established rules shape the outcome?
- Did the factual section change the story rather than interrupt it?
- Is there a demonstrated resolution, not merely a question or ominous blackout?
- Does the final image communicate the ending even without the voice?

## Short episodes

Legacy 15–25 second examples remain valid demonstrations. To intentionally make one, use `format: "short"`; the existing compressed seven-beat, 45–65-word format may be followed. Don't retrofit the shipped Rewind and CopyPaste examples into four minutes by stretching their timelines.
