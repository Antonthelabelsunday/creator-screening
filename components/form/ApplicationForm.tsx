"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Loader2, Search, AlertCircle } from "lucide-react"
import type { FormData, Platform, CreatorType, AverageViews, BestVideoRange } from "@/lib/types"
import { PLATFORMS, CREATOR_TYPES, AVERAGE_VIEWS, BEST_VIDEO_RANGES } from "@/lib/types"

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
  platform: "",
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

function extractTikTokUsername(input: string): string | null {
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/tiktok\.com\/@([^/?&#\s]+)/i)
  if (urlMatch) return urlMatch[1]
  if (trimmed.startsWith("@")) return trimmed.slice(1)
  if (/^[a-zA-Z0-9._]+$/.test(trimmed)) return trimmed
  return null
}

// ── Reusable pill button ─────────────────────────────────────────────────────
function Pill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
        active
          ? "border-black bg-black text-white"
          : "border-gray-200 text-gray-600 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  )
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

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }))

  const toggleType = (t: CreatorType) =>
    set({
      creator_type: form.creator_type.includes(t)
        ? form.creator_type.filter((x) => x !== t)
        : [...form.creator_type, t],
    })

  const handleProfileLinkChange = (value: string) => {
    set({ profile_link: value })
    if (tiktokData) {
      setTiktokData(null)
      set({ average_views: "", best_video_range: "" })
    }
    setLookupError(null)
  }

  const handleAnalyze = async () => {
    const username = extractTikTokUsername(form.profile_link)
    if (!username) {
      setLookupError("Could not read a TikTok username from that link.")
      return
    }

    setLookupLoading(true)
    setLookupError(null)
    setTiktokData(null)

    try {
      const res = await fetch(`/api/tiktok-lookup?username=${encodeURIComponent(username)}`)
      const json = await res.json()

      if (!res.ok) {
        setLookupError(json.error ?? "Could not fetch TikTok data. Try again.")
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
  }

  const canAnalyze = form.platform === "TikTok" && form.profile_link.trim().length > 0 && !lookupLoading

  const isValid =
    form.email.trim() &&
    form.platform &&
    form.profile_link.trim() &&
    form.average_views &&
    form.best_video_range

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
          <p className="text-gray-500 text-sm">Takes 1 minute. No CV required.</p>
        </div>

        <div className="space-y-8">
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

          {/* Platform */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Platform <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <Pill
                  key={p}
                  label={p}
                  active={form.platform === p}
                  onClick={() => set({ platform: p as Platform })}
                />
              ))}
            </div>
          </div>

          {/* Profile link + Analyze (TikTok only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Profile Link <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.profile_link}
                onChange={(e) => handleProfileLinkChange(e.target.value)}
                placeholder={
                  form.platform === "TikTok"
                    ? "https://tiktok.com/@yourhandle"
                    : form.platform === "Instagram Reels"
                    ? "https://instagram.com/yourhandle"
                    : "https://..."
                }
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
              />
              {form.platform === "TikTok" && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80 active:scale-95 transition-all whitespace-nowrap"
                >
                  {lookupLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {lookupLoading ? "Analyzing…" : "Analyze"}
                </button>
              )}
            </div>

            {/* TikTok verified badge */}
            {tiktokData && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <span className="font-semibold">@{extractTikTokUsername(form.profile_link)}</span>
                  {" · "}
                  {formatNumber(tiktokData.followers)} followers
                  {" · "}
                  ~{formatNumber(tiktokData.avg_views_raw)} avg views
                  {" · "}
                  best {formatNumber(tiktokData.best_video_raw)} views
                </span>
              </div>
            )}

            {/* Lookup error */}
            {lookupError && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Creator type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              What do you make?
            </label>
            <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
            <div className="flex gap-2">
              {CREATOR_TYPES.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  active={form.creator_type.includes(t)}
                  onClick={() => toggleType(t)}
                />
              ))}
            </div>
          </div>

          {/* Content niche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your niche{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.content_niche}
              onChange={(e) => set({ content_niche: e.target.value })}
              placeholder="e.g. music edits, comedy, lifestyle..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          {/* Stats — auto-filled by analyze or manual */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Average views per video <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVERAGE_VIEWS.map((v) => (
                <Pill
                  key={v}
                  label={v}
                  active={form.average_views === v}
                  onClick={() => set({ average_views: v as AverageViews })}
                />
              ))}
            </div>
            {tiktokData && (
              <p className="mt-1.5 text-xs text-green-600">Auto-filled from your TikTok profile</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Best performing video <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BEST_VIDEO_RANGES.map((v) => (
                <Pill
                  key={v}
                  label={v}
                  active={form.best_video_range === v}
                  onClick={() => set({ best_video_range: v as BestVideoRange })}
                />
              ))}
            </div>
            {tiktokData && (
              <p className="mt-1.5 text-xs text-green-600">Auto-filled from your TikTok profile</p>
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
