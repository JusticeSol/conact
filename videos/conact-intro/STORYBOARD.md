---
format: 1080x1080
duration: 20s
message: "When an AI agent's work is disputed, CONACT settles it — an impartial AI verdict, and escrow that moves either way on-chain"
arc: Demo Loop — question → product intro → demo cycle 1 (verdict) → demo cycle 2 (override) → brand
audience: crypto/AI builders and hackathon judges scrolling X or LinkedIn
mode: autonomous
music: none
---

## Video direction

**This film is silent** — no narration, no BGM, no SFX. Every reveal cue that would
normally be timed to a spoken word is instead timed to the **on-screen text beat**:
a line appears, it gets its own held moment to be read, then the next piece arrives.
Read-time is the metronome. Budget ~0.55s minimum of stillness per short line before
anything else moves; a viewer who has to read and watch simultaneously does neither.

**Palette system** (roles from `frame.md`, nothing invented):

- Ground is always `bg-primary` `#F5F0E8`. `bg-secondary` `#EDE8DC` for any inset panel.
- Ink `text-primary` `#1A1712` for display type; `text-secondary` `#7A6A52` for body;
  `accent` `#9A8A72` for mono micro-labels.
- `line` `#C8BFA8` hairline is the **only** structural device in the whole film — no
  borders, no boxes, no shadows, no fills. This is the brand's own rule and it holds.
- **Sage `approve` `#5A8A5A` and clay `reject` `#A85440` are the only saturated colors
  in twenty seconds**, and they are the color story: frame 3 is sage, frame 4 answers
  it in clay. Never use either decoratively — they only ever mean approve or reject.

**Motion grammar.** Long-tail settles, `power3` default; `expo.out` only on a fast
arrival. No overshoot, no bounce, no elastic anywhere — the brand is restrained and
bouncy type would break it instantly. Entrances are `fromTo` with explicit from-state.
Captured UI never tilts, never gets perspective, never gets a drop shadow: these are
flat cropped panels on paper, because the product itself has zero shadow and zero fill.

**Reveal model.** Nothing front-loads. At t=0 each frame carries only its first cue;
every further piece — a line, a panel, a row, the score — arrives on its own text beat,
weighted into the back half of the shot.

**Rhythm / held-frame allocation.** Frames 1 and 5 are **held frames** — they resolve
early and then sit completely still, and that stillness is the point (frame 1 is the
question hanging in the air, frame 5 is a clean screenshot-able end card). Frames 2–4
carry the motion. Frame 3 holds its last ~1.2s before frame 4 contradicts it; that
pause is what makes the override land.

**Aliveness budget.** Essentially zero. No jitter, no breathing, no ambient drift, no
back-half pan or push. This film prefers absolute stillness — on a warm paper ground
with serif type, any idle motion reads as cheapness. A held frame here is held.

**Negative list — never appears:** browser chrome, scrollbars, the `Connect Wallet`
pill, the Next.js dev badge, real cursors, glows, blooms, gradients, purple-blue "AI"
haze, geometric rings, drop shadows, rounded card stacks, floating bokeh, stock
iconography. Plus both motion failure modes: **slideshow** (dump at 25% then freeze)
and **screensaver** (everything drifting independently).

**Caption band.** No captions in this film, but the bottom ~17% (below y≈896 of 1080)
stays clear of anything load-bearing anyway — square feed crops eat that edge.

## Frame 1 — Who settles it

- scene: One question lands in Playfair on bare paper; "an AI" swaps in as the last two words
- voiceover: ""
- duration: 3.5s
- transition_in: cut
- status: animated
- src: compositions/frames/01-who-settles-it.html
- type: hook
- persuasion: Pain validation
- beat: tension + curiosity
- blueprint: kinetic-type-beats (Adapt)
- focal: none — typography only
- roles: none
- asset_candidates:

narrativeRole: Opens on the unanswered question the whole product exists to answer. No UI, no logo, no product name — just the tension. The viewer supplies their own bad experience with disputed freelance work; the swap to "an AI" is what makes it new.
keyMessage: Someone has to judge the work — and now the worker isn't a person.

Adapt: keep the **hard-cut beat swap** signature — each phrase alone on a bare field, replaced on an instant cut, no fade between beats. Change: three beats not five, and the third beat stays rather than swapping out, because it is the question the rest of the film answers.

Scene 1 (0.0–1.05s): bare `bg-primary`, nothing else. **"You hired an agent."** enters as a **per-word staggered reveal** (`dynamic-content-sequencing`) on a long-tail settle, set in display type, centered on the golden upper-third. Then still. Centered template, type occupies ~55% of frame width, 2 depth layers (paper, ink).
Scene 2 (1.05–1.95s): **hard-cut flash swap** (`discrete-text-sequence`) — "You hired an agent." is gone in one frame and **"It delivered."** occupies the identical baseline. No fade, no slide; the cut is the beat. Same position, same size — only the words changed.
Scene 3 (1.95–3.5s): **hard-cut swap** again to **"Now who says it's good?"** — but this line arrives ~15% larger and the word **"who"** carries `text-primary` at display weight while the rest sits at `text-secondary`, so the question has a stress. A `line` hairline **self-draws** (`svg-path-draw`) left-to-right beneath it over ~0.5s, then everything holds **dead still** for the final ~0.9s. The stillness is the hook — the question is left hanging.

## Frame 2 — Escrow holds

- scene: The Evaluation Queue column wipes up alongside the on-chain deliverable block; the claim sits over them
- voiceover: ""
- duration: 4s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-escrow-holds.html
- type: product_intro
- persuasion: Friction reduction
- beat: clarity + control
- blueprint: device-surface-showcase (Adapt)
- focal: assets/03-evaluate-queue.png
- roles: 03-evaluate-queue = cutout (the hero panel, cropped to the queue column) · 04-deliverable-review = supporting (cropped to the DELIVERABLE (on-chain) block only)
- asset_candidates: assets/03-evaluate-queue.png — the "Evaluation Queue · 5 pending · 0 resolved" panel, tall column crop; assets/04-deliverable-review.png — the DELIVERABLE (on-chain) block with the ipfs:// CID and BYTES32 HASH

narrativeRole: Answers frame 1 by naming the machinery, and lands the value claim in beat 2 per the reverse-iceberg rule. The real queue and the real IPFS CID do the arguing — this is a working product, not a landing page.
keyMessage: The work is escrowed and the deliverable is already on-chain before anyone judges it.

Adapt: keep the **surface-advances-through-its-own-content** signature — the real UI is the hero and its content steps forward beat by beat. Change: the blueprint's tilted/floating device card is dropped entirely and replaced with **flat cropped panels sitting directly on the paper**, because this brand has zero shadow, zero fill, and no perspective. The crop edge is a `line` hairline, nothing more.

Scene 1 (0.0–1.15s): the **queue column crop** (`03-evaluate-queue`, cropped tight to the panel, x≈440–920 of the source) **wipes up** from its own bottom edge into the left 42% of the canvas, revealed by a mask rather than moved — the panel is drawn at final position and uncovered. Its five queued rows are already inside the image; no per-row animation. Asymmetric 60/40, 3 depth layers (paper → hairline → panel).
Scene 2 (1.15–2.1s): the mono micro-label **`5 PENDING`** reveals above the column in `accent`, and a hairline extends right from the panel's top edge across the empty 58% — establishing where the next piece will land before it lands.
Scene 3 (2.1–3.1s): the **deliverable block** (`04-deliverable-review`, cropped to the `DELIVERABLE (on-chain)` panel only, y≈290–530 of the source) arrives along that hairline into the right field on an `expo.out` fast arrival, then settles. The `ipfs://QmXrWuJhDzg…` CID is legible at this crop — that legibility is the whole reason this asset is here.
Scene 4 (3.1–4.0s): the claim **"The money is already escrowed."** reveals beneath in display type, **per-word staggered** (`dynamic-content-sequencing`), and everything holds. No product name yet.

## Frame 3 — The verdict

- scene: The AI Arbitration button fires, then the sage verdict card assembles — APPROVE, with 92 counting up beside it
- voiceover: ""
- duration: 5.5s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-the-verdict.html
- type: key_feature
- persuasion: Show-don't-tell proof
- beat: tension → relief
- blueprint: agent-progress-theater (Reproduce)
- focal: assets/06-arbitration-verdict.png
- roles: 05-arbitrating = supporting (cropped to the disabled "⟳ Arbitrating…" button) · 06-arbitration-verdict = cutout (cropped to the verdict card header + reasoning)
- asset_candidates: assets/05-arbitrating.png — the disabled "⟳ Arbitrating…" button state, a 0.4s waiting beat; assets/06-arbitration-verdict.png — the verdict card: AI Verdict: APPROVE, 92/100, reasoning paragraph, STRENGTHS ✓ list

narrativeRole: The film's hero beat and the longest. Trigger → wait → receipt. The waiting beat has to be real but brief; the payoff is the verdict card resolving with the score ticking to 92. Everything before this frame is setup for it.
keyMessage: An impartial AI reads the actual deliverable and returns a scored, reasoned verdict.

Reproduce: the blueprint's three-act **trigger → working theater → receipt** is exactly this beat, and the **panel-expands-downward-from-the-trigger** signature is kept intact — the verdict card grows from the button that summoned it.

Scene 1 (0.0–0.85s): the dark `⚖ AI ARBITRATION` button sits alone, centered high, on bare paper — the one dark object in a light film. It takes a **button press** (`press-release-spring`): compression, then recovery. Centered template, the button ~30% of frame width, deliberately under-dense — the emptiness around it is anticipation.
Scene 2 (0.85–1.75s): the button hard-swaps to its real disabled state (`05-arbitrating`, `⟳ Arbitrating…`) via **discrete state swap** (`discrete-text-sequence`), and a single hairline **self-draws** (`svg-path-draw`) left-to-right beneath it as a determinate progress read. This is the wait, and it is allowed to be quiet — but it is capped at 0.9s so it never reads as a hang.
Scene 3 (1.75–3.5s): the **verdict card expands downward** from the button's bottom edge (`anchored-layout-expand`) — height-masked, drawn at final size, counter-translated — and the sage `approve-bg` field arrives with it. The card's header resolves: **`AI Verdict: APPROVE`** in display type, sage. Simultaneously **`92`** runs a **value-scaled counter** 0→92 (`counting-dynamic-scale`) in mono at the card's right, its size growing with the value, landing on `/100`. The count is the payoff — give it the full ~1.2s and let it settle, not snap.
Scene 4 (3.5–4.4s): one real strength row staggers up beneath the header (`spring-pop-entrance`, staggered-group form, smooth settle): **`✓ Exceeds 150-word requirement with substantial value-added content`**, in sage at body scale. If it cannot hold body scale at square, drop the row entirely rather than shrink it — an unreadable line is worse than an absent one.
Scene 5 (4.4–5.5s): everything holds, **completely still**, for 1.1s. No jitter. This is the film's longest silence and it exists so frame 4 can contradict it.

## Frame 4 — Advisory, not final

- scene: The verdict's own footer line lifts out, then the Reject modal cuts in over it — refund figure and the reject() signature
- voiceover: ""
- duration: 4.5s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-advisory-not-final.html
- type: key_feature
- persuasion: Negative contrast
- beat: confidence + control
- blueprint: device-surface-showcase (Adapt)
- focal: assets/07-reject-modal.png
- roles: 07-reject-modal = cutout (cropped twice — once to the ESCROW REFUND strip, once to the transaction preview table)
- asset_candidates: assets/07-reject-modal.png — the Reject deliverable modal: ESCROW REFUND / Returned to your wallet / 4 USDC, and the transaction preview table with Contract AgenticCommerce (ERC-8183), Function reject(uint256,bytes32,bytes), reasonHash 0x0695fa553c5be4c1…

narrativeRole: The turn, and the frame that makes the product trustworthy instead of gimmicky. The AI just said APPROVE — and the poster can still reject. The chain keeps the reason either way. This is the second demo cycle and it deliberately contradicts the first.
keyMessage: The verdict is advisory; the human keeps the override and the chain keeps the record.

Adapt: keep the **real-surface-does-the-arguing** signature — the modal's own strings carry the beat, nothing is retyped or re-designed. Change: instead of one surface advancing through screens, this frame pulls **two crops out of a single modal** and treats them as consecutive states, which is the honest reading of a modal you scroll.

Scene 1 (0.0–1.0s): opens on the verdict frame's own footer sentence, alone on paper in body type: **"AI arbitration verdict is advisory — you can still override below."** The word **advisory** takes a **keyword glow** (`asr-keyword-glow`) — but rendered as the brand's own emphasis, a `line` hairline sweeping under the word on an attack-decay envelope, not a light bloom. Held while it reads.
Scene 2 (1.0–2.0s): **zoom-through seam** (`cut-catalog.md`) — the sentence scales up and blurs out as the **`ESCROW REFUND` strip** (`07-reject-modal`, cropped to the dark panel: *Returned to your wallet · 4 USDC*) scales up from small into focus on the identical center. Velocity-matched, cut at peak. The dark strip against paper is the visual rhyme with frame 3's dark button.
Scene 3 (2.0–3.3s): the strip settles to the upper third and the **transaction preview table** (second crop of the same asset) reveals beneath it, its four rows **staggering up** (`spring-pop-entrance`, staggered-group, ~90ms apart, smooth): `Contract · AgenticCommerce (ERC-8183)` / `Function · reject(uint256,bytes32,bytes)` / `Job ID · #34` / `reasonHash · 0x0695fa553c5be4c1…`. Mono throughout, `text-secondary` labels against `text-primary` values. Rule-of-thirds, 3 depth layers.
Scene 4 (3.3–4.5s): the closing line **"Either way, the reason is on-chain."** reveals in display type at the base of the content area, **per-word staggered** (`dynamic-content-sequencing`), with **on-chain** in clay `reject` — the only clay word in the frame besides the strip. Holds still to the cut.

## Frame 5 — CONACT

- scene: Everything clears; the wordmark draws on over a single hairline with the standards line beneath
- voiceover: ""
- duration: 2.5s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/05-conact.html
- type: brand_outro
- persuasion: Authority by association
- beat: inevitability
- blueprint: logo-assemble-lockup (Adapt)
- focal: none — typographic lockup
- roles: none
- asset_candidates:

narrativeRole: The name arrives last, after the product has already been proven — the whole film is its evidence. Two lines, held still, no motion flourish on the mark itself.
keyMessage: CONACT is where this happens.

Adapt: keep the **stage-clears-then-the-mark-draws-itself-on** signature. Change: the blueprint's assembling ring / orbiting system / glow ignite are all dropped — this brand has no rings and no glows. The thing that assembles is the brand's single structural device: the **hairline draws itself across the frame and the wordmark completes the lockup above it**. That is the same move in this brand's vocabulary.

Scene 1 (0.0–0.7s): bare `bg-primary`. A single `line` hairline **self-draws** (`svg-path-draw`) from the left edge to the right across the vertical center, ~0.55s, long-tail. Nothing else on screen. Full-width strip, 2 depth layers.
Scene 2 (0.7–1.35s): **CONACT** arrives above the rule in display type at the brand's tight tracking, entering as a **per-word settle** (`dynamic-content-sequencing` — one unit, so a single clean fade-and-rise of ≤14px, no scale pop). It seats, and the hairline it sits on is already there to receive it.
Scene 3 (1.35–2.5s): beneath the rule, two lines reveal in quick succession — **"Post jobs · Hire AI agents · Settle in USDC"** in body type `text-secondary`, then **`ERC-8004 · ERC-8183 · ARC NETWORK`** in mono micro at `accent`. Both are a plain fade-up, ~120ms apart. Then **absolute stillness for the final ~1.0s** — no jitter, no drift, nothing. The last rendered frame must be a clean, legible, screenshot-able end card.
