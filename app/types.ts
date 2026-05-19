// All TypeScript interfaces for ViralForge AI

export interface EmotionalMoment {
  timestamp: string
  emotion: string
  intensity: number
}

export interface VisionResult {
  emotional_score: number
  composition_score: number
  creator_presence_score: number
  visual_storytelling_score: number
  key_visual_elements: string[]
  emotional_moments: EmotionalMoment[]
  visual_improvements: string[]
  overall_verdict: string
}

export interface EngagementSpike {
  timestamp: string
  type: string
  predicted_lift: number
}

export interface DropOffRisk {
  timestamp: string
  reason: string
  risk_level: 'low' | 'medium' | 'high'
}

export interface RetentionResult {
  overall_retention_score: number
  hook_strength: number
  pacing_score: number
  engagement_spikes: EngagementSpike[]
  drop_off_risks: DropOffRisk[]
  retention_curve_points: number[]
  key_insight: string
}

export interface Clip {
  rank: number
  title: string
  timestamp_start: string
  timestamp_end: string
  viral_score: number
  why: string
  platform_fit: string[]
  category: string
}

export interface ClipsResult {
  top_clips: Clip[]
  best_hook_moment: string
  estimated_views_boost: string
  repurposing_opportunities: string[]
}

export interface ThumbnailRecommendation {
  concept: string
  description: string
  predicted_ctr_lift: string
}

export interface ThumbnailResult {
  ctr_prediction: number
  curiosity_gap_score: number
  face_emotion_score: number | null
  color_impact_score: number
  text_clarity_score: number
  thumbnail_recommendations: ThumbnailRecommendation[]
  current_thumbnail_issues: string[]
  winning_formula: string
}

export interface TrendingTopic {
  topic: string
  heat_level: 'hot' | 'rising' | 'stable'
}

export interface GrowthStrategy {
  priority: number
  title: string
  description: string
  impact: string
}

export interface HookByPlatform {
  platform: string
  hook: string
}

export interface StrategyResult {
  virality_score: number
  platform_resonance_scores: {
    youtube: number
    tiktok: number
    instagram: number
  }
  trending_topics: TrendingTopic[]
  growth_strategies: GrowthStrategy[]
  optimal_posting_times: {
    youtube: string
    tiktok: string
    instagram: string
  }
  hooks_by_platform: HookByPlatform[]
  '30_day_projection': string
}

export interface AnalysisResults {
  vision: VisionResult
  retention: RetentionResult
  clips: ClipsResult
  thumbnail: ThumbnailResult
  strategy: StrategyResult
}

export interface AnalyzeRequest {
  contentType: string
  platform: string
  model: string
  fileName: string
  fileMediaType: string
  fileBase64: string | null
}

export interface AgentContext extends AnalyzeRequest {
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
}