"use client"

import Link from "next/link"
import { ArrowRight, Video, Zap, Music, TrendingUp } from "lucide-react"

const creatorTypes = [
  {
    icon: Video,
    label: "Video Editors",
    description: "Cinematic cuts, transitions & polished edits",
  },
  {
    icon: TrendingUp,
    label: "TikTok Creators",
    description: "Trend-based & short-form video specialists",
  },
  {
    icon: Zap,
    label: "Meme Creators",
    description: "Viral content, comedy & high-engagement formats",
  },
  {
    icon: Music,
    label: "Music Promoters",
    description: "Experts at pushing tracks to new audiences",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-sm font-semibold tracking-widest uppercase text-white/40">
          Creator Program
        </span>
        <Link
          href="/admin"
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Admin →
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="pt-20 pb-16 md:pt-32 md:pb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-white/70 tracking-wide">
              Now accepting applications
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6">
            WE&apos;RE{" "}
            <br />
            LOOKING FOR{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
              CREATORS.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/50 max-w-xl leading-relaxed mb-12">
            We partner with video editors, TikTok creators, meme makers, and
            music promotion specialists to build content that actually moves.
            If your content performs — we want to hear from you.
          </p>

          {/* CTA */}
          <Link
            href="/apply"
            className="inline-flex items-center gap-3 bg-white text-black font-bold text-base px-8 py-4 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-150 group"
          >
            Apply Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-4 text-xs text-white/25">
            Takes about 3 minutes. No CV required.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-16" />

        {/* Creator Type Cards */}
        <div className="pb-24">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-8">
            Who we work with
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creatorTypes.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-white/70" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{label}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="border-t border-white/10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold text-white">Ready to apply?</p>
            <p className="text-sm text-white/40">
              All skill levels welcome. We evaluate based on performance.
            </p>
          </div>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-150 group"
          >
            Start Application
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  )
}
