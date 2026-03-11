import type { FormData, Category } from "./types"

// Max possible score: 100
// average_views (60) + best_video_range (30) + creator_type bonus (5) + niche bonus (5)

export function calculateScore(data: Partial<FormData>): number {
  let score = 0

  // Average views — max 60
  const viewsScore: Record<string, number> = {
    "Under 10k": 5,
    "10k–50k": 15,
    "50k–100k": 30,
    "100k–250k": 50,
    "250k+": 60,
  }
  score += viewsScore[data.average_views ?? ""] ?? 0

  // Best video range — max 30
  const bestVideoScore: Record<string, number> = {
    "Under 100k": 5,
    "100k–500k": 15,
    "500k–1M": 25,
    "1M+": 30,
  }
  score += bestVideoScore[data.best_video_range ?? ""] ?? 0

  // Creator type selected — bonus max 5
  if ((data.creator_type ?? []).length > 0) score += 5

  // Niche filled — bonus max 5
  if ((data.content_niche ?? "").trim().length > 0) score += 5

  return score
}

export function getCategory(score: number): Category {
  if (score >= 80) return "Top Priority"
  if (score >= 60) return "Strong Fit"
  if (score >= 40) return "Mid Fit"
  return "Low Priority"
}

export function generateTags(data: Partial<FormData>): string[] {
  const tags: string[] = []

  if (["100k–250k", "250k+"].includes(data.average_views ?? "")) {
    tags.push("HIGH REACH")
  }

  if ((data.creator_type ?? []).includes("Edits")) {
    tags.push("EDITOR")
  }

  if ((data.creator_type ?? []).includes("Dances")) {
    tags.push("DANCER")
  }

  if (["500k–1M", "1M+"].includes(data.best_video_range ?? "")) {
    tags.push("VIRAL")
  }

  return tags
}
