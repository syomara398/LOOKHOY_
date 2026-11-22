import { WARMTH_LABEL, type Category, type Style, type Warmth } from "@/types"

/** Datos que la persona escribe al subir una prenda. */
export interface GarmentInput {
  name: string
  category: Category | ""
  style: Style
  warmth: Warmth
}

const SWIMWEAR = /\b(bikini|biquini|traje de ba[ñn]o|vestido de ba[ñn]o|enterizo de ba[ñn]o)\b/i
const LIGHT = /\b(short|bermuda|sandalias?|chancla|chanclas|crop top|top|tank)\b/i
const WARM = /\b(casaca|abrigo|chompa|chaqueta|campera|parka|bufanda|chalina|gorro|guantes|sueter|suéter)\b/i

/**
 * Revisa que lo que la persona marcó tenga sentido con el nombre de la prenda.
 * No corrige nada por su cuenta: devuelve el mensaje de error para que ella lo corrija.
 * Limitación: solo compara el nombre escrito, no analiza la foto.
 */
export function checkGarment(g: GarmentInput): string | null {
  const n = g.name.trim()
  if (SWIMWEAR.test(n)) {
    if (g.warmth !== 1)
      return `"${n}" es ropa de playa o piscina: su nivel de abrigo debe ser "${WARMTH_LABEL[1]}", pero marcaste "${WARMTH_LABEL[g.warmth]}". Corrígelo antes de guardar.`
    if (g.style === "Formal")
      return `"${n}" es ropa de playa o piscina y no puede ser de estilo "Formal". Cambia el estilo antes de guardar.`
    return null
  }
  if (LIGHT.test(n) && g.warmth === 3)
    return `"${n}" es una prenda ligera, pero marcaste el nivel de abrigo "${WARMTH_LABEL[3]}". Corrígelo antes de guardar.`
  if (WARM.test(n) && g.warmth === 1)
    return `"${n}" es una prenda de abrigo, pero marcaste el nivel "${WARMTH_LABEL[1]}". Corrígelo antes de guardar.`
  return null
}
