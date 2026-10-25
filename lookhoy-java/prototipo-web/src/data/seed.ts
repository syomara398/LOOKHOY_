import type { Garment, Occasion } from "@/types"

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85`

export const seedGarments: Garment[] = [
  { id: "seed-1", name: "Polo blanco", category: "Arriba", style: "Casual", warmth: 1, image: u("photo-1467043237213-65f2da53396f"), favorite: false },
  { id: "seed-2", name: "Jean azul clásico", category: "Abajo", style: "Casual", warmth: 2, image: u("photo-1617178388553-a9d022974a5c"), favorite: false },
  { id: "seed-3", name: "Zapatillas blancas", category: "Calzado", style: "Casual", warmth: 1, image: u("photo-1544441893-675973e31985"), favorite: true },
  { id: "seed-4", name: "Casaca ligera", category: "Abrigo", style: "Casual", warmth: 2, image: u("photo-1564438259159-32c208873398"), favorite: false },
  { id: "seed-5", name: "Polo casual", category: "Arriba", style: "Casual", warmth: 1, image: u("photo-1687541160824-366bd3581699"), favorite: false },
  { id: "seed-6", name: "Jean negro", category: "Abajo", style: "Formal", warmth: 2, image: u("photo-1616761525721-3fd9832908af"), favorite: false },
]

export const seedOccasions: Occasion[] = [
  { name: "Feria", text: "Cómodo y fresco" },
  { name: "Instituto", text: "Casual y versátil" },
  { name: "Cita", text: "Especial y elegante" },
]

export const heroPhoto = u("photo-1739384879592-79903b12b2a6").replace("w=700", "w=1200")
