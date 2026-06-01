import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import pinataSDK from '@pinata/sdk'
import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
)

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

const AGENTIC_COMMERCE_ABI = [
  {
    type: 'function',
    name: 'submit',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'deliverable', type: 'bytes32' },
      { name: 'optParams', type: 'bytes' },
    ],
    outputs: [],
  },
] as const

export async function POST(req: NextRequest) {
  try {
    const { job } = await req.json()

    console.log('Agent executing job:', job.id, job.title)

    // ── Step 1: Generate content with Claude ──────────────────────────────────
    const prompt = buildPrompt(job)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = (message.content[0] as any).text
    console.log('Content generated, length:', content.length)

    // ── Step 2: Upload content to IPFS ────────────────────────────────────────
    const ipfsResult = await pinata.pinJSONToIPFS({
      jobId: job.id,
      jobTitle: job.title,
      category: job.category,
      content: content,
      generatedAt: new Date().toISOString(),
      agent: 'CONACT ContentAgent v1.0',
    }, {
      pinataMetadata: {
        name: `conact-deliverable-job-${job.id}-${Date.now()}`,
      },
    })

    const deliverableUri = `ipfs://${ipfsResult.IpfsHash}`
    console.log('Content uploaded to IPFS:', deliverableUri)

    // ── Step 3: Submit on-chain ───────────────────────────────────────────────
    const account = privateKeyToAccount(
      process.env.AGENT_PRIVATE_KEY as `0x${string}`
    )

    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })

    const { keccak256, toHex } = await import('viem')
    const deliverableHash = keccak256(toHex(deliverableUri)) as `0x${string}`

    const txHash = await walletClient.writeContract({
      address: AGENTIC_COMMERCE_ADDRESS as `0x${string}`,
      abi: AGENTIC_COMMERCE_ABI,
      functionName: 'submit',
      args: [BigInt(job.chain_job_id || job.id), deliverableHash, '0x'],
      account,
    })

    console.log('Submitted on-chain:', txHash)

    // ── Step 4: Update Supabase ───────────────────────────────────────────────
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('Updating Supabase job with id:', job.id)

    const { data: updateData, error: updateError } = await supabase
      .from('jobs')
      .update({ 
        status: 'submitted',
        deliverable_uri: deliverableUri,
        deliverable_hash: deliverableHash,
        agent_tx_hash: txHash,
      })
      .eq('id', job.id)

    if (updateError) {
      console.error('Supabase update error:', updateError)
    } else {
      console.log('Supabase updated successfully:', updateData)
    }

    return NextResponse.json({
      success: true,
      deliverableUri,
      txHash,
      contentLength: content.length,
    })

  } catch (err) {
    console.error('Agent execution failed:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(job: any): string {
  const category = job.category?.toLowerCase() || 'writing'

  const baseInstructions: Record<string, string> = {
    writing: `You are a professional content writer. Write high quality, engaging content that meets the exact specifications below.`,
    curation: `You are a professional content curator. Curate and organise the most relevant content based on the specifications below.`,
    summarisation: `You are a professional content summariser. Create clear, structured summaries based on the specifications below.`,
    research: `You are a professional research analyst. Produce thorough, well-structured research based on the specifications below.`,
    analysis: `You are a professional content analyst. Produce insightful analysis based on the specifications below.`,
    'social copy': `You are a professional social media copywriter. Write engaging, platform-optimised content based on the specifications below.`,
  }

  const instruction = baseInstructions[category] || baseInstructions.writing

  return `${instruction}

Job Title: ${job.title}
Category: ${job.category}
Description: ${job.description || 'No description provided'}
Budget: ${job.budget} USDC
Deadline: ${job.deadline || 'As soon as possible'}

Requirements:
${job.requirements ? JSON.stringify(job.requirements) : 'Produce high quality content that matches the job description.'}

Please produce the complete deliverable now. Be thorough, professional and match the exact requirements specified. Format your response clearly with appropriate headers and structure.`
}