// ============================================================
// VIRALFORGE AI — GEMINI AGENT LIBRARY
// Server-side only — uses GEMINI_API_KEY from .env.local
// ============================================================

import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import type {
  AgentContext,
  VisionResult,
  RetentionResult,
  ClipsResult,
  ThumbnailResult,
  StrategyResult,
} from '../types'

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ─────────────────────────────────────────────
// MODEL ASSIGNMENT PER AGENT
// All updated to gemini-2.0-flash (current stable)
// ─────────────────────────────────────────────
const AGENT_MODELS: Record<string, string> = {
  vision:    'gemini-2.0-flash',
  retention: 'gemini-2.0-flash',
  clips:     'gemini-2.0-flash',
  thumbnail: 'gemini-2.0-flash',
  strategy:  'gemini-2.0-flash',
}

// ─────────────────────────────────────────────
// AGENT SYSTEM PROMPTS
// Each agent returns strict JSON only
// ─────────────────────────────────────────────
const AGENT_PROMPTS: Record<string, string> = {
  vision: `You are the Vision Intelligence Agent inside ViralForge AI, a multimodal creator intelligence platform powered by Google Gemini.

Analyze the uploaded creator content for visual storytelling quality, emotional framing, and audience impact potential.

CRITICAL INSTRUCTION: Your entire response must be ONLY a raw JSON object.
- Do NOT wrap in markdown code fences
- Do NOT write any explanation before or after
- Start your response with { and end with }

Required JSON structure:
{
  "emotional_score": <integer 0-100>,
  "composition_score": <integer 0-100>,
  "creator_presence_score": <integer 0-100>,
  "visual_storytelling_score": <integer 0-100>,
  "key_visual_elements": ["element1", "element2", "element3"],
  "emotional_moments": [
    { "timestamp": "0:12", "emotion": "surprise", "intensity": 85 }
  ],
  "visual_improvements": ["improvement1", "improvement2", "improvement3"],
  "overall_verdict": "One to two sentence assessment of viral potential."
}`,

  retention: `You are the Audience Retention Agent inside ViralForge AI powered by Google Gemini.

Predict how a real audience will retain attention through this content. Identify engagement spikes and drop-off risks.

CRITICAL INSTRUCTION: Respond with ONLY a raw JSON object. No markdown. No explanation. Start with { end with }.

Required JSON structure:
{
  "overall_retention_score": <integer 0-100>,
  "hook_strength": <integer 0-100>,
  "pacing_score": <integer 0-100>,
  "engagement_spikes": [
    { "timestamp": "1:30", "type": "reveal", "predicted_lift": 75 }
  ],
  "drop_off_risks": [
    { "timestamp": "3:00", "reason": "pacing slows", "risk_level": "medium" }
  ],
  "retention_curve_points": [100, 92, 85, 78, 72, 68, 63, 57, 52, 48],
  "key_insight": "One sentence most important retention insight."
}`,

  clips: `You are the Shorts Optimization Agent inside ViralForge AI powered by Google Gemini.

Identify the top viral short-form clip opportunities with exact timestamps.

CRITICAL INSTRUCTION: Respond with ONLY a raw JSON object. No markdown. No explanation. Start with { end with }.

Required JSON structure:
{
  "top_clips": [
    {
      "rank": 1,
      "title": "Punchy clip title",
      "timestamp_start": "2:14",
      "timestamp_end": "3:02",
      "viral_score": 92,
      "why": "Explains why this moment will go viral in 1-2 sentences.",
      "platform_fit": ["YouTube Shorts", "TikTok", "Instagram Reels"],
      "category": "reveal"
    }
  ],
  "best_hook_moment": "0:08",
  "estimated_views_boost": "2.4x",
  "repurposing_opportunities": ["opportunity1", "opportunity2", "opportunity3"]
}`,

  thumbnail: `You are the Thumbnail Psychology Agent inside ViralForge AI powered by Google Gemini.

Analyze the visual content for thumbnail CTR optimization using psychological principles.

CRITICAL INSTRUCTION: Respond with ONLY a raw JSON object. No markdown. No explanation. Start with { end with }.

Required JSON structure:
{
  "ctr_prediction": <number 1.0-15.0>,
  "curiosity_gap_score": <integer 0-100>,
  "face_emotion_score": <integer 0-100 or null>,
  "color_impact_score": <integer 0-100>,
  "text_clarity_score": <integer 0-100>,
  "thumbnail_recommendations": [
    {
      "concept": "Concept name",
      "description": "Specific visual description of the thumbnail.",
      "predicted_ctr_lift": "+2.1%"
    }
  ],
  "current_thumbnail_issues": ["issue1", "issue2"],
  "winning_formula": "One sentence describing the optimal thumbnail formula."
}`,

  strategy: `You are the Trend Intelligence and Growth Strategy Agent inside ViralForge AI powered by Google Gemini.

Synthesize content signals and generate a complete data-driven creator growth strategy.

CRITICAL INSTRUCTION: Respond with ONLY a raw JSON object. No markdown. No explanation. Start with { end with }.

Required JSON structure:
{
  "virality_score": <integer 0-100>,
  "platform_resonance_scores": {
    "youtube": <integer 0-100>,
    "tiktok": <integer 0-100>,
    "instagram": <integer 0-100>
  },
  "trending_topics": [
    { "topic": "topic name", "heat_level": "hot" }
  ],
  "growth_strategies": [
    {
      "priority": 1,
      "title": "Strategy name",
      "description": "Specific actionable description.",
      "impact": "High — 40% more impressions"
    }
  ],
  "optimal_posting_times": {
    "youtube": "Tue/Thu 2-4PM EST",
    "tiktok": "Daily 7-9PM EST",
    "instagram": "Mon/Wed/Fri 11AM-1PM EST"
  },
  "hooks_by_platform": [
    { "platform": "YouTube",   "hook": "Specific hook line for YouTube" },
    { "platform": "TikTok",    "hook": "Specific hook line for TikTok" },
    { "platform": "Instagram", "hook": "Specific hook line for Instagram" }
  ],
  "30_day_projection": "2-3 sentence realistic growth projection."
}`,
}

// ─────────────────────────────────────────────
// PARSE GEMINI RESPONSE TO JSON
// ─────────────────────────────────────────────
function parseGeminiJSON<T>(rawText: string, agentType: string): T {
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        throw new Error(`[${agentType}] JSON parse failed: ${cleaned.slice(0, 150)}`)
      }
    }
    throw new Error(`[${agentType}] No valid JSON in response`)
  }
}

// ─────────────────────────────────────────────
// CALL A SINGLE AGENT
// ─────────────────────────────────────────────
async function callAgent<T>(agentType: string, context: AgentContext): Promise<T> {
  // Use context model override, or fall back to per-agent default
  const modelName = context.model || AGENT_MODELS[agentType]
  const model = genAI.getGenerativeModel({ model: modelName })

  const parts: Part[] = []

  // Attach file for multimodal analysis (images and short videos)
  if (context.fileBase64 && (context.isImage || context.isVideo)) {
    parts.push({
      inlineData: {
        mimeType: context.fileMediaType,
        data: context.fileBase64,
      },
    })
  }

  const mediaDesc = context.isImage
    ? 'image/thumbnail'
    : context.isVideo
    ? 'video'
    : 'audio/podcast'

  const contextNote =
    context.isImage || context.isVideo
      ? 'The file is attached — analyze it using your full multimodal capabilities.'
      : `This is an audio file named "${context.fileName}". Reason from filename and content type context.`

  parts.push({
    text: `You are analyzing creator content for ViralForge AI.

File: "${context.fileName}"
Media type: ${mediaDesc}
Content category: ${context.contentType}
Target platform: ${context.platform}
Your role: ${agentType.toUpperCase()} AGENT

${contextNote}

${AGENT_PROMPTS[agentType]}

Analyze and return ONLY the JSON object.`,
  })

  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  })

  const rawText = result.response.text()
  return parseGeminiJSON<T>(rawText, agentType)
}

// ─────────────────────────────────────────────
// EXPORTED AGENT FUNCTIONS
// Called from API routes
// ─────────────────────────────────────────────
export async function runVisionAgent(ctx: AgentContext): Promise<VisionResult> {
  return callAgent<VisionResult>('vision', ctx)
}

export async function runRetentionAgent(ctx: AgentContext): Promise<RetentionResult> {
  return callAgent<RetentionResult>('retention', ctx)
}

export async function runClipsAgent(ctx: AgentContext): Promise<ClipsResult> {
  return callAgent<ClipsResult>('clips', ctx)
}

export async function runThumbnailAgent(ctx: AgentContext): Promise<ThumbnailResult> {
  return callAgent<ThumbnailResult>('thumbnail', ctx)
}

export async function runStrategyAgent(ctx: AgentContext): Promise<StrategyResult> {
  return callAgent<StrategyResult>('strategy', ctx)
}
