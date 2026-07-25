import * as React from "react"
import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, Package, Flag, Clock, ArrowRight } from "lucide-react"

export interface TripFormData {
  currentLocation: string
  pickupLocation: string
  dropoffLocation: string
  cycleUsedHours: number
}

interface TripFormProps {
  onSubmit?: (data: TripFormData) => void
}

const ROUTE_STOPS = [
  { key: "currentLocation", label: "Current", icon: MapPin },
  { key: "pickupLocation", label: "Pickup", icon: Package },
  { key: "dropoffLocation", label: "Dropoff", icon: Flag },
] as const

export function TripForm({ onSubmit }: TripFormProps) {
  const [form, setForm] = useState<TripFormData>({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    cycleUsedHours: 0,
  })

  const filledCount = useMemo(() => {
    return ROUTE_STOPS.filter(
      (stop) => form[stop.key as keyof TripFormData].toString().trim() !== ""
    ).length
  }, [form])

  const progressPercent =
    filledCount === 0 ? 0 : ((filledCount - 1) / (ROUTE_STOPS.length - 1)) * 100

  function handleChange(field: keyof TripFormData, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: field === "cycleUsedHours" ? Number(value) : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <Card className="log-grid w-full max-w-xl overflow-hidden">
      {/* Route strip — signature element */}
      <div className="border-b border-panel-line bg-asphalt/60 px-8 pb-8 pt-7">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[13px] h-px bg-panel-line" />
          <div
            className="route-progress absolute left-0 top-[13px] h-px bg-amber"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="relative flex items-start justify-between">
            {ROUTE_STOPS.map((stop, i) => {
              const filled =
                form[stop.key as keyof TripFormData].toString().trim() !== ""
              const Icon = stop.icon
              return (
                <div key={stop.key} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-[27px] w-[27px] items-center justify-center rounded-full border-2 transition-colors ${
                      filled
                        ? "border-amber bg-amber text-asphalt"
                        : "border-panel-line bg-panel text-steel"
                    }`}
                  >
                    <Icon size={13} strokeWidth={2.5} />
                  </div>
                  <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                    {stop.label}
                  </span>
                  {i < ROUTE_STOPS.length - 1 && (
                    <ArrowRight
                      className="absolute top-1.5 text-panel-line"
                      style={{ left: `calc(${(i + 0.5) * 50}% - 6px)` }}
                      size={13}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="px-8 py-8">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-paper">
          Trip Manifest
        </h1>
        <p className="mt-1 text-sm text-steel">
          Enter the stops and hours used so we can build the drive schedule.
        </p>

        <div className="mt-7 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentLocation">Current location</Label>
            <Input
              id="currentLocation"
              placeholder="Chicago, IL"
              value={form.currentLocation}
              onChange={(e) => handleChange("currentLocation", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pickupLocation">Pickup location</Label>
              <Input
                id="pickupLocation"
                placeholder="Dallas, TX"
                value={form.pickupLocation}
                onChange={(e) => handleChange("pickupLocation", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dropoffLocation">Dropoff location</Label>
              <Input
                id="dropoffLocation"
                placeholder="Los Angeles, CA"
                value={form.dropoffLocation}
                onChange={(e) => handleChange("dropoffLocation", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cycleUsedHours" className="flex items-center gap-1.5">
              <Clock size={12} />
              Current cycle used (hours)
            </Label>
            <Input
              id="cycleUsedHours"
              type="number"
              min={0}
              max={70}
              step={0.5}
              placeholder="20"
              value={form.cycleUsedHours || ""}
              onChange={(e) => handleChange("cycleUsedHours", e.target.value)}
              required
            />
            <span className="text-xs text-steel">
              Hours used in the current 70-hour / 8-day cycle.
            </span>
          </div>
        </div>

        <Button type="submit" className="mt-8 w-full">
          Calculate trip
        </Button>
      </form>
    </Card>
  )
}
