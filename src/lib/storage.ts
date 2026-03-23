/**
 * Utilidades para localStorage.
 * Centraliza el acceso para evitar try/catch repetidos y magic strings de keys.
 */

const KEYS = {
  AUTH: 'chambaya_auth',
} as const

interface CachedAuth {
  role: string
  userId: string
}

// ── Lectura / escritura genérica ───────────────────────────────────────────────

export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage puede estar bloqueado (modo privado en algunos browsers)
  }
}

export function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

// ── Caché propio de la app ─────────────────────────────────────────────────────

/**
 * Guarda rol + userId juntos para poder validar que el caché
 * pertenece al usuario actual y no a una sesión anterior.
 */
export function setCachedAuth(role: string, userId: string): void {
  lsSet<CachedAuth>(KEYS.AUTH, { role, userId })
}

export function clearCachedAuth(): void {
  lsRemove(KEYS.AUTH)
}

/**
 * Retorna el rol cacheado SOLO si el userId coincide con el usuario actual.
 * Evita usar caché stale de otra sesión.
 */
function getCachedRole(currentUserId: string): string | null {
  const data = lsGet<CachedAuth>(KEYS.AUTH)
  if (!data?.role || data.userId !== currentUserId) return null
  return data.role
}

// ── Sesión de Supabase ─────────────────────────────────────────────────────────

interface SupabaseStoredSession {
  refresh_token?: string
  user?: {
    id?: string
    user_metadata?: { role?: string }
  }
}

/** Lee userId y role desde el token de Supabase en localStorage (síncrono). */
function getSupabaseStoredSession(): SupabaseStoredSession | null {
  try {
    const key = Object.keys(localStorage).find(
      k => k.startsWith('sb-') && k.endsWith('-auth-token')
    )
    if (!key) return null
    const parsed = lsGet<SupabaseStoredSession>(key)
    return parsed?.refresh_token ? parsed : null
  } catch {
    return null
  }
}

/**
 * Retorna el rol del usuario actual validado contra su userId.
 * Primero usa el caché propio; si no coincide, usa el token de Supabase.
 * Retorna null si no hay sesión activa o el userId no cuadra.
 */
export function getAvailableRole(): string | null {
  const session = getSupabaseStoredSession()
  if (!session?.user?.id) return null

  const userId = session.user.id
  return getCachedRole(userId) ?? session.user.user_metadata?.role ?? null
}
