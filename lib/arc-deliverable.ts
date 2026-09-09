import { createPublicClient, http, defineChain, parseAbiItem } from 'viem'

/**
 * Recovers the deliverable hash that Arc actually committed for a job.
 *
 * Why this exists: submit() stores keccak256("ipfs://" + cid) but the Job struct
 * does not keep it — getJob() returns id/client/provider/evaluator/description/
 * budget/expiredAt/status/hook and no deliverable. The hash is only ever emitted
 * in the JobSubmitted event, so a log is the single on-chain source of truth.
 *
 * Why a transaction hash rather than a search: the Arc RPC prunes old history
 * ("pruned history unavailable" from block 0) and caps eth_getLogs at ~10k blocks,
 * while the chain is past 61M blocks and jobCounter is past 185k. Scanning for an
 * old job is not possible. So we store a pointer to the submit transaction and
 * read the hash out of that transaction's own receipt.
 *
 * A pointer is safe in a way a stored hash is not. The database can only say
 * "look at this transaction"; the value itself comes from chain data, and the
 * jobId and emitting contract are both checked, so pointing at the wrong
 * transaction fails rather than substituting a different artefact.
 */

export const AGENTIC_COMMERCE = '0x0747EEf0706327138c69792bF28Cd525089e4583'

// keccak256("JobSubmitted(uint256,address,bytes32)")
const JOB_SUBMITTED_TOPIC =
  '0x80c17db79857f338a6a6df68a6883ecc0ce78e2202fe61ed979733573f40538e'

// eth_getLogs returns "requested range too large" past this.
const MAX_LOG_SPAN = BigInt(10000)

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.arc.network'] } },
  testnet: true,
})

function arcClient() {
  return createPublicClient({ chain: arcTestnet, transport: http() })
}

const JOB_SUBMITTED = parseAbiItem(
  'event JobSubmitted(uint256 indexed jobId, address indexed provider, bytes32 deliverable)',
)

/** Read the hash out of a known submit transaction. Preferred path. */
async function fromReceipt(
  jobId: bigint,
  txHash: `0x${string}`,
): Promise<`0x${string}` | null> {
  const client = arcClient()
  const receipt = await client.getTransactionReceipt({ hash: txHash })
  if (receipt.status !== 'success') return null

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== AGENTIC_COMMERCE.toLowerCase()) continue
    if (log.topics[0]?.toLowerCase() !== JOB_SUBMITTED_TOPIC) continue
    // topics[1] is the indexed jobId. A pointer to someone else's submit fails here.
    if (BigInt(log.topics[1] as string) !== jobId) continue
    return log.data as `0x${string}`
  }
  return null
}

/** Fallback for a recent submit with no stored pointer. Only the last ~10k blocks. */
async function fromRecentLogs(jobId: bigint): Promise<`0x${string}` | null> {
  const client = arcClient()
  const latest = await client.getBlockNumber()
  const fromBlock = latest > MAX_LOG_SPAN ? latest - MAX_LOG_SPAN : BigInt(0)

  const logs = await client.getLogs({
    address: AGENTIC_COMMERCE as `0x${string}`,
    event: JOB_SUBMITTED,
    args: { jobId },
    fromBlock,
    toBlock: 'latest',
  })
  if (logs.length === 0) return null
  // Re-submits are possible; the latest one is what stands.
  return logs[logs.length - 1].args.deliverable as `0x${string}`
}

/**
 * Returns the committed deliverable hash, or null if it cannot be established
 * from the chain. Null means refuse to arbitrate — never fall back to deriving
 * the hash from the CID, which would make the contract's check compare our own
 * arithmetic against itself and prove nothing.
 */
export async function getOnChainDeliverableHash(
  jobId: string | number | bigint,
  submitTxHash?: string | null,
): Promise<`0x${string}` | null> {
  const id = BigInt(jobId)

  if (submitTxHash && /^0x[0-9a-fA-F]{64}$/.test(submitTxHash)) {
    try {
      const hit = await fromReceipt(id, submitTxHash as `0x${string}`)
      if (hit) return hit
    } catch (err) {
      console.error('deliverable receipt lookup failed:', err)
    }
  }

  try {
    return await fromRecentLogs(id)
  } catch (err) {
    console.error('deliverable log scan failed:', err)
    return null
  }
}
