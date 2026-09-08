import { NextRequest, NextResponse } from 'next/server'
import {
  ARBITRATION_ADDRESS,
  submitPrepare,
  submitAdjudicate,
  readVerdict,
  readChecklist,
} from '../../../lib/genlayer'

export const maxDuration = 60

const HASH_RE = /^0x[0-9a-fA-F]{64}$/

function briefOf(job: any): string {
  return [
    `TITLE: ${job?.title ?? ''}`,
    `CATEGORY: ${job?.category ?? ''}`,
    `DESCRIPTION: ${job?.description ?? ''}`,
  ].join('\n')
}

/**
 * POST — kick off one phase of arbitration and return immediately with a tx id.
 *
 * Two phases on purpose. Validators re-execute the non-deterministic work
 * themselves, so a round that does too much web work never reaches a terminal
 * state. `prepare` is one prompt; `adjudicate` is one fetch plus one prompt.
 *
 * Neither call waits for consensus. The client polls GET below, which reads
 * contract state rather than a transaction status.
 */
export async function POST(req: NextRequest) {
  try {
    if (!ARBITRATION_ADDRESS) {
      return NextResponse.json(
        { success: false, error: 'GENLAYER_ARBITRATION_ADDRESS is not set' },
        { status: 500 },
      )
    }

    const { action, job, deliverableCid, deliverableHash } = await req.json()
    const jobId = String(job?.chain_job_id ?? job?.id ?? '')
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'missing job id' }, { status: 400 })
    }

    if (action === 'prepare') {
      const txId = await submitPrepare(jobId, briefOf(job))
      return NextResponse.json({ success: true, phase: 'preparing', txId })
    }

    if (action === 'adjudicate') {
      const cid = String(deliverableCid || '').replace('ipfs://', '').trim()
      if (!cid) {
        return NextResponse.json(
          { success: false, error: 'missing deliverable CID' },
          { status: 400 },
        )
      }

      // The hash MUST be the one committed on Arc by submit(). We deliberately do
      // not derive it from the CID here: deriving it would make the contract's
      // check compare our own arithmetic against itself and prove nothing about
      // which artefact Arc actually committed to.
      //
      // See genlayer/README.md — reading this back from Arc needs a view function
      // that is not in the ABI the app currently ships.
      if (!HASH_RE.test(String(deliverableHash || ''))) {
        return NextResponse.json(
          {
            success: false,
            error:
              'no on-chain deliverable hash available for this job, refusing to arbitrate',
          },
          { status: 409 },
        )
      }

      const txId = await submitAdjudicate(jobId, briefOf(job), cid, String(deliverableHash))
      return NextResponse.json({ success: true, phase: 'judging', txId })
    }

    return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 })
  } catch (err) {
    console.error('GenLayer arbitration failed:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

/**
 * GET ?jobId=… — poll. Reads contract state, never a transaction status word.
 *
 * Returns the same fields the existing arbitration UI already renders
 * (verdict / score / reasoning / strengths / weaknesses) so the result panel
 * works unchanged, plus the checklist counts and the CID that was judged.
 */
export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'missing jobId' }, { status: 400 })
    }

    const verdict = await readVerdict(jobId)

    if (verdict && verdict.status === 'decided') {
      const passed = Number(verdict.checks_passed ?? 0)
      const total = Number(verdict.checks_total ?? 0)
      return NextResponse.json({
        success: true,
        phase: 'decided',
        verdict: verdict.verdict,
        // Derived from the checklist, not emitted by a model. Kept so the existing
        // "n/100" display keeps working.
        score: total > 0 ? Math.round((passed / total) * 100) : 0,
        checksPassed: passed,
        checksTotal: total,
        reasoning:
          verdict.verdict === 'APPROVE'
            ? `All ${total} requirements were met.`
            : `${total - passed} of ${total} requirements were not met.`,
        strengths: verdict.met ?? [],
        weaknesses: verdict.failed ?? [],
        cid: verdict.cid,
        deliverableHash: verdict.deliverable_hash,
      })
    }

    if (verdict && verdict.status === 'refused') {
      return NextResponse.json({
        success: false,
        phase: 'refused',
        error: verdict.reason,
        derivedHash: verdict.derived_hash,
        expectedHash: verdict.expected_hash,
      })
    }

    const checklist = await readChecklist(jobId)
    if (checklist && (checklist.requirements ?? []).length > 0) {
      return NextResponse.json({
        success: true,
        phase: 'prepared',
        requirements: checklist.requirements,
      })
    }

    return NextResponse.json({ success: true, phase: 'pending' })
  } catch (err) {
    console.error('GenLayer poll failed:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
