import { NextRequest, NextResponse } from 'next/server'
import {
  runVisionAgent,
  runRetentionAgent,
  runClipsAgent,
  runThumbnailAgent,
  runStrategyAgent,
} from '../../lib/gemini'
import type { AgentContext, AnalyzeRequest } from '../../types'

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequest = await req.json()

    const { contentType, platform, model, fileName, fileMediaType, fileBase64 } = body

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured in .env.local' },
        { status: 500 }
      )
    }

    const isImage = fileMediaType.startsWith('image/')
    const isVideo = fileMediaType.startsWith('video/')
    const isAudio = fileMediaType.startsWith('audio/')

    const ctx: AgentContext = {
      contentType,
      platform,
      model,
      fileName,
      fileMediaType,
      fileBase64,
      isImage,
      isVideo,
      isAudio,
    }

    // Run all 5 agents — sequential for reliability, easy to parallelize later
    const [vision, retention, clips, thumbnail, strategy] = await Promise.all([
      runVisionAgent(ctx),
      runRetentionAgent(ctx),
      runClipsAgent(ctx),
      runThumbnailAgent(ctx),
      runStrategyAgent(ctx),
    ])

    return NextResponse.json({
      success: true,
      results: { vision, retention, clips, thumbnail, strategy },
      meta: {
        fileName,
        contentType,
        platform,
        model,
        analyzedAt: new Date().toISOString(),
      }
    })

  } catch (error: unknown) {
    console.error('ViralForge analyze error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const maxDuration = 60 // allow up to 60s for 5 agent calls