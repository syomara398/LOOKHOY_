export const CATEGORIES = ["Arriba", "Abajo", "Calzado", "Abrigo"] as const
export type Category = (typeof CATEGORIES)[number]

export const STYLES = ["Casual", "Formal", "Deportivo"] as const
export type Style = (typeof STYLES)[number]

/** 1 = fresco, 2 = templado, 3 = abrigado */
export type Warmth = 1 | 2 | 3
export const WARMTH_LABEL: Record<Warmth, string> = {
  1: "Fresco",
  2: "Templado",
  3: "Abrigado",
}

export type View = "login" | "closet" | "upload" | "home" | "outfit" | "history"

export interface Garment {
  id: string
  name: string
  category: Category
  style: Style
  warmth: Warmth
  image: string
  favorite: boolean
}

export interface PieceSnapshot {
  name: string
  category: Category
  image: string
}

export interface SavedOutfit {
  id: string
  occasion: string
  date: string // ISO
  pieces: PieceSnapshot[]
  tempC: number | null
  favorite: boolean
}

export interface Occasion {
  name: string
  text: string
}

export interface User {
  name: string
  email: string
}

export interface WeatherInfo {
  city: string
  country: string
  tempC: number
  feelsC: number
  humidity: number
  windKmh: number
  code: number
  description: string
  rainProb: number
  isRainy: boolean
}
