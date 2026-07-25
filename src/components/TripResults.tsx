import { DailyLogChart, type DailyLog } from "@/components/DailyLogChart"
import { Card } from "@/components/ui/card"
import { AlertTriangle, Route, Clock, Calendar } from "lucide-react"

interface Stop {
  label: string
  lat: number
  lon: number
  display_name: string
}

interface TripResultsProps {
  route: {
    total_distance_miles: number
    total_duration_hours: number
    stops: Stop[]
  }
  trip_start: string | null
  trip_end: string | null
  needs_34hr_restart: boolean
  warnings: string[]
  daily_logs: DailyLog[]
}

export function TripResults({
  route,
  trip_start,
  trip_end,
  needs_34hr_restart,
  warnings,
  daily_logs,
}: TripResultsProps) {
  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <Card className="p-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Route size={16} className="text-amber" />
          <span className="text-sm text-steel">Distance</span>
          <span className="font-mono text-paper">{route.total_distance_miles} mi</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber" />
          <span className="text-sm text-steel">Drive time</span>
          <span className="font-mono text-paper">{route.total_duration_hours} h</span>
        </div>
        {trip_start && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber" />
            <span className="text-sm text-steel">Starts</span>
            <span className="font-mono text-paper">{new Date(trip_start).toLocaleString()}</span>
          </div>
        )}
        {trip_end && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber" />
            <span className="text-sm text-steel">Ends</span>
            <span className="font-mono text-paper">{new Date(trip_end).toLocaleString()}</span>
          </div>
        )}
      </Card>

      {needs_34hr_restart && (
        <div className="flex items-center gap-2 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-amber text-sm">
          <AlertTriangle size={16} />
          This trip requires a 34-hour restart before continuing.
        </div>
      )}

      {warnings.length > 0 && (
        <div className="flex flex-col gap-2">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {w}
            </div>
          ))}
        </div>
      )}

      <Card className="p-6">
        <h2 className="font-display text-sm uppercase tracking-wide text-steel mb-3">Stops</h2>
        <div className="flex flex-col gap-2">
          {route.stops.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-paper">{s.label}</span>
              <span className="text-steel">{s.display_name}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-sm uppercase tracking-wide text-steel">Daily ELD Logs</h2>
        {daily_logs.map((log) => (
          <div key={log.date}>
            <p className="text-sm text-paper mb-2 font-mono">{log.date}</p>
            <DailyLogChart log={log} />
          </div>
        ))}
      </div>
    </div>
  )
}