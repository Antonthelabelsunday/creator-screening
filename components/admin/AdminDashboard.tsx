"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, RefreshCw } from "lucide-react"
import FilterBar, { type Filters } from "./FilterBar"
import ApplicantDrawer from "./ApplicantDrawer"
import type { Application } from "@/lib/types"

type SortField = "score" | "created_at"
type SortDir = "asc" | "desc"

const CATEGORY_BADGE: Record<string, string> = {
  "Top Priority": "bg-green-100 text-green-700 border-green-200",
  "Strong Fit": "bg-blue-100 text-blue-700 border-blue-200",
  "Mid Fit": "bg-amber-100 text-amber-700 border-amber-200",
  "Low Priority": "bg-red-100 text-red-700 border-red-200",
}

const SCORE_BAR_COLOR: Record<string, string> = {
  "Top Priority": "bg-green-500",
  "Strong Fit": "bg-blue-500",
  "Mid Fit": "bg-amber-500",
  "Low Priority": "bg-red-400",
}

function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: SortDir }) {
  if (field !== current) return <ArrowUpDown className="w-3 h-3 text-gray-300 inline ml-1" />
  return dir === "asc"
    ? <ArrowUp className="w-3 h-3 text-gray-700 inline ml-1" />
    : <ArrowDown className="w-3 h-3 text-gray-700 inline ml-1" />
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: "", platform: "", creator_type: "", average_views: "", category: "", tag: "",
  })
  const [sortField, setSortField] = useState<SortField>("score")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [selected, setSelected] = useState<Application | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/applications")
      const data = await res.json()
      setApplications(data)
    } catch (e) {
      console.error("Failed to fetch applications", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("desc") }
  }

  const filtered = useMemo(() => {
    return applications
      .filter((a) => {
        if (filters.search && !a.email.toLowerCase().includes(filters.search.toLowerCase())) return false
        if (filters.platform && a.platform !== filters.platform) return false
        if (filters.creator_type && !a.creator_type.includes(filters.creator_type as never)) return false
        if (filters.average_views && a.average_views !== filters.average_views) return false
        if (filters.category && a.category !== filters.category) return false
        if (filters.tag && !a.tags.includes(filters.tag)) return false
        return true
      })
      .sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1
        if (sortField === "score") return (a.score - b.score) * mult
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * mult
      })
  }, [applications, filters, sortField, sortDir])

  const stats = useMemo(() => ({
    total: applications.length,
    topPriority: applications.filter((a) => a.category === "Top Priority").length,
    avgScore: applications.length
      ? Math.round(applications.reduce((s, a) => s + a.score, 0) / applications.length)
      : 0,
  }), [applications])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold tracking-widest uppercase text-black/40 hover:text-black transition-colors">
            Creator Program
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">Applications</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span><strong className="text-gray-900">{stats.topPriority}</strong> top priority</span>
          </div>
          <span><strong className="text-gray-900">{stats.total}</strong> total</span>
          <span>Avg score: <strong className="text-gray-900">{stats.avgScore}</strong></span>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </header>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={applications.length}
        filteredCount={filtered.length}
      />

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scroll">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-sm text-gray-400">Loading…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-sm">No applicants match the current filters.</p>
            <button
              className="mt-3 text-xs text-gray-500 underline hover:text-gray-800"
              onClick={() => setFilters({ search: "", platform: "", creator_type: "", average_views: "", category: "", tag: "" })}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <table className="w-full min-w-[780px]">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 w-52">Email</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-36">Platform</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-32">Type</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-32">Avg Views</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-32">Best Video</th>
                <th
                  className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-24 cursor-pointer select-none hover:text-gray-600"
                  onClick={() => handleSort("score")}
                >
                  Score <SortIcon field="score" current={sortField} dir={sortDir} />
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-32">Category</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">Tags</th>
                <th
                  className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 w-24 cursor-pointer select-none hover:text-gray-600"
                  onClick={() => handleSort("created_at")}
                >
                  Date <SortIcon field="created_at" current={sortField} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="bg-white hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  {/* Email */}
                  <td className="px-6 py-3.5">
                    <div className="text-sm font-medium text-gray-800 truncate max-w-[190px]">{a.email}</div>
                    {a.content_niche && (
                      <div className="text-xs text-gray-400 truncate max-w-[190px]">{a.content_niche}</div>
                    )}
                  </td>

                  {/* Platform */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-600">{a.platform}</span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-600">
                      {a.creator_type.length > 0 ? a.creator_type.join(", ") : <span className="text-gray-300">—</span>}
                    </span>
                  </td>

                  {/* Avg Views */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-700">{a.average_views}</span>
                  </td>

                  {/* Best Video */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-700">{a.best_video_range}</span>
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${SCORE_BAR_COLOR[a.category]}`}
                          style={{ width: `${a.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{a.score}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_BADGE[a.category]}`}>
                      {a.category}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {a.tags.length === 0 ? (
                        <span className="text-gray-300 text-xs">—</span>
                      ) : (
                        a.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-gray-900 text-white text-xs font-semibold rounded">
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">
                        {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && <ApplicantDrawer applicant={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
