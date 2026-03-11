import { NextRequest, NextResponse } from "next/server"
import type { AverageViews, BestVideoRange } from "@/lib/types"

const CHARTEX_BASE = "https://api.chartex.com"
const APP_ID = process.env.CHARTEX_APP_ID ?? ""
const APP_TOKEN = process.env.CHARTEX_APP_TOKEN ?? ""

const CHARTEX_HEADERS = {
  "X-APP-ID": APP_ID,
  "X-APP-TOKEN": APP_TOKEN,
  "Content-Type": "application/json",
}

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

  try {
    // Fetch top 20 videos sorted by views (default sort)
    const [videosRes, metaRes] = await Promise.all([
      fetch(
        `${CHARTEX_BASE}/external/v1/accounts/${encodeURIComponent(username)}/video-statistics/?limit=20&sort_by=tiktok_video_views`,
        { headers: CHARTEX_HEADERS }
      ),
      fetch(
        `${CHARTEX_BASE}/external/v1/accounts/${encodeURIComponent(username)}/metadata/`,
        { headers: CHARTEX_HEADERS }
      ),
    ])

    if (videosRes.status === 401 || metaRes.status === 401) {
      return NextResponse.json({ error: "Chartex credentials invalid" }, { status: 500 })
    }

    if (videosRes.status === 404 || metaRes.status === 404) {
      return NextResponse.json({ error: "TikTok account not found" }, { status: 404 })
    }

    if (!videosRes.ok || !metaRes.ok) {
      return NextResponse.json({ error: "Could not fetch TikTok stats" }, { status: 502 })
    }

    const videosJson = await videosRes.json()
    const metaJson = await metaRes.json()

    const items: { tiktok_video_views: number }[] = videosJson?.data?.items ?? []
    const meta = metaJson?.data ?? {}

    if (items.length === 0) {
      return NextResponse.json({ error: "No video data found for this account" }, { status: 404 })
    }

    const avgViewsRaw =
      items.reduce((sum, v) => sum + (v.tiktok_video_views ?? 0), 0) / items.length
    const bestVideoRaw = items[0].tiktok_video_views ?? 0

    return NextResponse.json({
      average_views: mapAvgViews(avgViewsRaw),
      best_video_range: mapBestVideo(bestVideoRaw),
      followers: meta.username_total_followers ?? 0,
      author_name: meta.author_name ?? username,
      avatar_url: meta.username_avatar_url ?? null,
      avg_views_raw: Math.round(avgViewsRaw),
      best_video_raw: bestVideoRaw,
    })
  } catch (err) {
    console.error("[TikTok Lookup Error]", err)
    return NextResponse.json({ error: "Failed to fetch TikTok data" }, { status: 500 })
  }
}
