import { NextRequest, NextResponse } from "next/server"
import type { AverageViews, BestVideoRange } from "@/lib/types"

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? ""
const RAPIDAPI_HOST = "tiktok-scraper7.p.rapidapi.com"
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`

const headers = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": RAPIDAPI_HOST,
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

  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 })
  }

  try {
    // Fetch user info and recent videos in parallel
    const [userRes, videosRes] = await Promise.all([
      fetch(`${RAPIDAPI_BASE}/user/info?username=${encodeURIComponent(username)}`, { headers }),
      fetch(`${RAPIDAPI_BASE}/user/posts?username=${encodeURIComponent(username)}&count=20`, { headers }),
    ])

    if (userRes.status === 404 || videosRes.status === 404) {
      return NextResponse.json({ error: "TikTok account not found" }, { status: 404 })
    }

    if (userRes.status === 401 || userRes.status === 403) {
      return NextResponse.json({ error: "API key invalid or quota exceeded" }, { status: 500 })
    }

    if (!userRes.ok || !videosRes.ok) {
      return NextResponse.json({ error: "Could not fetch TikTok stats" }, { status: 502 })
    }

    const userJson = await userRes.json()
    const videosJson = await videosRes.json()

    // tiktok-scraper7 user/info shape
    const stats = userJson?.userInfo?.stats ?? userJson?.data?.stats ?? {}
    const user  = userJson?.userInfo?.user  ?? userJson?.data?.user  ?? {}

    // Videos — try multiple response shapes
    const items: { stats?: { playCount?: number }; video?: unknown }[] =
      videosJson?.data?.itemList ??
      videosJson?.itemList ??
      videosJson?.data?.videos ??
      []

    if (items.length === 0) {
      return NextResponse.json({ error: "No video data found for this account" }, { status: 404 })
    }

    const playCounts = items
      .map((v) => v?.stats?.playCount ?? 0)
      .filter((n) => n > 0)

    if (playCounts.length === 0) {
      return NextResponse.json({ error: "Could not read view counts" }, { status: 404 })
    }

    const avgViewsRaw = playCounts.reduce((s, n) => s + n, 0) / playCounts.length
    const bestVideoRaw = Math.max(...playCounts)

    return NextResponse.json({
      average_views: mapAvgViews(avgViewsRaw),
      best_video_range: mapBestVideo(bestVideoRaw),
      followers: stats.followerCount ?? 0,
      author_name: user.nickname ?? user.uniqueId ?? username,
      avatar_url: user.avatarThumb ?? null,
      avg_views_raw: Math.round(avgViewsRaw),
      best_video_raw: bestVideoRaw,
    })
  } catch (err) {
    console.error("[TikTok Lookup Error]", err)
    return NextResponse.json({ error: "Failed to fetch TikTok data" }, { status: 500 })
  }
}
