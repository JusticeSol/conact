import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  testnet: true,
})

const AGENTIC_COMMERCE_ADDRESS = '0x0747EEf0706327138c69792bF28Cd525089e4583'

const ABI = [
  {
    type: 'function',
    name: 'setBudget',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'optParams', type: 'bytes' },
    ],
    outputs: [],
  },
] as const

export async function POST(req: NextRequest) {
  try {
    const { jobId, amount } = await req.json()

    const account = privateKeyToAccount(
      process.env.AGENT_PRIVATE_KEY as `0x${string}`
    )

    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })

    const budgetUnits = BigInt(Math.floor(Number(amount) * 1e6))

    console.log('Setting budget for job:', jobId, 'amount:', budgetUnits.toString())

    const txHash = await walletClient.writeContract({
      address: AGENTIC_COMMERCE_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: 'setBudget',
      args: [BigInt(jobId), budgetUnits, '0x'],
      account,
    })

    console.log('Budget set:', txHash)

    return NextResponse.json({ success: true, txHash })

  } catch (err) {
    console.error('setBudget failed:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}