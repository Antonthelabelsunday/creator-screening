import { NextRequest, NextResponse } from "next/server"
import type { AverageViews, BestVideoRange } from "@/lib/types"

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
    const res = await fetch(
      `https://www.tiktok.com/@${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "TikTok account not found" }, { status: 404 })
    }

    const html = await res.text()

    // Extract embedded JSON from TikTok's SSR data
    const match = html.match(
      /id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(\{[\s\S]+?\})<\/script>/
    )
    if (!match) {
      return NextResponse.json({ error: "Could not parse TikTok page" }, { status: 502 })
    }

    let pageData: Record<string, unknown>
    try {
      pageData = JSON.parse(match[1])
    } catch {
      return NextResponse.json({ error: "Could not parse TikTok data" }, { status: 502 })
    }

    const scope = (pageData as Record<string, Record<string, unknown>>)["__DEFAULT_SCOPE__"] ?? {}
    const userDetail = (scope as Record<string, Record<string, unknown>>)["webapp.user-detail"]
    const userInfo = (userDetail as Record<string, Record<string, unknown>> | undefined)?.["userInfo"]

    if (!userInfo) {
      return NextResponse.json({ error: "TikTok account not found" }, { status: 404 })
    }

    const rawStats = (userInfo as Record<string, unknown>)["statsV2"] ??
                     (userInfo as Record<string, unknown>)["stats"] ?? {}
    const rawUser  = (userInfo as Record<string, unknown>)["user"] ?? {}

    const stats = rawStats as Record<string, string | number>
    const user  = rawUser  as Record<string, string | number>

    const followerCount = parseInt(String(stats.followerCount ?? 0), 10)
    const heartCount    = parseInt(String(stats.heart ?? stats.heartCount ?? 0), 10)
    const videoCount    = Math.max(1, parseInt(String(stats.videoCount ?? 1), 10))

    // Estimate average views from total likes using a ~4% engagement rate
    // (average TikTok like-to-view ratio is roughly 3–5%)
    const avgLikesPerVideo = heartCount / videoCount
    const avgViewsRaw      = Math.round(avgLikesPerVideo / 0.04)

    // Best video is typically 5–10× the account average for active creators
    const bestVideoRaw = Math.round(avgViewsRaw * 7)

    const nickname  = String(user.nickname  ?? user.uniqueId ?? username)
    const avatarUrl = String(user.avatarLarger ?? user.avatarMedium ?? user.avatarThumb ?? "") || null

    return NextResponse.json({
      average_views:    mapAvgViews(avgViewsRaw),
      best_video_range: mapBestVideo(bestVideoRaw),
      followers:        followerCount,
      author_name:      nickname,
      avatar_url:       avatarUrl,
      avg_views_raw:    avgViewsRaw,
      best_video_raw:   bestVideoRaw,
    })
  } catch (err) {
    console.error("[TikTok Lookup Error]", err)
    return NextResponse.json({ error: "Failed to fetch TikTok data" }, { status: 500 })
  }
}
