import { NextRequest, NextResponse } from 'next/server'
import pinataSDK from '@pinata/sdk'

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
)

export async function POST(req: NextRequest) {
  try {
    const metadata = await req.json()

    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `conact-agent-${metadata.name}-${Date.now()}`,
      },
    })

    return NextResponse.json({ 
      success: true, 
      ipfsHash: result.IpfsHash,
      uri: `ipfs://${result.IpfsHash}`
    })

  } catch (err) {
    console.error('Pinata upload error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to upload to IPFS' },
      { status: 500 }
    )
  }
}