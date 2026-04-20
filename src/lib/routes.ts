/**
 * Rutas centralizadas de la aplicación.
 * Usar siempre estas constantes en lugar de strings literales.
 */

export const ROUTES = {
  // Públicas
  HOME:     '/',
  LOGIN:    '/login',
  REGISTRO: '/registro',
  NO_AUTH:  '/no-autorizado',

  // Admin
  ADMIN: {
    ROOT:          '/admin',
    TECNICOS:      '/admin/tecnicos',
    CLIENTES:      '/admin/clientes',
    SERVICIOS:     '/admin/servicios',
    CATEGORIAS:    '/admin/categorias',
    INGRESOS:      '/admin/ingresos',
    PUBLICIDAD:    '/admin/publicidad',
    SUSCRIPCIONES: '/admin/suscripciones',
    REPORTES:      '/admin/reportes',
    DISPUTAS:      '/admin/disputas',
  },

  // Públicas adicionales
  TERMINOS:   '/terminos',
  PRIVACIDAD: '/privacidad',

  // Técnico
  TECNICO: {
    ROOT:        '/tecnico',
    PERFIL:      '/tecnico/perfil',
    SOLICITUDES: '/tecnico/solicitudes',
    TRABAJOS:    '/tecnico/trabajos',
    GANANCIAS:   '/tecnico/ganancias',
    PLANES:      '/tecnico/planes',
    CHAT:        '/tecnico/chat',
    CHAT_ID:     (id: string) => `/tecnico/chat/${id}`,
  },

  // Cliente
  CLIENTE: {
    ROOT:          '/cliente',
    BUSCAR:        '/cliente/buscar',
    SOLICITUDES:   '/cliente/solicitudes',
    HISTORIAL:     '/cliente/historial',
    CHAT:          '/cliente/chat',
    CHAT_ID:       (id: string) => `/cliente/chat/${id}`,
    TECNICO_PERFIL:(id: string) => `/cliente/tecnico/${id}`,
  },
} as const

/** Ruta de inicio según el rol del usuario */
export const ROLE_HOME: Record<string, string> = {
  admin:   ROUTES.ADMIN.ROOT,
  tecnico: ROUTES.TECNICO.ROOT,
  cliente: ROUTES.CLIENTE.ROOT,
}
