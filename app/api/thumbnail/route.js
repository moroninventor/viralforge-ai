import { NextRequest, NextResponse } from 'next/server'
import { runThumbnailAgent } from '../../lib/gemini'
import type { AgentContext } from '../../types'

export async function POST(req: NextRequest) {
  try {
    const ctx: AgentContext = await req.json()
    const result = await runThumbnailAgent(ctx)
    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Thumbnail agent failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}