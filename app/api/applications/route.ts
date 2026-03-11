import { NextRequest, NextResponse } from "next/server"
import { calculateScore, getCategory, generateTags } from "@/lib/scoring"
import { supabase } from "@/lib/supabase"
import { getApplications, addApplication } from "@/lib/store"
import type { FormData, Application } from "@/lib/types"

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("score", { ascending: false })
    if (!error && data) return NextResponse.json(data)
    console.error("[Supabase GET Error]", error)
  }
  // Fallback to in-memory store
  return NextResponse.json(getApplications())
}

export async function POST(req: NextRequest) {
  try {
    const body: FormData = await req.json()

    const score = calculateScore(body)
    const category = getCategory(score)
    const tags = generateTags(body)

    const application: Application = {
      ...body,
      platform: body.platform as Application["platform"],
      average_views: body.average_views as Application["average_views"],
      best_video_range: body.best_video_range as Application["best_video_range"],
      id: crypto.randomUUID(),
      score,
      category,
      tags,
      created_at: new Date().toISOString(),
    }

    if (supabase) {
      const { error } = await supabase.from("applications").insert([{
        id: application.id,
        email: application.email,
        platform: application.platform,
        profile_link: application.profile_link,
        creator_type: application.creator_type,
        content_niche: application.content_niche,
        average_views: application.average_views,
        best_video_range: application.best_video_range,
        score: application.score,
        category: application.category,
        tags: application.tags,
        created_at: application.created_at,
      }])
      if (error) {
        console.error("[Supabase INSERT Error]", error)
        addApplication(application)
      }
    } else {
      addApplication(application)
    }

    console.log("[Application Received]", {
      email: application.email,
      score: application.score,
      category: application.category,
      tags: application.tags,
    })

    return NextResponse.json({ success: true, score, category, tags }, { status: 201 })
  } catch (err) {
    console.error("[Application Error]", err)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
