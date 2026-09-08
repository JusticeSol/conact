import { createClient, createAccount } from 'genlayer-js'
import { testnetBradbury } from 'genlayer-js/chains'
import { TransactionStatus } from 'genlayer-js/types'

// The arbitration Intelligent Contract. Deployed separately — see genlayer/README.md.
export const ARBITRATION_ADDRESS = process.env.GENLAYER_ARBITRATION_ADDRESS || ''

// Gateway the validators fetch the deliverable from.
// MUST return 200 directly: gl.nondet.web.get does not follow redirects, so a
// gateway that 301s will fail the fetch inside consensus.
export const IPFS_GATEWAY =
  process.env.GENLAYER_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs'

// Default is 3. Raising it materially improves the odds of a write landing:
// LEADER_TIMEOUT is common on testnet and is not proof of failure.
const CONSENSUS_MAX_ROTATIONS = Number(process.env.GENLAYER_MAX_ROTATIONS || 8)

function relayerAccount() {
  const key = process.env.GENLAYER_PRIVATE_KEY
  if (!key) throw new Error('GENLAYER_PRIVATE_KEY is not set')
  return createAccount(key as `0x${string}`)
}

export function genlayerClient() {
  return createClient({ chain: testnetBradbury, account: relayerAccount() })
}

/** Compile the brief into a checklist. One prompt, no web access. */
export async function submitPrepare(jobId: string, brief: string) {
  const client = genlayerClient()
  return await client.writeContract({
    address: ARBITRATION_ADDRESS as `0x${string}`,
    functionName: 'prepare',
    args: [jobId, brief],
    value: 0n,
    // Not in the published typings; accepted at runtime. The CLI has no equivalent
    // flag, which is why browser-submitted transactions land more often than CLI ones.
    consensusMaxRotations: CONSENSUS_MAX_ROTATIONS,
  } as any)
}

/** Fetch the deliverable and answer the checklist. One web fetch, one prompt. */
export async function submitAdjudicate(
  jobId: string,
  brief: string,
  cid: string,
  expectedHash: string,
) {
  const client = genlayerClient()
  return await client.writeContract({
    address: ARBITRATION_ADDRESS as `0x${string}`,
    functionName: 'adjudicate',
    args: [jobId, brief, cid, expectedHash, IPFS_GATEWAY],
    value: 0n,
    consensusMaxRotations: CONSENSUS_MAX_ROTATIONS,
  } as any)
}

/**
 * Read contract state. This is the ONLY source of truth for whether arbitration
 * happened.
 *
 * Do not infer success from a transaction status: a transaction has been observed
 * reaching Finalized with empty consensus output, every validator vote zero, and
 * nothing written to storage. Status tells you the transaction stopped moving, not
 * that it did anything.
 */
export async function readVerdict(jobId: string): Promise<any | null> {
  const client = genlayerClient()
  const raw = (await client.readContract({
    address: ARBITRATION_ADDRESS as `0x${string}`,
    functionName: 'get_verdict',
    args: [jobId],
    stateStatus: 'finalized',
  })) as string
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function readChecklist(jobId: string): Promise<any | null> {
  const client = genlayerClient()
  const raw = (await client.readContract({
    address: ARBITRATION_ADDRESS as `0x${string}`,
    functionName: 'get_checklist',
    args: [jobId],
    stateStatus: 'finalized',
  })) as string
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export { TransactionStatus }
