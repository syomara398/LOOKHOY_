import type { ReactNode } from "react"
import type { User, View } from "@/types"

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
      </>
    ),
    cloud: <path d="M17.5 19H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19.7 11 4 4 0 0 1 17.5 19Z" />,
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    upload: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),
    download: (
      <>
        <path d="M12 4v12M7 11l5 5 5-5" />
        <path d="M5 20h14" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6" />
        <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export function Button({
  children,
  secondary = false,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: {
  children: ReactNode
  secondary?: boolean
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Ir al inicio">
      LOOK<span>HOY</span>
    </button>
  )
}

export function Heading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  )
}

export function initials(user: User | null) {
  const base = user?.name?.trim() || user?.email || "?"
  return base
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

export function Page({
  view,
  setView,
  user,
  onLogout,
  children,
}: {
  view: View
  setView: (v: View) => void
  user: User | null
  onLogout: () => void
  children: ReactNode
}) {
  const links: [string, View][] = [
    ["Inicio", "home"],
    ["Mi clóset", "closet"],
    ["Subir prenda", "upload"],
    ["Outfit del día", "today"],
    ["Historial y favoritos", "history"],
  ]
  return (
    <>
      <header className="nav">
        <Brand onClick={() => setView("home")} />
        <nav>
          {links.map(([label, v]) => (
            <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="profile" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <span>{initials(user)}</span>
          <Icon name="user" />
        </button>
      </header>
      <main className="page">{children}</main>
    </>
  )
}
