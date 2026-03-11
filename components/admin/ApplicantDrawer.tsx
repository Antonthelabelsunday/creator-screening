"use client"

import { useState } from "react"
import { X, ExternalLink, Trash2, Mail } from "lucide-react"
import type { Application } from "@/lib/types"

interface Props {
  applicant: Application | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const CATEGORY_STYLES: Record<string, string> = {
  "Top Priority": "bg-green-100 text-green-700 border-green-200",
  "Strong Fit": "bg-blue-100 text-blue-700 border-blue-200",
  "Mid Fit": "bg-amber-100 text-amber-700 border-amber-200",
  "Low Priority": "bg-red-100 text-red-700 border-red-200",
}

const SCORE_COLORS: Record<string, string> = {
  "Top Priority": "text-green-600",
  "Strong Fit": "text-blue-600",
  "Mid Fit": "text-amber-600",
  "Low Priority": "text-red-600",
}

const SCORE_BAR: Record<string, string> = {
  "Top Priority": "bg-green-500",
  "Strong Fit": "bg-blue-500",
  "Mid Fit": "bg-amber-500",
  "Low Priority": "bg-red-400",
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-300 italic">—</span>}</p>
    </div>
  )
}

function buildMailtoHref(email: string): string {
  const firstName = email.split("@")[0].split(/[._]/)[0]
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  const subject = "Creator collaboration – Label Sunday"
  const body = `Hi ${name},\n\nWe came across your TikTok profile and we'd love to explore a potential collaboration with you.\n\nWe think your content would be a great fit for what we're working on — would you be open to a quick chat?\n\nLooking forward to hearing from you.\n\nBest,\nAnton\nLabel Sunday`
  return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function ApplicantDrawer({ applicant, onClose, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!applicant) return null

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    await onDelete(applicant.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_STYLES[applicant.category]}`}>
                {applicant.category}
              </span>
            </div>
            <p className="text-sm text-gray-500">{applicant.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">{applicant.platform}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Score bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</span>
            <span className={`text-2xl font-black ${SCORE_COLORS[applicant.category]}`}>
              {applicant.score}
              <span className="text-sm font-normal text-gray-400">/100</span>
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${SCORE_BAR[applicant.category]}`}
              style={{ width: `${applicant.score}%` }}
            />
          </div>
          {applicant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {applicant.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-black text-white text-xs font-semibold rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* Contact */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <Field label="Email" value={applicant.email} />
                <div className="py-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Profile</p>
                  {applicant.profile_link ? (
                    <a
                      href={applicant.profile_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      {applicant.profile_link.replace("https://", "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-gray-300 italic text-sm">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Creator info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Creator Info</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <Field
                  label="Type"
                  value={applicant.creator_type.length > 0 ? applicant.creator_type.join(", ") : null}
                />
                <Field label="Niche" value={applicant.content_niche || null} />
                <Field label="Average Views" value={applicant.average_views} />
                <Field label="Best Video" value={applicant.best_video_range} />
              </div>
            </div>

            <div className="pt-1 pb-2">
              <p className="text-xs text-gray-400">
                Applied {new Date(applicant.created_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer — actions */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100">
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <a
                href={buildMailtoHref(applicant.email)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send email
              </a>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
