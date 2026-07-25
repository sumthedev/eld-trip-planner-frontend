import * as React from "react"
import { useEffect, useMemo } from "react"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import { renderToStaticMarkup } from "react-dom/server"
import { MapPin, Package, Flag } from "lucide-react"


interface Stop {
  label: string
  lat: number
  lon: number
  display_name: string
}

type LatLng = [number, number]

interface RouteMapProps {
  route: {
    total_distance_miles: number
    total_duration_hours: number
    geometry?: unknown
    stops: Stop[]
  }
  className?: string
}

const STOP_ICON: Record<string, React.ComponentType<{ size?: number }>> = {
  Current: MapPin,
  Pickup: Package,
  Dropoff: Flag,
}

function buildDivIcon(label: string) {
  const Icon = STOP_ICON[label] ?? MapPin
  const html = renderToStaticMarkup(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "9999px",
        background: "#f5a623",
        border: "2px solid #1f2126",
        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        color: "#161719",
      }}
    >
      <Icon size={14} />
    </div>
  )
  return L.divIcon({
    html,
    className: "trip-map-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

// Normalizes whatever geometry shape the backend sends into [lat, lon] pairs.
function extractLatLngs(geometry: unknown): LatLng[] {
  if (!geometry) return []

  // GeoJSON LineString / Feature
  if (typeof geometry === "object" && geometry !== null) {
    const g = geometry as Record<string, unknown>
    if (Array.isArray(g.coordinates)) {
      return (g.coordinates as number[][]).map(
        ([lon, lat]) => [lat, lon] as LatLng
      )
    }
    if (g.geometry && typeof g.geometry === "object") {
      return extractLatLngs(g.geometry)
    }
  }

  // Raw array of coordinate pairs — guess orientation (lon/lat is standard
  // for GeoJSON-style APIs; treat first value > 90 as lon since lat maxes at 90).
  if (Array.isArray(geometry)) {
    return (geometry as number[][])
      .filter((pair) => Array.isArray(pair) && pair.length === 2)
      .map(([a, b]) => (Math.abs(a) > 90 ? ([b, a] as LatLng) : ([a, b] as LatLng)))
  }

  return []
}

function FitToRoute({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [32, 32] })
  }, [map, points])
  return null
}

export function TripMap({ route, className = "" }: RouteMapProps) {
  const routeLine = useMemo(
    () => extractLatLngs(route.geometry),
    [route.geometry]
  )

  const stopPoints: LatLng[] = useMemo(
    () => route.stops.map((s) => [s.lat, s.lon]),
    [route.stops]
  )

  const boundsPoints = routeLine.length > 0 ? routeLine : stopPoints
  const center: LatLng =
    boundsPoints[Math.floor(boundsPoints.length / 2)] ?? [39.5, -98.35]

  if (route.stops.length === 0) return null

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-panel-line bg-panel ${className}`}
    >
      <div className="border-b border-panel-line px-6 py-4">
        <h2 className="font-display text-sm uppercase tracking-wide text-steel">
          Route Map
        </h2>
      </div>

      <div className="h-[420px] w-full">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "#1f2126" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routeLine.length > 1 && (
            <Polyline
              positions={routeLine}
              pathOptions={{ color: "#f5a623", weight: 4, opacity: 0.9 }}
            />
          )}

          {route.stops.map((stop, i) => (
            <Marker
              key={`${stop.label}-${i}`}
              position={[stop.lat, stop.lon]}
              icon={buildDivIcon(stop.label)}
            >
              <Popup>
                <span className="font-semibold">{stop.label}</span>
                <br />
                {stop.display_name}
              </Popup>
            </Marker>
          ))}

          <FitToRoute points={boundsPoints} />
        </MapContainer>
      </div>
    </div>
  )
}