import { FormEvent, useEffect, useMemo, useState } from "react"
import { Brand, Button, Field, Heading, Icon, Page } from "@/components/ui"
import { heroPhoto, seedOccasions } from "@/data/seed"
import { analyzeLook, type LookAnalysis } from "@/lib/ai"
import { reviewLook, type LookReview } from "@/lib/check"
import { downloadExcel } from "@/lib/excel"
import { fileToDataUrl } from "@/lib/image"
import { suggestOutfit } from "@/lib/outfit"
import { uid, useStoredState } from "@/lib/storage"
import { fetchWeather } from "@/lib/weather"
import {
  CATEGORIES,
  STYLES,
  WARMTH_LABEL,
  type Category,
  type Garment,
  type Occasion,
  type SavedOutfit,
  type Style,
  type User,
  type View,
  type Warmth,
  type WeatherInfo,
} from "@/types"

/* ---------- utilidades de fecha ---------- */
const longDate = () =>
  new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()
const weekdayTime = () => {
  const d = new Date()
  const day = d.toLocaleDateString("es-PE", { weekday: "long" }).toUpperCase()
  const time = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${day} · ${time}`
}
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })

/* ---------- estado del clima ---------- */
function useWeather(place: string, refresh: number) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)
    fetchWeather(place, ctrl.signal)
      .then((w) => setWeather(w))
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return
        setError(e instanceof Error ? e.message : "No se pudo obtener el clima.")
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
    return () => ctrl.abort()
  }, [place, refresh])

  return { weather, loading, error }
}

/* ---------- login ---------- */
function Login({
  onLogin,
  weather,
}: {
  onLogin: (u: User) => void
  weather: WeatherInfo | null
}) {
  const [register, setRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function submit(e: FormEvent) {
    e.preventDefault()
    const cleanEmail = email.trim()
    onLogin({ email: cleanEmail, name: name.trim() || cleanEmail.split("@")[0] })
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Brand />
        <span>Tu estilo, organizado a tu manera.</span>
      </header>
      <main className="login-layout">
        <section className="login-editorial">
          <span className="eyebrow">BIENVENIDA A TU CLÓSET DIGITAL</span>
          <h1>Vestirte bien empieza con lo que ya tienes.</h1>
          <p>
            Organiza tus prendas y encuentra combinaciones pensadas para tu día, el clima y la ocasión.
          </p>
          <div className="editorial-image">
            <img src={heroPhoto} alt="Conjunto de ropa casual cuidadosamente organizado" />
            <span>
              LOOK DEL DÍA{weather ? ` · ${weather.city.toUpperCase()} ${weather.tempC} °C` : ""}
            </span>
          </div>
        </section>
        <form className="login-card" onSubmit={submit}>
          <div>
            <span className="eyebrow">{register ? "CREA TU CUENTA" : "HOLA DE NUEVO"}</span>
            <h2>{register ? "Registrarse" : "Iniciar sesión"}</h2>
            <p>Ingresa a tu clóset y descubre tu próximo look.</p>
          </div>
          {register && (
            <Field label="Nombre" placeholder="Tu nombre" value={name} onChange={setName} required />
          )}
          <Field
            label="Correo electrónico"
            type="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={setEmail}
            required
          />
          <Field
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            required
          />
          <label className="checkbox">
            <input type="checkbox" required />
            <span>
              <Icon name="check" size={14} />
            </span>
            <small>Acepto los términos y la política de privacidad.</small>
          </label>
          <Button type="submit">
            Entrar <Icon name="chevron" size={18} />
          </Button>
          <button type="button" className="text-link" onClick={() => setRegister((r) => !r)}>
            {register ? (
              <>
                ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
              </>
            ) : (
              <>
                ¿No tienes cuenta? <strong>Regístrate</strong>
              </>
            )}
          </button>
          <small className="form-note">Por ahora tus datos se guardan solo en este navegador.</small>
        </form>
      </main>
    </div>
  )
}

/* ---------- clóset ---------- */
function Closet({
  garments,
  setGarments,
  go,
  storageError,
  onExport,
}: {
  garments: Garment[]
  setGarments: (f: (g: Garment[]) => Garment[]) => void
  go: (v: View) => void
  storageError: string | null
  onExport: () => void
}) {
  const [filter, setFilter] = useState("Todo")
  const visible = filter === "Todo" ? garments : garments.filter((g) => g.category === filter)

  const toggleFav = (id: string) =>
    setGarments((all) => all.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)))
  const remove = (g: Garment) => {
    if (window.confirm(`¿Eliminar "${g.name}" de tu clóset?`))
      setGarments((all) => all.filter((x) => x.id !== g.id))
  }

  return (
    <>
      <div className="title-row">
        <Heading
          eyebrow="TU ESPACIO PERSONAL"
          title="Mi clóset"
          text={
            garments.length
              ? `${garments.length} ${garments.length === 1 ? "prenda lista" : "prendas listas"} para combinar.`
              : "Aún no tienes prendas. Agrega la primera."
          }
        />
        <div className="title-actions">
          <Button secondary onClick={onExport} disabled={garments.length === 0}>
            <Icon name="download" /> Exportar a Excel
          </Button>
          <Button onClick={() => go("upload")}>
            <Icon name="plus" /> Agregar prenda
          </Button>
        </div>
      </div>
      {storageError && <p className="error-note">{storageError}</p>}
      <div className="filters">
        {["Todo", ...CATEGORIES].map((item) => (
          <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>
            {item}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="empty">No hay prendas en esta categoría todavía.</p>
      ) : (
        <div className="garment-grid">
          {visible.map((item) => (
            <article className="garment-card" key={item.id}>
              <div className="image-wrap">
                <img src={item.image} alt={item.name} />
                <button
                  aria-label={`Marcar ${item.name} como favorito`}
                  className={item.favorite ? "liked" : ""}
                  onClick={() => toggleFav(item.id)}
                >
                  <Icon name="heart" size={18} />
                </button>
                <button
                  className="delete-btn"
                  aria-label={`Eliminar ${item.name}`}
                  onClick={() => remove(item)}
                >
                  <Icon name="trash" size={17} />
                </button>
              </div>
              <div>
                <span>
                  {item.category} · {item.style} · {WARMTH_LABEL[item.warmth]}
                </span>
                <h3>{item.name}</h3>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- subir prenda ---------- */
function Upload({
  addGarment,
  go,
  storageError,
}: {
  addGarment: (g: Garment) => void
  go: (v: View) => void
  storageError: string | null
}) {
  const [image, setImage] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | "">("")
  const [name, setName] = useState("")
  const [style, setStyle] = useState<Style>("Casual")
  const [warmth, setWarmth] = useState<Warmth>(1)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleFile(file?: File | null) {
    if (!file) return
    setSaved(false)
    if (!/^image\/(jpeg|png)$/.test(file.type)) return setError("Usa una imagen JPG o PNG.")
    if (file.size > 10 * 1024 * 1024) return setError("La imagen supera los 10 MB.")
    try {
      setImage(await fileToDataUrl(file))
      setError(null)
    } catch {
      setError("No se pudo leer la imagen. Prueba con otra.")
    }
  }

  function clear() {
    setImage(null)
    setCategory("")
    setName("")
    setStyle("Casual")
    setWarmth(1)
    setError(null)
    setSaved(false)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!image) return setError("Primero selecciona una fotografía.")
    if (!category) return setError("Elige una categoría.")
    if (!name.trim()) return setError("Escribe el nombre de la prenda.")
    addGarment({ id: uid(), name: name.trim(), category, style, warmth, image, favorite: false })
    clear()
    setSaved(true)
  }

  return (
    <>
      <Heading
        eyebrow="NUEVA PRENDA"
        title="Subir prenda"
        text="Añade los detalles para mantener tu clóset organizado."
      />
      <div className="upload-layout">
        <label
          className={`dropzone ${image ? "has-image" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            void handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              void handleFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          {image ? (
            <>
              <img className="dropzone-preview" src={image} alt="Vista previa de la prenda" />
              <span className="file-button">Cambiar fotografía</span>
            </>
          ) : (
            <>
              <span className="upload-icon">
                <Icon name="upload" size={30} />
              </span>
              <h3>Arrastra tu fotografía aquí</h3>
              <p>o selecciona una imagen desde tu ordenador</p>
              <span className="file-button">Seleccionar fotografía</span>
              <small>JPG o PNG · Máximo 10 MB</small>
            </>
          )}
        </label>
        <form className="details-card" onSubmit={submit}>
          <div>
            <span className="step">02</span>
            <h2>Detalles de la prenda</h2>
            <p>Estos datos nos ayudan a crear mejores combinaciones.</p>
          </div>
          <label className="field">
            <span>Categoría</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Field
            label="Nombre de la prenda"
            placeholder="Ej. Casaca ligera"
            value={name}
            onChange={setName}
          />
          <div className="field-pair">
            <label className="field">
              <span>Estilo</span>
              <select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                {STYLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Nivel de abrigo</span>
              <select value={warmth} onChange={(e) => setWarmth(Number(e.target.value) as Warmth)}>
                {([1, 2, 3] as Warmth[]).map((w) => (
                  <option key={w} value={w}>
                    {WARMTH_LABEL[w]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(error || storageError) && <p className="error-note">{error ?? storageError}</p>}
          {saved && (
            <p className="success">
              <Icon name="check" size={17} /> Prenda guardada correctamente.
            </p>
          )}
          <div className="form-actions">
            <Button type="submit">Guardar prenda</Button>
            <Button secondary onClick={clear}>
              Limpiar
            </Button>
            {saved && (
              <Button secondary onClick={() => go("closet")}>
                Ver clóset
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

/* ---------- clima ---------- */
function Weather({
  weather,
  loading,
  error,
}: {
  weather: WeatherInfo | null
  loading: boolean
  error: string | null
}) {
  if (!weather) {
    return (
      <article className="weather-card">
        <p>{loading ? "Consultando el clima…" : (error ?? "Sin datos del clima.")}</p>
      </article>
    )
  }
  const sunny = weather.code <= 2
  return (
    <article className="weather-card" aria-busy={loading}>
      <div className="weather-main">
        <span>
          <Icon name={sunny ? "sun" : "cloud"} size={34} />
        </span>
        <div>
          <small>
            {longDate()} · {weather.city.toUpperCase()}
          </small>
          <strong>{weather.tempC}°</strong>
          <p>{weather.description}</p>
        </div>
      </div>
      <div className="weather-stats">
        <div>
          <span>Sensación</span>
          <strong>{weather.feelsC} °C</strong>
        </div>
        <div>
          <span>Humedad</span>
          <strong>{weather.humidity}%</strong>
        </div>
        <div>
          <span>Viento</span>
          <strong>{weather.windKmh} km/h</strong>
        </div>
      </div>
    </article>
  )
}

function greeting(w: WeatherInfo | null) {
  if (!w) return "Elige tu ocasión y armamos tu look."
  if (w.isRainy) return "Hay chance de lluvia: mejor llevar una capa extra."
  if (w.feelsC >= 27) return "Hace calor: un día para prendas frescas."
  if (w.feelsC >= 21) return "Un día cálido y perfecto para un look ligero."
  if (w.feelsC >= 17) return "Un día templado: combina capas ligeras."
  return "Se siente fresco: toca abrigarse un poco."
}

/* ---------- inicio ---------- */
function Home({
  weatherState,
  location,
  setLocation,
  refreshWeather,
  occasions,
  setOccasions,
  occasion,
  setOccasion,
  onBuild,
}: {
  weatherState: { weather: WeatherInfo | null; loading: boolean; error: string | null }
  location: string
  setLocation: (s: string) => void
  refreshWeather: () => void
  occasions: Occasion[]
  setOccasions: (f: (o: Occasion[]) => Occasion[]) => void
  occasion: string
  setOccasion: (s: string) => void
  onBuild: () => void
}) {
  const [showNew, setShowNew] = useState(false)
  const [newOccasion, setNewOccasion] = useState("")
  const [draft, setDraft] = useState(location)
  const { weather } = weatherState

  function addOccasion(e: FormEvent) {
    e.preventDefault()
    const name = newOccasion.trim()
    if (!name) return
    if (!occasions.some((o) => o.name.toLowerCase() === name.toLowerCase()))
      setOccasions((cur) => [...cur, { name, text: "Ocasión personalizada" }])
    setOccasion(name)
    setNewOccasion("")
    setShowNew(false)
  }

  return (
    <>
      <section className="hero-row">
        <Heading
          eyebrow={weekdayTime()}
          title={`¡Hola! Hoy en ${weather?.city ?? location}`}
          text={greeting(weather)}
        />
        <form
          className="location-control"
          onSubmit={(e) => {
            e.preventDefault()
            const next = draft.trim()
            if (!next) return
            if (next === location) refreshWeather()
            else setLocation(next)
          }}
        >
          <Icon name="pin" size={18} />
          <label>
            <span>¿Dónde estarás?</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe una ciudad"
              aria-label="Lugar donde estarás"
            />
          </label>
          <button type="submit">Actualizar clima</button>
        </form>
      </section>
      {weatherState.error && weather && <p className="error-note">{weatherState.error}</p>}
      <Weather {...weatherState} />
      <section className="occasion-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">PLANEA TU LOOK</span>
            <h2>¿Qué ocasión tienes?</h2>
          </div>
          <p>Elige una opción para crear una combinación ideal.</p>
        </div>
        <div className="occasion-grid">
          {occasions.map((o, i) => (
            <button
              key={o.name}
              onClick={() => setOccasion(o.name)}
              className={`occasion ${occasion === o.name ? "selected" : ""}`}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{o.name}</h3>
                <p>{o.text}</p>
              </div>
              <i>{occasion === o.name && <Icon name="check" size={15} />}</i>
            </button>
          ))}
          <button className="occasion add-occasion" onClick={() => setShowNew(true)}>
            <span className="add-icon">
              <Icon name="plus" size={18} />
            </span>
            <div>
              <h3>Agregar ocasión</h3>
              <p>Crea una opción personalizada</p>
            </div>
          </button>
        </div>
        {showNew && (
          <form className="new-occasion-form" onSubmit={addOccasion}>
            <label>
              <span>Nombre de la ocasión</span>
              <input
                autoFocus
                value={newOccasion}
                onChange={(e) => setNewOccasion(e.target.value)}
                placeholder="Ej. Entrevista, cumpleaños..."
              />
            </label>
            <Button type="submit">Agregar</Button>
            <Button secondary onClick={() => setShowNew(false)}>
              Cancelar
            </Button>
          </form>
        )}
        <div className="cta-row">
          <p>
            Ocasión seleccionada: <strong>{occasion}</strong>
          </p>
          <Button onClick={onBuild}>
            Armar outfit <Icon name="chevron" size={18} />
          </Button>
        </div>
      </section>
    </>
  )
}

/* ---------- outfit ---------- */
function Outfit({
  garments,
  occasion,
  weather,
  variant,
  setVariant,
  preset,
  onSave,
  go,
}: {
  garments: Garment[]
  occasion: string
  weather: WeatherInfo | null
  variant: number
  setVariant: (n: number) => void
  preset: SavedOutfit | null
  onSave: (pieces: Garment[], occasion: string) => void
  go: (v: View) => void
}) {
  const suggestion = useMemo(
    () => suggestOutfit(garments, occasion, weather, variant),
    [garments, occasion, weather, variant],
  )

  const pieces = preset ? preset.pieces : suggestion.pieces
  const shownOccasion = preset ? preset.occasion : occasion
  const tempText = preset
    ? preset.tempC !== null
      ? `${preset.tempC} °C`
      : "Sin dato de clima"
    : weather
      ? `${weather.tempC} °C · ${weather.description}`
      : "Sin dato de clima"
  const featured = pieces.find((p) => p.category === "Arriba") ?? pieces[0]

  if (!pieces.length) {
    return (
      <>
        <Heading
          eyebrow="HECHO PARA TI"
          title="Aún no hay outfit"
          text="Necesitamos prendas en tu clóset para poder combinarlas."
        />
        <div className="outfit-actions">
          <Button onClick={() => go("upload")}>
            <Icon name="plus" size={18} /> Agregar prendas
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="title-row">
        <Heading
          eyebrow={preset ? `GUARDADO · ${shortDate(preset.date).toUpperCase()}` : "HECHO PARA TI"}
          title={preset ? `Tu outfit para ${shownOccasion}` : "Tu outfit de hoy"}
          text="Una combinación pensada para el clima y tu ocasión."
        />
        <div className="outfit-summary">
          <Icon name={weather && weather.code > 2 && !preset ? "cloud" : "sun"} />
          <span>{tempText}</span>
          <i /> <strong>{shownOccasion}</strong>
        </div>
      </div>
      {!preset && suggestion.notes.map((n) => (
        <p className="outfit-note" key={n}>
          {n}
        </p>
      ))}
      <div className="outfit-layout">
        <article className="outfit-feature">
          <img src={featured.image} alt={featured.name} />
          <div>
            <span>LOOK COMPLETO</span>
            <strong>{preset ? shownOccasion : suggestion.title}</strong>
          </div>
        </article>
        <div className="outfit-pieces">
          {pieces.map((item, i) => (
            <article key={`${item.name}-${i}`}>
              <span className="piece-number">0{i + 1}</span>
              <img src={item.image} alt={item.name} />
              <div>
                <small>{item.category}</small>
                <h3>{item.name}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="outfit-actions">
        {preset ? (
          <Button secondary onClick={() => go("history")}>
            Volver al historial
          </Button>
        ) : (
          <>
            <Button
              secondary
              disabled={suggestion.combos <= 1}
              onClick={() => setVariant(variant + 1)}
            >
              {suggestion.combos <= 1 ? "Sin más combinaciones" : "Otra sugerencia"}
            </Button>
            <Button onClick={() => onSave(suggestion.pieces, occasion)}>
              <Icon name="heart" size={18} /> Guardar outfit
            </Button>
          </>
        )}
      </div>
    </>
  )
}

/* ---------- outfit del día ---------- */
const VERDICT_LABEL = { ok: "VA PERFECTO", casi: "CASI LISTO", cambia: "AJÚSTALO" } as const

function Today({
  garments,
  occasions,
  occasion,
  setOccasion,
  weather,
  go,
}: {
  garments: Garment[]
  occasions: Occasion[]
  occasion: string
  setOccasion: (s: string) => void
  weather: WeatherInfo | null
  go: (v: View) => void
}) {
  const [image, setImage] = useState<string | null>(null)
  const [style, setStyle] = useState<Style>("Casual")
  const [warmth, setWarmth] = useState<Warmth>(2)
  const [hasCoat, setHasCoat] = useState(false)
  const [review, setReview] = useState<LookReview | null>(null)
  const [analysis, setAnalysis] = useState<LookAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file?: File | null) {
    if (!file) return
    if (!/^image\/(jpeg|png)$/.test(file.type)) return setError("Usa una imagen JPG o PNG.")
    if (file.size > 10 * 1024 * 1024) return setError("La imagen supera los 10 MB.")
    try {
      setImage(await fileToDataUrl(file))
      setError(null)
      setReview(null)
      setAnalysis(null)
    } catch {
      setError("No se pudo leer la imagen. Prueba con otra.")
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!image) return setError("Primero sube la foto de tu outfit.")
    setError(null)
    setReview(reviewLook({ style, warmth, hasCoat }, occasion, weather))
  }

  /** La IA mira la foto, rellena el formulario y revisa el look; la persona puede corregir y volver a revisar. */
  async function analyze() {
    if (!image) return setError("Primero sube la foto de tu outfit.")
    setError(null)
    setAnalyzing(true)
    try {
      const a = await analyzeLook(image, occasion, weather)
      if (!a.isOutfit) {
        setAnalysis(null)
        setReview(null)
        return setError("No vemos un outfit en la foto. Prueba con una foto donde se vea tu ropa.")
      }
      setAnalysis(a)
      setStyle(a.style)
      setWarmth(a.warmth)
      setHasCoat(a.hasCoat)
      setReview(reviewLook({ style: a.style, warmth: a.warmth, hasCoat: a.hasCoat }, occasion, weather))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo analizar la foto.")
    } finally {
      setAnalyzing(false)
    }
  }

  // Si no es perfecto, mostramos qué armaría LookHoy con el clóset de la persona.
  const alternative = useMemo(
    () =>
      review && review.verdict !== "ok" && garments.length
        ? suggestOutfit(garments, occasion, weather, 0)
        : null,
    [review, garments, occasion, weather],
  )

  const weatherText = weather
    ? `${weather.city} · ${weather.tempC} °C (sensación ${weather.feelsC} °C) · ${weather.description}`
    : "Sin datos del clima (se evalúa como día templado)"

  return (
    <>
      <Heading
        eyebrow="REVISA TU LOOK"
        title="Outfit del día"
        text="Sube la foto de lo que te pusiste y te decimos si va con el clima y con tu ocasión."
      />
      <div className="upload-layout">
        <label
          className={`dropzone ${image ? "has-image" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            void handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              void handleFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          {image ? (
            <>
              <img className="dropzone-preview" src={image} alt="Foto de tu outfit del día" />
              <span className="file-button">Cambiar fotografía</span>
            </>
          ) : (
            <>
              <span className="upload-icon">
                <Icon name="upload" size={30} />
              </span>
              <h3>Sube la foto de tu outfit</h3>
              <p>arrastra la imagen o selecciónala desde tu equipo</p>
              <span className="file-button">Seleccionar fotografía</span>
              <small>JPG o PNG · Máximo 10 MB</small>
            </>
          )}
        </label>
        <form className="details-card" onSubmit={submit}>
          <div>
            <span className="step">01</span>
            <h2>¿Cómo es tu look?</h2>
            <p>Cuéntanos cómo se ve para revisarlo contra el clima y la ocasión.</p>
          </div>
          <label className="field">
            <span>Situación</span>
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {occasions.map((o) => (
                <option key={o.name}>{o.name}</option>
              ))}
            </select>
          </label>
          <div className="field-pair">
            <label className="field">
              <span>Estilo del look</span>
              <select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                {STYLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Nivel de abrigo</span>
              <select value={warmth} onChange={(e) => setWarmth(Number(e.target.value) as Warmth)}>
                {([1, 2, 3] as Warmth[]).map((w) => (
                  <option key={w} value={w}>
                    {WARMTH_LABEL[w]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="checkbox">
            <input type="checkbox" checked={hasCoat} onChange={(e) => setHasCoat(e.target.checked)} />
            <span>
              <Icon name="check" size={14} />
            </span>
            <small>Llevo casaca o abrigo encima.</small>
          </label>
          <p className="weather-line">
            <Icon name="cloud" size={16} /> {weatherText}
          </p>
          {error && <p className="error-note">{error}</p>}
          <div className="form-actions">
            <Button onClick={() => void analyze()} disabled={analyzing || !image}>
              {analyzing ? "Analizando foto…" : "Analizar con IA"}
            </Button>
            <Button type="submit" secondary disabled={analyzing}>
              Revisar con mis datos
            </Button>
          </div>
          <small className="ai-privacy">
            «Analizar con IA» envía la foto a un servicio de inteligencia artificial para detectar tus prendas.
            También puedes marcar los datos a mano.
          </small>
        </form>
      </div>

      {review && (
        <section className={`review-card review-${review.verdict}`} aria-live="polite">
          <div className="review-head">
            <div className="review-score">
              <strong>{review.score}</strong>
              <span>/100</span>
            </div>
            <div>
              <span className="eyebrow">{VERDICT_LABEL[review.verdict]}</span>
              <h2>{review.headline}</h2>
              <p>
                {occasion} · {weatherText}
              </p>
            </div>
          </div>
          {analysis && (
            <div className="ai-box">
              <span className="eyebrow">LO QUE VE LA IA</span>
              {analysis.pieces.length > 0 && (
                <div className="chips">
                  {analysis.pieces.map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                </div>
              )}
              {analysis.comment && <p>{analysis.comment}</p>}
              <small>Detectó: estilo {analysis.style.toLowerCase()}, abrigo {WARMTH_LABEL[analysis.warmth].toLowerCase()}. Si no acertó, corrige los datos y revisa de nuevo.</small>
            </div>
          )}
          <ul className="review-checks">
            {review.checks.map((c) => (
              <li key={c.label} className={`check-${c.level}`}>
                <b>{c.label}</b>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
          {review.tips.length > 0 && (
            <div className="review-tips">
              <h3>Para mejorarlo</h3>
              <ul>
                {review.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {alternative && alternative.pieces.length > 0 && (
            <div className="review-alt">
              <h3>Con tu clóset, LookHoy armaría</h3>
              <p>{alternative.pieces.map((p) => p.name).join(" · ")}</p>
              <Button secondary onClick={() => go("outfit")}>
                Ver outfit sugerido <Icon name="chevron" size={16} />
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  )
}

/* ---------- historial ---------- */
function History({
  saved,
  setSaved,
  open,
  onExport,
}: {
  saved: SavedOutfit[]
  setSaved: (f: (s: SavedOutfit[]) => SavedOutfit[]) => void
  open: (o: SavedOutfit) => void
  onExport: () => void
}) {
  const [tab, setTab] = useState("Historial")
  const favorites = saved.filter((s) => s.favorite)
  const shown = tab === "Favoritos" ? favorites : saved
  const toggle = (id: string) =>
    setSaved((all) => all.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)))
  const remove = (id: string) => setSaved((all) => all.filter((s) => s.id !== id))

  return (
    <>
      <div className="title-row">
        <Heading
          eyebrow="TUS COMBINACIONES"
          title="Historial y favoritos"
          text="Vuelve a tus looks anteriores o guarda inspiración para después."
        />
        <Button secondary onClick={onExport}>
          <Icon name="download" /> Exportar a Excel
        </Button>
      </div>
      <div className="tabs">
        {["Historial", "Favoritos"].map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item}
            <span>{item === "Historial" ? saved.length : favorites.length}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="empty">
          {tab === "Favoritos"
            ? "Todavía no tienes favoritos. Toca el corazón en un outfit guardado."
            : "Aún no guardas outfits. Arma uno desde Inicio y guárdalo."}
        </p>
      ) : (
        <div className="history-grid">
          {shown.map((item) => {
            const cover = item.pieces.find((p) => p.category === "Arriba") ?? item.pieces[0]
            return (
              <article className="history-card" key={item.id}>
                <div className="history-image">
                  <img src={cover.image} alt={`Outfit para ${item.occasion}`} />
                  <button
                    className={item.favorite ? "liked" : ""}
                    aria-label="Favorito"
                    onClick={() => toggle(item.id)}
                  >
                    <Icon name="heart" size={19} />
                  </button>
                </div>
                <div className="history-content">
                  <span>{shortDate(item.date)}</span>
                  <div>
                    <h3>{item.occasion}</h3>
                    <p>{item.pieces.map((p) => p.name).join(" · ")}</p>
                  </div>
                  <button onClick={() => open(item)}>
                    Ver outfit <Icon name="chevron" size={16} />
                  </button>
                  <button className="remove-link" onClick={() => remove(item.id)}>
                    Quitar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ---------- app ---------- */
export default function App() {
  const [user, setUser] = useStoredState<User | null>("user", null)
  return <Workspace key={user?.email.toLowerCase() ?? "guest"} user={user} setUser={setUser} />
}

function Workspace({ user, setUser }: { user: User | null; setUser: (u: User | null) => void }) {
  const p = user ? `u:${user.email.toLowerCase()}:` : "guest:"
  const [garments, setGarments, garmentsError] = useStoredState<Garment[]>(`${p}garments`, [])
  const [saved, setSaved] = useStoredState<SavedOutfit[]>(`${p}saved`, [])
  const [occasions, setOccasions] = useStoredState<Occasion[]>(`${p}occasions`, seedOccasions)
  const [occasion, setOccasion] = useStoredState<string>(`${p}occasion`, "Instituto")
  const [location, setLocation] = useStoredState<string>(`${p}location`, "Ica")
  const [view, setView] = useState<View>("home")
  const [variant, setVariant] = useState(0)
  const [preset, setPreset] = useState<SavedOutfit | null>(null)
  const [refresh, setRefresh] = useState(0)
  const weatherState = useWeather(location, refresh)

  const go = (v: View) => {
    if (v !== "outfit") setPreset(null)
    setView(v)
    window.scrollTo({ top: 0 })
  }
  const logout = () => {
    setUser(null)
    setView("home")
  }

  if (!user) return <Login onLogin={setUser} weather={weatherState.weather} />

  const exportExcel = () => downloadExcel(garments, saved)

  const buildOutfit = () => {
    setVariant(0)
    setPreset(null)
    go("outfit")
  }

  const saveOutfit = (pieces: Garment[], occ: string) => {
    if (!pieces.length) return
    setSaved((all) => [
      {
        id: uid(),
        occasion: occ,
        date: new Date().toISOString(),
        pieces: pieces.map((p) => ({ name: p.name, category: p.category, image: p.image })),
        tempC: weatherState.weather?.tempC ?? null,
        favorite: true,
      },
      ...all,
    ])
    go("history")
  }

  const content = (() => {
    switch (view) {
      case "closet":
        return (
          <Closet
            garments={garments}
            setGarments={setGarments}
            go={go}
            storageError={garmentsError}
            onExport={exportExcel}
          />
        )
      case "upload":
        return (
          <Upload
            addGarment={(g) => setGarments((all) => [g, ...all])}
            go={go}
            storageError={garmentsError}
          />
        )
      case "today":
        return (
          <Today
            garments={garments}
            occasions={occasions}
            occasion={occasion}
            setOccasion={setOccasion}
            weather={weatherState.weather}
            go={go}
          />
        )
      case "outfit":
        return (
          <Outfit
            garments={garments}
            occasion={occasion}
            weather={weatherState.weather}
            variant={variant}
            setVariant={setVariant}
            preset={preset}
            onSave={saveOutfit}
            go={go}
          />
        )
      case "history":
        return (
          <History
            saved={saved}
            setSaved={setSaved}
            open={(o) => {
              setPreset(o)
              setView("outfit")
              window.scrollTo({ top: 0 })
            }}
            onExport={exportExcel}
          />
        )
      default:
        return (
          <Home
            weatherState={weatherState}
            location={location}
            setLocation={setLocation}
            refreshWeather={() => setRefresh((n) => n + 1)}
            occasions={occasions}
            setOccasions={setOccasions}
            occasion={occasion}
            setOccasion={setOccasion}
            onBuild={buildOutfit}
          />
        )
    }
  })()

  return (
    <Page view={view} setView={go} user={user} onLogout={logout}>
      {content}
    </Page>
  )
}
