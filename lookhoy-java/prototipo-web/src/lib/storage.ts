import { useCallback, useEffect, useState } from "react"

const PREFIX = "lookhoy:"

function read<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? initial : (JSON.parse(raw) as T)
  } catch {
    return initial
  }
}

/** useState persistido en localStorage. `error` se activa si el navegador no deja guardar (p. ej. cuota llena). */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => read(key, initial))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      setError(null)
    } catch {
      setError(
        "No se pudo guardar en este navegador (almacenamiento lleno). Elimina algunas prendas e inténtalo de nuevo.",
      )
    }
  }, [key, value])

  const reset = useCallback(() => setValue(initial), [initial])
  return [value, setValue, error, reset] as const
}

export function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
