import type { Application } from "./types"
import { MOCK_APPLICATIONS } from "./mockData"

// In-memory store — seeded with mock data.
// Phase 2: replace with Supabase.
const store: Application[] = [...MOCK_APPLICATIONS]

export function getApplications(): Application[] {
  return store
}

export function addApplication(application: Application): void {
  store.unshift(application) // newest first
}

export function deleteApplication(id: string): void {
  const idx = store.findIndex((a) => a.id === id)
  if (idx !== -1) store.splice(idx, 1)
}
