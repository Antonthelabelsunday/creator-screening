"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import type { FormData, AverageViews, BestVideoRange } from "@/lib/types"

interface TikTokData {
  average_views: AverageViews
  best_video_range: BestVideoRange
  followers: number
  author_name: string
  avatar_url: string | null
  avg_views_raw: number
  best_video_raw: number
}

const INITIAL: FormData = {
  email: "",
  platform: "TikTok",
  profile_link: "",
  creator_type: [],
  content_niche: "",
  average_views: "",
  best_video_range: "",
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function cleanUsername(input: string): string {
  const trimmed = input.trim()
  // Strip full URL
  const urlMatch = trimmed.match(/tiktok\.com\/@([^/?&#\s]+)/i)
  if (urlMatch) return urlMatch[1]
  // Strip leading @
  return trimmed.replace(/^@+/, "")
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Application sent!</h1>
        <p className="text-gray-500 text-sm mb-8">
          We review all applications and will reach out if there&apos;s a fit.
        </p>
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

// ── Main form ────────────────────────────────────────────────────────────────
export default function ApplicationForm() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tiktokData, setTiktokData] = useState<TikTokData | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }))

  // Auto-analyze whenever the username changes (with 800 ms debounce)
  useEffect(() => {
    const username = cleanUsername(form.profile_link)

    if (!username) {
      setTiktokData(null)
      setLookupError(null)
      set({ average_views: "", best_video_range: "" })
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLookupLoading(true)
      setLookupError(null)
      setTiktokData(null)
      set({ average_views: "", best_video_range: "" })

      try {
        const res = await fetch(`/api/tiktok-lookup?username=${encodeURIComponent(username)}`)
        const json = await res.json()

        if (!res.ok) {
          setLookupError(json.error ?? "Could not fetch TikTok data.")
          return
        }

        setTiktokData(json as TikTokData)
        set({
          average_views: json.average_views as AverageViews,
          best_video_range: json.best_video_range as BestVideoRange,
        })
      } catch {
        setLookupError("Network error. Please try again.")
      } finally {
        setLookupLoading(false)
      }
    }, 800)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.profile_link])

  const isValid =
    form.email.trim().length > 0 &&
    cleanUsername(form.profile_link).length > 0 &&
    !lookupLoading

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <SuccessScreen />

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-widest uppercase text-black/40 hover:text-black transition-colors"
          >
            Creator Program
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Apply</h1>
          <p className="text-gray-500 text-sm">Takes 30 seconds. No CV required.</p>
        </div>

        <div className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          {/* TikTok username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              TikTok username <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all">
              <span className="pl-4 pr-1 text-gray-400 text-sm select-none">@</span>
              <input
                type="text"
                value={form.profile_link.replace(/^@+/, "")}
                onChange={(e) => set({ profile_link: e.target.value.replace(/^@+/, "") })}
                placeholder="yourhandle"
                className="flex-1 py-3 pr-4 text-sm outline-none bg-transparent"
              />
              {lookupLoading && (
                <div className="pr-4">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Verified badge */}
            {tiktokData && !lookupLoading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <span className="font-semibold">{tiktokData.author_name}</span>
                  {" · "}
                  {formatNumber(tiktokData.followers)} followers
                  {" · "}
                  ~{formatNumber(tiktokData.avg_views_raw)} avg views
                </span>
              </div>
            )}

            {/* Lookup error */}
            {lookupError && !lookupLoading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="inline-flex items-center gap-2 bg-black text-white font-bold text-sm px-8 py-4 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/80 active:scale-95 transition-all group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Submit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
