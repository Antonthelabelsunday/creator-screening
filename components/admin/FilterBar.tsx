"use client"

import { Search, X } from "lucide-react"
import type { Platform, Category } from "@/lib/types"
import { PLATFORMS, CREATOR_TYPES, AVERAGE_VIEWS } from "@/lib/types"

export interface Filters {
  search: string
  platform: Platform | ""
  creator_type: string
  average_views: string
  category: Category | ""
  tag: string
}

interface Props {
  filters: Filters
  onFiltersChange: (f: Filters) => void
  totalCount: number
  filteredCount: number
}

const CATEGORIES: Category[] = ["Top Priority", "Strong Fit", "Mid Fit", "Low Priority"]

const ALL_TAGS = ["HIGH REACH", "EDITOR", "DANCER", "VIRAL"]

const CATEGORY_COLORS: Record<string, string> = {
  "Top Priority": "bg-green-100 text-green-700",
  "Strong Fit": "bg-blue-100 text-blue-700",
  "Mid Fit": "bg-amber-100 text-amber-700",
  "Low Priority": "bg-red-100 text-red-700",
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:border-black focus:ring-1 focus:ring-black/10 appearance-none cursor-pointer min-w-[130px]"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterBar({ filters, onFiltersChange, totalCount, filteredCount }: Props) {
  const update = (patch: Partial<Filters>) => onFiltersChange({ ...filters, ...patch })

  const hasActive =
    filters.search ||
    filters.platform ||
    filters.creator_type ||
    filters.average_views ||
    filters.category ||
    filters.tag

  const clearAll = () =>
    onFiltersChange({ search: "", platform: "", creator_type: "", average_views: "", category: "", tag: "" })

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Email..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black/10"
            />
          </div>
        </div>

        <FilterSelect
          label="Platform"
          value={filters.platform}
          options={PLATFORMS.map((p) => ({ value: p, label: p }))}
          onChange={(v) => update({ platform: v as Platform | "" })}
        />

        <FilterSelect
          label="Creator Type"
          value={filters.creator_type}
          options={CREATOR_TYPES.map((t) => ({ value: t, label: t }))}
          onChange={(v) => update({ creator_type: v })}
        />

        <FilterSelect
          label="Avg Views"
          value={filters.average_views}
          options={AVERAGE_VIEWS.map((v) => ({ value: v, label: v }))}
          onChange={(v) => update({ average_views: v })}
        />

        <FilterSelect
          label="Category"
          value={filters.category}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          onChange={(v) => update({ category: v as Category | "" })}
        />

        <FilterSelect
          label="Tag"
          value={filters.tag}
          options={ALL_TAGS.map((t) => ({ value: t, label: t }))}
          onChange={(v) => update({ tag: v })}
        />

        <div className="flex items-end gap-3 ml-auto">
          {hasActive && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
          <div className="text-xs text-gray-400 py-2">
            <span className="font-bold text-gray-700">{filteredCount}</span>
            {filteredCount !== totalCount && <span className="text-gray-400"> of {totalCount}</span>}{" "}
            applicants
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActive && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {filters.platform && (
            <Chip label={`Platform: ${filters.platform}`} onRemove={() => update({ platform: "" })} color="bg-gray-100 text-gray-600" />
          )}
          {filters.creator_type && (
            <Chip label={`Type: ${filters.creator_type}`} onRemove={() => update({ creator_type: "" })} color="bg-gray-100 text-gray-600" />
          )}
          {filters.average_views && (
            <Chip label={`Views: ${filters.average_views}`} onRemove={() => update({ average_views: "" })} color="bg-gray-100 text-gray-600" />
          )}
          {filters.category && (
            <Chip label={filters.category} onRemove={() => update({ category: "" })} color={CATEGORY_COLORS[filters.category] ?? "bg-gray-100 text-gray-600"} />
          )}
          {filters.tag && (
            <Chip label={filters.tag} onRemove={() => update({ tag: "" })} color="bg-black text-white" />
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  return (
    <button
      onClick={onRemove}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color} hover:opacity-80 transition-opacity`}
    >
      {label}
      <X className="w-3 h-3" />
    </button>
  )
}
