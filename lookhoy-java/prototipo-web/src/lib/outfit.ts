import type { Category, Garment, Style, WeatherInfo } from "@/types"

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

/** Estilos preferidos según la ocasión, del más al menos importante. */
export function stylesFor(occasion: string): Style[] {
  const o = norm(occasion)
  if (/entrevista|trabajo|reunion|boda|graduacion|\bcita\b|formal|ceremonia|aniversario/.test(o))
    return ["Formal", "Casual"]
  if (/gym|gimnasio|deporte|correr|entren|futbol/.test(o)) return ["Deportivo", "Casual"]
  if (/feria|paseo|caminata|playa|viaje/.test(o)) return ["Casual", "Deportivo"]
  return ["Casual"]
}

/** Abrigo deseado (1-3) a partir de la sensación térmica. */
function targetWarmth(feelsC: number): 1 | 2 | 3 {
  if (feelsC >= 23) return 1
  if (feelsC >= 17) return 2
  return 3
}

function score(g: Garment, styles: Style[], target: number, weight: number) {
  const i = styles.indexOf(g.style)
  const styleScore = i === 0 ? 3 : i === 1 ? 1.8 : 0
  const warmthScore = weight * (2 - Math.abs(g.warmth - target))
  return styleScore + warmthScore + (g.favorite ? 0.4 : 0)
}

export interface Suggestion {
  pieces: Garment[]
  missing: Category[]
  notes: string[]
  title: string
  combos: number
}

const ORDER: Category[] = ["Arriba", "Abajo", "Calzado", "Abrigo"]

export function suggestOutfit(
  closet: Garment[],
  occasion: string,
  weather: WeatherInfo | null,
  variant = 0,
): Suggestion {
  const styles = stylesFor(occasion)
  const feels = weather?.feelsC ?? 22
  const target = targetWarmth(feels)
  const needsCoat = feels < 19 || (weather?.isRainy ?? false)

  const wanted: Category[] = needsCoat ? ORDER : ORDER.filter((c) => c !== "Abrigo")
  const missing: Category[] = []

  const pools = wanted
    .map((cat) => {
      const weight = cat === "Calzado" ? 0.5 : 1
      const coatTarget = cat === "Abrigo" ? (feels < 14 ? 3 : 2) : target
      const ranked = closet
        .filter((g) => g.category === cat)
        .map((g) => ({ g, s: score(g, styles, coatTarget, weight) }))
        .sort((a, b) => b.s - a.s)
      if (!ranked.length) {
        missing.push(cat)
        return null
      }
      const best = ranked[0].s
      return ranked.filter((r) => r.s >= best - 2.5).map((r) => r.g)
    })
    .filter((p): p is Garment[] => p !== null)

  // "Odómetro": variant 0 = mejor combinación, luego recorre el resto en orden.
  const combos = pools.reduce((n, p) => n * p.length, 1)
  let v = ((variant % combos) + combos) % combos
  const pieces = pools.map((pool) => {
    const g = pool[v % pool.length]
    v = Math.floor(v / pool.length)
    return g
  })

  const notes: string[] = []
  if (weather) {
    if (weather.isRainy) notes.push(`Hay probabilidad de lluvia (${weather.rainProb}%): conviene llevar abrigo.`)
    else if (feels < 19) notes.push(`Se siente fresco (${feels} °C): suma una capa de abrigo.`)
    else if (feels >= 27) notes.push(`Hace calor (${feels} °C): elegimos prendas frescas.`)
  } else {
    notes.push("No hay datos del clima; armamos el outfit para un día templado.")
  }
  if (missing.length)
    notes.push(`Te falta ${missing.map((m) => m.toLowerCase()).join(" y ")} en tu clóset para completar el look.`)

  return { pieces, missing, notes, title: `${styles[0]} para ${occasion}`, combos }
}
