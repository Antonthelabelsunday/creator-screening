import { NextRequest, NextResponse } from "next/server"
import type { AverageViews, BestVideoRange } from "@/lib/types"

const CHARTEX_APP_ID    = process.env.CHARTEX_APP_ID    ?? ""
const CHARTEX_APP_TOKEN = process.env.CHARTEX_APP_TOKEN ?? ""
const CHARTEX_BASE      = "https://api.chartex.io/external/v1"

function mapAvgViews(avg: number): AverageViews {
  if (avg < 10_000) return "Under 10k"
  if (avg < 50_000) return "10k–50k"
  if (avg < 100_000) return "50k–100k"
  if (avg < 250_000) return "100k–250k"
  return "250k+"
}

function mapBestVideo(views: number): BestVideoRange {
  if (views < 100_000) return "Under 100k"
  if (views < 500_000) return "100k–500k"
  if (views < 1_000_000) return "500k–1M"
  return "1M+"
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.replace(/^@/, "").trim()

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 })
  }

  if (!CHARTEX_APP_ID || !CHARTEX_APP_TOKEN) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 })
  }

  const headers = {
    "X-APP-ID":    CHARTEX_APP_ID,
    "X-APP-TOKEN": CHARTEX_APP_TOKEN,
  }

  try {
    const res = await fetch(
      `${CHARTEX_BASE}/accounts/?platform=tiktok&username=${encodeURIComponent(username)}`,
      { headers }
    )

    if (res.status === 404) {
      return NextResponse.json({ error: "TikTok account not found" }, { status: 404 })
    }

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "API key invalid or quota exceeded" }, { status: 500 })
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch TikTok stats" }, { status: 502 })
    }

    const json = await res.json()

    const data   = json?.data ?? json
    const stats  = data?.statistics ?? {}
    const videos = data?.top_videos ?? data?.videos ?? []

    const followerCount = stats?.followers_count ?? stats?.follower_count ?? 0
    const avgViewsRaw   = stats?.average_views   ?? stats?.avg_views      ?? 0
    const bestVideoRaw  = videos.length > 0
      ? Math.max(...videos.map((v: { views?: number; play_count?: number }) => v?.views ?? v?.play_count ?? 0))
      : 0

    return NextResponse.json({
      average_views:    mapAvgViews(avgViewsRaw),
      best_video_range: mapBestVideo(bestVideoRaw),
      followers:        followerCount,
      author_name:      data?.nickname ?? data?.username ?? username,
      avatar_url:       data?.avatar   ?? null,
      avg_views_raw:    Math.round(avgViewsRaw),
      best_video_raw:   bestVideoRaw,
    })
  } catch (err) {
    console.error("[TikTok Lookup Error]", err)
    return NextResponse.json({ error: "Failed to fetch TikTok data" }, { status: 500 })
  }
}
