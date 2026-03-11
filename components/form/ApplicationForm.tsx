"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import type { FormData, Platform, CreatorType, AverageViews, BestVideoRange } from "@/lib/types"
import { PLATFORMS, CREATOR_TYPES, AVERAGE_VIEWS, BEST_VIDEO_RANGES } from "@/lib/types"

const INITIAL: FormData = {
  email: "",
  platform: "",
  profile_link: "",
  creator_type: [],
  content_niche: "",
  average_views: "",
  best_video_range: "",
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

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }))

  const toggleType = (t: CreatorType) =>
    set({
      creator_type: form.creator_type.includes(t)
        ? form.creator_type.filter((x) => x !== t)
        : [...form.creator_type, t],
    })

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

          {/* Profile link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Profile Link <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={form.profile_link}
              onChange={(e) => set({ profile_link: e.target.value })}
              placeholder="https://tiktok.com/@yourhandle"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
            />
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

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Average views */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Average views per video <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVERAGE_VIEWS.map((v) => (
                <Pill
                  key={v}
                  label={v}
                  active={form.average_views === v}
                  onClick={() => set({ average_views: v as AverageViews })}
                />
              ))}
            </div>
          </div>

          {/* Best video range */}
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
