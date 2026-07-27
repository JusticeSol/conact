# Asset descriptions

The CONACT UI ships no photographic or illustrative imagery — it is a pure
type-and-rule editorial interface, so the automated crawl downloaded 0 images.
The **captured application states below are this project's assets.** All were shot
against the live app at `http://localhost:3000` at 1600×1000, `deviceScaleFactor: 2`
(so each PNG is 3200×2000 and survives a hard push-in on a 1080×1080 canvas).

All data visible in these shots is real: real seeded jobs from Supabase, a real
Claude arbitration response, real contract signatures. No mockups.

| File | Description | Safe crop region |
|------|-------------|------------------|
| `assets/01-browse-jobs.png` | **Browse Jobs.** The marketplace landing state. Header (`CONACT` wordmark + `TESTNET` chip + "Post jobs · Hire AI agents · Settle in USDC"), left nav, category filter pills, and 5 job rows — each a category tag, `Delivered` status, serif title, deadline, applicant count, poster address, and a right-aligned USDC figure. Editorial list rows separated by hairlines, lots of paper. | The job-row stack, x≈460–3200, y≈380–1360. One row alone (title + tag + USDC number) is the cleanest square crop. |
| `assets/02-agents.png` | **Agents directory.** The registered-agent list with reputation scores and capabilities. Sparser than the jobs view. | Full content column. |
| `assets/03-evaluate-queue.png` | **Evaluate.** Three-column state: nav, "Evaluation Queue — 5 pending · 0 resolved" panel with five queued submission cards (title, `Manual` evaluator tag, USDC), and an empty workspace reading "Select a submission to review". | The queue panel alone, x≈440–920, y≈140–1400 — a tall column, good for a vertical wipe reveal. |
| `assets/04-deliverable-review.png` | **Deliverable review.** Job #34 "Health Tips" open: `Writing` / `Delivered` tags, 4 USDC, the on-chain deliverable block (`ipfs://QmXrWuJhDzg6BjPYm1zqUnBF3YsADyBgjZDJd9PTzM9Kts` + BYTES32 HASH), the agent's generated content pulled from IPFS ("# HEALTH TIPS FOR WEB3 DEVELOPERS"), and the review-notes field. | The `DELIVERABLE (on-chain)` block, x≈980–2220, y≈290–530. The mono IPFS CID is the hero detail. |
| `assets/05-arbitrating.png` | **Arbitration in flight.** Same view, the action button switched to its disabled `⟳ Arbitrating…` state. The only "loading" frame available; useful as a 200–400ms beat before the verdict lands. | The button row at the bottom of the workspace column. |
| `assets/06-arbitration-verdict.png` | **The verdict — the film's hero asset.** Claude's real response rendered as a sage-tinted card: a status dot, `AI Verdict: APPROVE` in Playfair, `92/100` in mono, three sentences of reasoning about the Web3-developer health tips, a `STRENGTHS` list of three ✓ items, a `WEAKNESSES` list of one ✗ item, and the footer line "AI arbitration verdict is advisory — you can still override below." | The verdict card, x≈980–2220, y≈1480–2000+ (card continues below fold). Crop tight on the `AI Verdict: APPROVE` + `92/100` header row for the money shot. |
| `assets/07-reject-modal.png` | **Reject deliverable.** Modal over a dimmed page: clay-red serif title, `ESCROW REFUND / Returned to your wallet / 4 USDC` on a dark panel, a required rejection-reason textarea, "Stored on-chain as: `0x0695fa553c5be4c12765…`", and a transaction preview table — `Contract: AgenticCommerce (ERC-8183)`, `Function: reject(uint256,bytes32,bytes)`, `Job ID: #34`, `reasonHash: 0x0695fa553c5be4c1…`. Behind it the still-visible verdict card and the three action buttons. | The modal only, x≈1160–2040, y≈500–1500. The transaction preview table alone is a strong square crop. |
| `screenshots/scroll-000.png` | The crawler's own full-page shot of Browse Jobs. Redundant with `01-browse-jobs.png`, which is sharper (2× DPR). Prefer `01`. | — |
| `assets/fonts/`, `assets/svgs/` | Font files and icon SVGs pulled by the crawler. No brand logo mark exists — CONACT's identity is the wordmark set in Playfair Display 700. | — |

## Notes for frame selection

- **Two dark panels break the paper palette**: the `⚖ AI Arbitration` button (`#0a0a1a`)
  and the reject modal's escrow strip (near-black). They are leftovers from the app's
  pre-rebrand dark theme, but they read as deliberate emphasis in isolation — crop them
  as intentional contrast rather than avoiding them.
- **`Connect Wallet` sits top-right in every shot**, in RainbowKit's own black pill —
  the one element that is visibly not CONACT's design language. Keep it out of frame.
- The bottom-left dark circle is the Next.js dev-tools badge. Never in frame.
- Nothing sensitive is on screen: no keys, no connected wallet, only demo addresses.
