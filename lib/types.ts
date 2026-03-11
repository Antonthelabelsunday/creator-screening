export type Platform =
  | "TikTok"
  | "Instagram Reels"
  | "YouTube Shorts"
  | "Multiple platforms"

export type CreatorType = "Dances" | "Edits" | "Other"

export type AverageViews =
  | "Under 10k"
  | "10k–50k"
  | "50k–100k"
  | "100k–250k"
  | "250k+"

export type BestVideoRange = "Under 100k" | "100k–500k" | "500k–1M" | "1M+"

export type Category = "Top Priority" | "Strong Fit" | "Mid Fit" | "Low Priority"

export interface Application {
  id: string
  email: string
  platform: Platform
  profile_link: string
  creator_type: CreatorType[]
  content_niche: string
  average_views: AverageViews
  best_video_range: BestVideoRange
  score: number
  category: Category
  tags: string[]
  created_at: string
}

export interface FormData {
  email: string
  platform: Platform | ""
  profile_link: string
  creator_type: CreatorType[]
  content_niche: string
  average_views: AverageViews | ""
  best_video_range: BestVideoRange | ""
}

// ── Option arrays ────────────────────────────────────────────────────────────

export const PLATFORMS: Platform[] = [
  "TikTok",
  "Instagram Reels",
  "YouTube Shorts",
  "Multiple platforms",
]

export const CREATOR_TYPES: CreatorType[] = ["Dances", "Edits", "Other"]

export const AVERAGE_VIEWS: AverageViews[] = [
  "Under 10k",
  "10k–50k",
  "50k–100k",
  "100k–250k",
  "250k+",
]

export const BEST_VIDEO_RANGES: BestVideoRange[] = [
  "Under 100k",
  "100k–500k",
  "500k–1M",
  "1M+",
]
