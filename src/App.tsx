import { useState } from "react"
import { TripForm, type TripFormData } from "@/components/TripForm"
import { TripResults } from "@/components/TripResults"
import type { DailyLog } from "@/components/DailyLogChart"

const API_BASE = "http://localhost:8000"

interface TripPlanResponse {
  route: {
    total_distance_miles: number
    total_duration_hours: number
    geometry: unknown
    stops: { label: string; lat: number; lon: number; display_name: string }[]
  }
  trip_start: string | null
  trip_end: string | null
  needs_34hr_restart: boolean
  warnings: string[]
  daily_logs: DailyLog[]
}

function App() {
  const [result, setResult] = useState<TripPlanResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: TripFormData) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/trip/plan/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.error ?? `Request failed with status ${res.status}`)
      }

      const json: TripPlanResponse = await res.json()
      setResult(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 bg-asphalt p-6">
      <TripForm onSubmit={handleSubmit} />
      {loading && <p className="text-white">Planning trip…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <TripResults
          route={result.route}
          trip_start={result.trip_start}
          trip_end={result.trip_end}
          needs_34hr_restart={result.needs_34hr_restart}
          warnings={result.warnings}
          daily_logs={result.daily_logs}
        />
      )}
    </div>
  )
}

export default App