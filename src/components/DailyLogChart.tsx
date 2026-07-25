export type DutyStatus = "off_duty" | "sleeper_berth" | "driving" | "on_duty"

export interface LogSegment {
  status: DutyStatus
  start: string // ISO datetime
  end: string   // ISO datetime
}

export interface DailyLog {
  date: string
  segments: LogSegment[]
  totals_hours: Record<DutyStatus, number>
}

const LANES: { key: DutyStatus; label: string }[] = [
  { key: "off_duty", label: "OFF DUTY" },
  { key: "sleeper_berth", label: "SLEEPER BERTH" },
  { key: "driving", label: "DRIVING" },
  { key: "on_duty", label: "ON DUTY" },
]

const HOUR_LABELS = ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM", "12AM"]

function hoursSinceMidnight(iso: string, dayStart: Date): number {
  const d = new Date(iso)
  return (d.getTime() - dayStart.getTime()) / (1000 * 60 * 60)
}

export function DailyLogChart({ log }: { log: DailyLog }) {
  const width = 900
  const height = 200
  const leftPad = 150
  const topPad = 30
  const rowGap = 40
  const chartWidth = width - leftPad - 20

  const dayStart = new Date(`${log.date}T00:00:00`)
  const laneY = (status: DutyStatus) =>
    topPad + LANES.findIndex((l) => l.key === status) * rowGap
  const xForHour = (h: number) =>
    leftPad + (Math.max(0, Math.min(24, h)) / 24) * chartWidth

  const sorted = [...log.segments].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  const pathParts: string[] = []
  let prevY: number | null = null
  let prevX: number | null = null

  sorted.forEach((seg) => {
    const startH = hoursSinceMidnight(seg.start, dayStart)
    const endH = hoursSinceMidnight(seg.end, dayStart)
    const y = laneY(seg.status)
    const x1 = xForHour(startH)
    const x2 = xForHour(endH)

    if (prevY !== null && prevX !== null) {
      pathParts.push(`M ${prevX} ${prevY} L ${x1} ${prevY} L ${x1} ${y}`)
    } else {
      pathParts.push(`M ${x1} ${y}`)
    }
    pathParts.push(`L ${x2} ${y}`)
    prevY = y
    prevX = x2
  })

  const pathD = pathParts.join(" ")

  return (
    <div className="rounded-2xl border border-panel-line bg-panel p-6">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {HOUR_LABELS.map((label, i) => {
          const x = leftPad + (i / (HOUR_LABELS.length - 1)) * chartWidth
          return (
            <g key={label + i}>
              <text x={x} y={topPad - 12} fontSize={11} fill="#8a8f98" textAnchor="middle" fontFamily="monospace">
                {label}
              </text>
              <line x1={x} y1={topPad - 4} x2={x} y2={topPad + (LANES.length - 1) * rowGap + 10}
                stroke="#2a2d33" strokeWidth={1} />
            </g>
          )
        })}

        {LANES.map((lane, i) => {
          const y = topPad + i * rowGap
          return (
            <g key={lane.key}>
              <text x={0} y={y + 4} fontSize={11} fill="#e6e6e6" fontFamily="monospace" letterSpacing={1}>
                {lane.label}
              </text>
              <line x1={leftPad} y1={y} x2={leftPad + chartWidth} y2={y} stroke="#1f2126" strokeWidth={1} />
            </g>
          )
        })}

        {pathD && (
          <path d={pathD} fill="none" stroke="#f5a623" strokeWidth={2.5} strokeLinejoin="round" />
        )}
      </svg>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-steel font-mono">
        {LANES.map((lane) => (
          <span key={lane.key}>
            {lane.label}:{" "}
            <span className="text-paper">
              {(log.totals_hours[lane.key] ?? 0).toFixed(1)}h
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}