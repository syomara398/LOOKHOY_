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
- **Exportar a Excel**: botón en *Mi clóset* y en *Historial*; descarga `lookhoy-AAAA-MM-DD.xlsx` con dos hojas (Clóset e Historial). Sin librerías extra: `src/lib/excel.ts` arma el .xlsx a mano.
- **Outfit del día**: sube la foto de lo que llevas puesto, indica estilo, abrigo y si llevas casaca; `src/lib/check.ts` lo revisa contra la ocasión y el clima real y da un puntaje, observaciones y consejos. La web no "ve" la foto: evalúa con los datos que marcas.
- **IA con visión (opcional)**: en *Outfit del día*, el botón «Analizar con IA» envía la foto a `server/index.mjs`, que consulta a Claude con tu clave de API y devuelve las prendas, el estilo, el abrigo y un comentario; luego `check.ts` puntúa el look. Sin servidor o sin clave, la revisión manual sigue funcionando.
- **Sesión**: local (sin backend); sirve para la demo, no valida contraseñas.

## Estructura
- `src/App.tsx` pantallas · `src/components/ui.tsx` piezas de UI
- `src/lib/` clima, outfits, imágenes, almacenamiento · `src/data/seed.ts` prendas de ejemplo

## Activar la IA (una sola vez)
1. Crea una clave en https://console.anthropic.com (requiere saldo) y copia `.env.example` como `.env`; pega la clave en `ANTHROPIC_API_KEY=`.
2. Abre **dos terminales** en la carpeta `prototipo-web`:
   - Terminal 1: `pnpm server`  (debe decir «clave configurada»)
   - Terminal 2: `pnpm dev`
3. Entra a *Outfit del día*, sube una foto y pulsa «Analizar con IA».

La clave vive solo en `.env` (ignorado por Git) y en el servidor; nunca va al navegador. No subas `.env` a GitHub.
