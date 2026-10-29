import type { Style, Warmth, WeatherInfo } from "@/types"

/** Lo que la IA ve en la foto del outfit. */
export interface LookAnalysis {
  isOutfit: boolean
  pieces: string[]
  style: Style
  warmth: Warmth
  hasCoat: boolean
  comment: string
}

/** Envía la foto al servidor de LookHoy (server/index.mjs), que consulta a la IA con la clave guardada allí. */
export async function analyzeLook(
  image: string,
  occasion: string,
  weather: WeatherInfo | null,
  signal?: AbortSignal,
): Promise<LookAnalysis> {
  let res: Response
  try {
    res = await fetch("/api/analyze-look", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        occasion,
        weather: weather && {
          description: weather.description,
          tempC: weather.tempC,
          feelsC: weather.feelsC,
          rainProb: weather.rainProb,
        },
      }),
      signal,
    })
  } catch {
    throw new Error("No hay conexión con el servicio de IA. ¿Iniciaste el servidor con «npm run server»?")
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? "El servicio de IA no respondió bien.")
  return data as LookAnalysis
}
