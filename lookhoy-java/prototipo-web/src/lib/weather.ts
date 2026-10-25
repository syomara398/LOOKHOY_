import type { WeatherInfo } from "@/types"

// Open-Meteo: gratuito, sin API key y con CORS habilitado.
const GEO = "https://geocoding-api.open-meteo.com/v1/search"
const FORECAST = "https://api.open-meteo.com/v1/forecast"

// Códigos WMO → descripción en español
function describe(code: number): string {
  if (code === 0) return "Despejado"
  if (code === 1) return "Mayormente despejado"
  if (code === 2) return "Parcialmente nublado"
  if (code === 3) return "Nublado"
  if (code === 45 || code === 48) return "Neblina"
  if (code >= 51 && code <= 57) return "Llovizna"
  if (code >= 61 && code <= 67) return "Lluvia"
  if (code >= 71 && code <= 77) return "Nieve"
  if (code >= 80 && code <= 82) return "Chubascos"
  if (code >= 85 && code <= 86) return "Chubascos de nieve"
  if (code >= 95) return "Tormenta"
  return "Variable"
}

export async function fetchWeather(place: string, signal?: AbortSignal): Promise<WeatherInfo> {
  const geoRes = await fetch(
    `${GEO}?name=${encodeURIComponent(place)}&count=1&language=es&format=json`,
    { signal },
  )
  if (!geoRes.ok) throw new Error("No se pudo buscar la ciudad.")
  const geo = await geoRes.json()
  const hit = geo.results?.[0]
  if (!hit) throw new Error(`No encontramos "${place}". Prueba con otra ciudad.`)

  const params = new URLSearchParams({
    latitude: String(hit.latitude),
    longitude: String(hit.longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "precipitation_probability_max",
    timezone: "auto",
    forecast_days: "1",
  })
  const res = await fetch(`${FORECAST}?${params}`, { signal })
  if (!res.ok) throw new Error("No se pudo obtener el clima.")
  const data = await res.json()
  const c = data.current
  const code: number = c.weather_code
  const rainProb: number = data.daily?.precipitation_probability_max?.[0] ?? 0

  return {
    city: hit.name,
    country: hit.country ?? "",
    tempC: Math.round(c.temperature_2m),
    feelsC: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    windKmh: Math.round(c.wind_speed_10m),
    code,
    description: describe(code),
    rainProb,
    isRainy: (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95 || rainProb >= 60,
  }
}
