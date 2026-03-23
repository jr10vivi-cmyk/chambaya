import type { User } from '@supabase/supabase-js'
import type { Database } from './database'

// ── Alias de tablas (extraídos del schema real de Supabase) ──
type TablesMap = Database['public']['Tables']
export type Profile = TablesMap['profiles']['Row']
export type Tecnico = TablesMap['tecnicos']['Row']
export type Solicitud = TablesMap['solicitudes']['Row']
export type Categoria = TablesMap['categorias']['Row']
export type Conversacion = TablesMap['conversaciones']['Row']
export type Mensaje = TablesMap['mensajes']['Row']
export type Pago = TablesMap['pagos']['Row']
export type Resena = TablesMap['resenas']['Row']
export type IngresoPlataforma = TablesMap['ingresos_plataforma']['Row']
export type Notificacion = TablesMap['notificaciones']['Row']
export type SaldoTecnico = TablesMap['saldo_tecnicos']['Row']
export type Publicidad = TablesMap['publicidades']['Row']
export type Suscripcion = TablesMap['suscripciones']['Row']
export type TecnicoFoto = TablesMap['tecnico_fotos']['Row']

// ── Enums de dominio ──
export type UserRole = 'admin' | 'tecnico' | 'cliente'
export type EstadoSolicitud = 'pendiente' | 'aceptado' | 'en_proceso' | 'completado' | 'cancelado'
export type EstadoVerificacion = 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'

// ── Auth Context ──
export interface AuthContextValue {
  user: User | null
  profile: ProfileConTecnico | null
  loading: boolean
  isAdmin: boolean
  isTecnico: boolean
  isCliente: boolean
  tecnico: Tecnico | null
  signUp: (params: SignUpParams) => Promise<{ user: User | null }>
  signIn: (params: SignInParams) => Promise<{ user: User }>
  signOut: () => Promise<void>
  refreshProfile: () => void
}

export type ProfileConTecnico = Profile & { tecnicos?: Tecnico | null }

export interface SignUpParams {
  email: string
  password: string
  nombre: string
  apellido: string
  role: UserRole
}

export interface SignInParams {
  email: string
  password: string
}

// ── Solicitud con relaciones (resultado de select con joins) ──
export interface SolicitudConRelaciones extends Solicitud {
  profiles?: Pick<Profile, 'nombre' | 'apellido' | 'avatar_url' | 'telefono'> & { id?: string } | null
  tecnicos?: (Pick<Tecnico, 'tarifa_hora'> & {
    id?: string
    profiles?: Pick<Profile, 'nombre' | 'apellido' | 'avatar_url'> | null
  }) | null
  categorias?: Pick<Categoria, 'nombre' | 'icono'> | null
  resenas?: Pick<Resena, 'id' | 'calificacion' | 'comentario'>[] | null
}

// ── Técnico con datos de búsqueda ──
export interface TecnicoConScore extends Tecnico {
  profiles?: Pick<Profile, 'nombre' | 'apellido' | 'avatar_url' | 'ciudad'> | null
  tecnico_categorias?: Array<{
    categoria_id: string | null
    categorias: Pick<Categoria, 'id' | 'nombre' | 'icono'> | null
  }>
  distancia?: number
  scoreRecomendacion?: number
}

export interface FiltrosTecnicos {
  categoriaId?: string
  userLat?: number
  userLng?: number
  radioKm?: number
  busqueda?: string
  calificacionMin?: number
}

// ── Re-export Database para uso externo ──
export type { Database }
