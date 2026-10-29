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
El servidor `server/index.mjs` funciona con **Gemini** (tiene capa gratuita) o con **Claude** (de pago).
1. Copia `.env.example` como `.env` y llena una de las dos claves:
   - Gemini (gratis): crea la clave en https://aistudio.google.com/apikey y pégala en `GEMINI_API_KEY=`.
   - Claude (de pago): crea la clave en https://console.anthropic.com y pégala en `ANTHROPIC_API_KEY=`.
2. Abre **dos terminales** en la carpeta `prototipo-web`:
   - Terminal 1: `npm run server`  (debe decir «clave configurada»)
   - Terminal 2: `npm run dev`
3. Entra a *Outfit del día*, sube una foto y pulsa «Analizar con IA».

Aviso de privacidad: en la capa gratuita de Gemini, Google puede usar lo que envías para mejorar sus productos y personas revisoras pueden leerlo. No subas fotos con rostros de otras personas ni datos sensibles.

La clave vive solo en `.env` (ignorado por Git) y en el servidor; nunca va al navegador. No subas `.env` a GitHub.

## Publicar en Render (un solo servicio)
`server/index.mjs` sirve la web compilada (`dist`) y la IA (`/api`), así que basta **un** Web Service.
- **Root Directory:** carpeta de `prototipo-web` dentro del repositorio (aquí `lookhoy-java/prototipo-web`)
- **Build Command:** `npm install --include=dev && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Variables de entorno:** `GEMINI_API_KEY` con la clave (nunca en el código ni en GitHub)
- Node 22 se toma de `engines` en `package.json`.
- Protecciones del servidor público: 10 análisis por minuto por visitante y un tope de 150 por hora en total (`AI_GLOBAL_PER_HOUR`).
- El plan gratuito se duerme tras 15 minutos sin visitas: la primera carga después tarda unos segundos.
