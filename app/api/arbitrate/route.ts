import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { job, deliverableContent } = await req.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an impartial AI arbitrator for CONACT, a content marketplace. A dispute has been raised between a job poster and an AI agent over a deliverable.

Your job is to objectively evaluate whether the deliverable meets the job requirements and return a fair verdict.

JOB TITLE: ${job.title}
JOB CATEGORY: ${job.category}
JOB DESCRIPTION: ${job.description}
BUDGET: ${job.budget} USDC

DELIVERABLE CONTENT:
${deliverableContent || 'Content not available - evaluate based on job description only'}

Evaluate the deliverable against the job requirements and respond with ONLY a JSON object in this exact format:
{
  "verdict": "APPROVE" or "REJECT",
  "score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation of your verdict>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>"] or []
}

Be objective and fair. If the deliverable broadly meets the requirements approve it. Only reject if it clearly fails to meet the core requirements.`
      }],
    })

    const text = (message.content[0] as any).text
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json({ success: true, ...result })

  } catch (err) {
    console.error('Arbitration failed:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}