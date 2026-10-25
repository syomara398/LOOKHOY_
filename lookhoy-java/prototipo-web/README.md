# LookHoy

Recomendador de outfits según clima y ocasión. Base: diseño exportado de Figma Make (React + Vite + Tailwind v4).

## Cómo correrlo
```bash
pnpm install   # o npm install
pnpm dev       # o npm run dev
```

## Qué es funcional
- **Clóset**: agregar prendas con foto real (JPG/PNG), categoría, estilo y nivel de abrigo; favoritos; eliminar. Se guarda en `localStorage`.
- **Clima real**: Open-Meteo (sin API key). Escribe cualquier ciudad en "¿Dónde estarás?".
- **Outfits**: `src/lib/outfit.ts` puntúa las prendas según la ocasión (estilo) y la sensación térmica (abrigo, lluvia). "Otra sugerencia" recorre las combinaciones siguientes.
- **Historial y favoritos**: guarda snapshots de cada outfit, con favoritos y "Ver outfit".
- **Sesión**: local (sin backend); sirve para la demo, no valida contraseñas.

## Estructura
- `src/App.tsx` pantallas · `src/components/ui.tsx` piezas de UI
- `src/lib/` clima, outfits, imágenes, almacenamiento · `src/data/seed.ts` prendas de ejemplo
