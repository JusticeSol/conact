---
workflow: product-launch-video
flow: automation
storyboard: no
message: "When an AI agent's work is disputed, CONACT settles it — an impartial AI verdict, and escrow that moves either way on-chain"
destination: x-feed
aspect: 1080x1080
language: en
length: 20s
angle: verdict-as-hero
narration: no
---

## Intent

A 20-second product intro for **CONACT**, an AI agent content marketplace on Arc
Network (testnet). Post jobs, hire AI agents, settle in USDC.

The telling is **verdict-as-hero**: lead on the arbitration moment. A deliverable
lands in the Evaluate queue, the poster hits AI Arbitration, Claude returns a
scored verdict with reasoning — and then escrow actually moves. Either the job
completes and USDC releases, or `reject()` refunds the poster and writes the
rejection reason to chain as an immutable `bytes32`. The features are the drama;
the UI appears as evidence that this is a real, working product.

Tone: editorial and composed, not hype. The product's own design language is
already restrained — warm paper, a serif, a mono for the data — and the video
should read as an extension of it. Confident, quiet, precise.

Audience: crypto/AI builders and hackathon judges scrolling a feed.

## Assets

- Captured screens of the running CONACT app (see `capture/`) — the featured
  assets. Beats are composed as pushed-in crops on the region that carries the
  beat, not as full desktop viewports.

## Customizations

- **Music: deferred — this render is silent.** The user originally asked for a
  subtle instrumental bed. No music provider was available on this machine (not
  signed in to HeyGen; no `GEMINI_API_KEY`/`GOOGLE_API_KEY` for Lyria; MusicGen
  needs a torch install this Python 3.14 environment can't currently satisfy).
  Offered sign-in / API key / own file / silent — **user chose silent for now**
  (2026-07-26). `STORYBOARD.md` carries the canonical marker `music: none` and
  there is no `SCRIPT.md`, so the project is fully silent by design, not by
  failure. To add the bed later: drop the track in, then re-run `assemble-index`
  and `render` — the frames do not need rebuilding.
- No narration, no voice-over. On-screen typography carries the entire message,
  and with no audio at all the cut rhythm has to carry the pacing alone.
- **Pushed-in crops.** CONACT's UI is a ~1920-wide three-column desktop layout;
  the canvas is square. Every UI beat frames the meaningful region (verdict card,
  escrow-refund panel, job row) at a scale where IBM Plex Mono data stays legible
  in a feed. Never show a whole shrunken viewport.
- **The approve/reject axis is the film's color story.** Sage `#5A8A5A` for
  approve/release, clay `#A85440` for reject/refund. Those two colors should be
  the only saturated things on screen.
- Close card carries the CONACT wordmark and `ERC-8004 · ERC-8183 · Arc Network`.

## Notes

- Real product strings only — no invented feature names. The arbitration response
  shape is `verdict` / `score` / `reasoning` / `strengths` / `weaknesses`, and the
  UI labels the verdict **advisory** ("you can still override below"). Don't imply
  the AI has final authority; the honest and more interesting claim is that the
  human keeps the override and the chain keeps the record.
- Contract surface, exact: `AgenticCommerce (ERC-8183)`,
  `reject(uint256,bytes32,bytes)`, `complete(uint256,bytes32,bytes)`.
  Identity/reputation are ERC-8004 registries.
- The app is testnet. The header carries a `TESTNET` chip — fine to keep visible;
  don't imply mainnet.
- Never show `.env.local` values, private keys, or the connected wallet's real
  address. Demo addresses in the seeded data are fine.
- 20s is under this route's 30–90s sweet spot. Confirmed by the user. Budget it
  as ~4 beats of ~4.5s plus a ~2s close card; no beat gets a slow build.
