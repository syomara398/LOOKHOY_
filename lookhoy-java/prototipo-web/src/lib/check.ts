import { stylesFor, targetWarmth } from "@/lib/outfit"
import { WARMTH_LABEL, type Style, type Warmth, type WeatherInfo } from "@/types"

/** Lo que la persona declara de su outfit de hoy (la web no "ve" la foto: usa estos datos). */
export interface LookInput {
  style: Style
  warmth: Warmth
  hasCoat: boolean
}

export type Verdict = "ok" | "casi" | "cambia"

export interface Check {
  label: string
  /** "ok" cumple, "mid" cumple a medias, "bad" no cumple */
  level: "ok" | "mid" | "bad"
  text: string
}

export interface LookReview {
  score: number // 0-100
  verdict: Verdict
  headline: string
  checks: Check[]
  tips: string[]
}

/**
 * Revisa si el outfit va con la ocasión y el clima, con las mismas reglas del recomendador
 * (src/lib/outfit.ts): estilo según la ocasión + abrigo según la sensación térmica + lluvia.
 * Pura y sin E/S, para poder probarla fácil.
 */
export function reviewLook(look: LookInput, occasion: string, weather: WeatherInfo | null): LookReview {
  const styles = stylesFor(occasion)
  const feels = weather?.feelsC ?? 22
  const target = targetWarmth(feels)
  const rainy = weather?.isRainy ?? false
  const needsCoat = feels < 19 || rainy

  const checks: Check[] = []
  const tips: string[] = []
  let score = 0

  // 1) Estilo vs ocasión (40 pts)
  const si = styles.indexOf(look.style)
  if (si === 0) {
    score += 40
    checks.push({ label: "Ocasión", level: "ok", text: `Tu look ${look.style.toLowerCase()} es justo lo que pide "${occasion}".` })
  } else if (si > 0) {
    score += 24
    checks.push({
      label: "Ocasión",
      level: "mid",
      text: `Un look ${look.style.toLowerCase()} sirve para "${occasion}", aunque lo ideal sería ${styles[0].toLowerCase()}.`,
    })
    tips.push(`Para "${occasion}" se ve mejor algo ${styles[0].toLowerCase()}: cambia una o dos prendas.`)
  } else {
    checks.push({
      label: "Ocasión",
      level: "bad",
      text: `Un look ${look.style.toLowerCase()} no va con "${occasion}" (se espera ${styles[0].toLowerCase()}).`,
    })
    tips.push(`Para "${occasion}" busca un look ${styles[0].toLowerCase()}.`)
  }

  // 2) Abrigo vs sensación térmica (40 pts)
  const diff = look.warmth - target
  const clima = weather ? `${feels} °C de sensación` : "un día templado (sin datos del clima)"
  if (diff === 0) {
    score += 40
    checks.push({ label: "Clima", level: "ok", text: `Tu nivel de abrigo (${WARMTH_LABEL[look.warmth].toLowerCase()}) va bien con ${clima}.` })
  } else {
    const ligero = diff < 0
    const gap = Math.abs(diff)
    score += gap === 1 ? 22 : 0
    checks.push({
      label: "Clima",
      level: gap === 1 ? "mid" : "bad",
      text: ligero
        ? `Tu look es más ligero de lo que pide el clima (${clima}).`
        : `Tu look es más abrigado de lo que pide el clima (${clima}).`,
    })
    tips.push(
      ligero
        ? `Con ${clima} elige prendas de nivel ${WARMTH_LABEL[target].toLowerCase()}.`
        : `Con ${clima} cambia a prendas de nivel ${WARMTH_LABEL[target].toLowerCase()} para no pasar calor.`,
    )
  }

  // 3) Lluvia / casaca (20 pts)
  if (needsCoat && !look.hasCoat) {
    checks.push({
      label: "Abrigo extra",
      level: "bad",
      text: rainy
        ? `Hay probabilidad de lluvia (${weather?.rainProb ?? 0}%) y no llevas casaca.`
        : `Se siente fresco (${feels} °C) y no llevas casaca.`,
    })
    tips.push(rainy ? "Súmale una casaca, de preferencia impermeable." : "Súmale una casaca o una capa extra.")
  } else if (!needsCoat && look.hasCoat && feels >= 27) {
    score += 10
    checks.push({ label: "Abrigo extra", level: "mid", text: `Con ${feels} °C la casaca te va a sobrar.` })
    tips.push("Déjala en casa o llévala en la mochila.")
  } else {
    score += 20
    checks.push({
      label: "Abrigo extra",
      level: "ok",
      text: needsCoat ? "Llevas casaca y hoy la vas a necesitar." : "Hoy no necesitas casaca extra.",
    })
  }

  if (!weather) tips.push("No pudimos leer el clima: actualízalo en Inicio para una revisión más precisa.")

  // Si algo no cumple ("bad"), nunca es "ok": con un solo fallo leve queda en "casi", con fallos graves en "cambia".
  const hasBad = checks.some((c) => c.level === "bad")
  const verdict: Verdict = hasBad ? (score >= 70 ? "casi" : "cambia") : score >= 80 ? "ok" : "casi"
  const headline =
    verdict === "ok"
      ? "¡Tu outfit va perfecto para hoy!"
      : verdict === "casi"
        ? "Vas bien, pero ajusta un detalle"
        : "Mejor cambia algo antes de salir"

  return { score, verdict, headline, checks, tips }
}
