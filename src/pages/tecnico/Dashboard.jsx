import { useAuth } from '../../context/AuthContext'
import { useTecnicoData } from '../../hooks/useTecnicoData'
import { Link } from 'react-router-dom'
import {
  Clock, Wrench, CheckCircle, DollarSign,
  Star, AlertCircle, Crown, TrendingUp,
  ChevronRight, ArrowRight
} from 'lucide-react'

// Badge estado
const ESTADO_CFG = {
  pendiente: { color: 'bg-amber-50 text-amber-700', label: 'Pendiente' },
  aceptado: { color: 'bg-blue-50 text-blue-700', label: 'Aceptado' },
  en_proceso: { color: 'bg-purple-50 text-purple-700', label: 'En proceso' },
  completado: { color: 'bg-green-50 text-green-700', label: 'Completado' },
  cancelado: { color: 'bg-red-50 text-red-700', label: 'Cancelado' },
}

function EstadoBadge({ estado }) {
  const { color, label } = ESTADO_CFG[estado] || { color: 'bg-gray-100 text-gray-500', label: estado }
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

function MiniBar({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.monto), 1)
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-orange-500 rounded-sm transition-all duration-700"
            style={{ height: `${Math.max((d.monto / max) * 52, d.monto > 0 ? 4 : 1)}px`, opacity: d.monto > 0 ? 1 : 0.2 }} />
          <span className="text-xs text-gray-400" style={{ fontSize: '9px' }}>{d.dia}</span>
        </div>
      ))}
    </div>
  )
}

export default function TecnicoDashboard() {
  const { profile, tecnico } = useAuth()
  const { stats, solicitudes, loading } = useTecnicoData()

  const fmt = n => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)
  const nombre = profile?.nombre?.split(' ')[0] || 'Técnico'

  const verificado = tecnico?.estado_verificacion === 'aprobado'
  const pendVerif = tecnico?.estado_verificacion === 'pendiente'
  const rechazado = tecnico?.estado_verificacion === 'rechazado'

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Saludo ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {nombre} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {tecnico?.es_premium && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium">
            <Crown size={15} fill="currentColor" />
            Premium activo hasta {new Date(tecnico.premium_hasta).toLocaleDateString('es-PE')}
          </div>
        )}
      </div>

      {/* ── Alertas de estado ── */}
      {pendVerif && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Cuenta en revisión</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Tu perfil está siendo verificado por el equipo de ChambaYA. Te notificaremos cuando sea aprobado.
            </p>
          </div>
        </div>
      )}
      {rechazado && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Cuenta no aprobada</p>
            <p className="text-red-700 text-xs mt-0.5">
              Tu solicitud fue rechazada. <Link to="/tecnico/perfil" className="underline font-medium">Actualiza tu perfil</Link> y contáctanos para revisión.
            </p>
          </div>
        </div>
      )}
      {!tecnico?.descripcion && verificado && (
        <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-blue-500 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              <span className="font-semibold">Completa tu perfil</span> para atraer más clientes
            </p>
          </div>
          <Link to="/tecnico/perfil"
            className="text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition whitespace-nowrap">
            Completar →
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Stats principales ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Pendientes', value: stats?.pendientes || 0, color: 'text-amber-500  bg-amber-50', to: '/tecnico/solicitudes' },
              { icon: Wrench, label: 'En proceso', value: stats?.enProceso || 0, color: 'text-purple-500 bg-purple-50', to: '/tecnico/trabajos' },
              { icon: CheckCircle, label: 'Completados', value: stats?.completados || 0, color: 'text-green-500  bg-green-50', to: '/tecnico/trabajos' },
              {
                icon: Star, label: 'Calificación', value: tecnico?.calificacion_promedio?.toFixed(1) || '—',
                color: 'text-orange-500 bg-orange-50', to: '/tecnico/perfil'
              },
            ].map(({ icon: Icon, label, value, color, to }) => (
              <Link key={label} to={to}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </Link>
            ))}
          </div>

          {/* ── Ganancias + grafico ── */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {/* Total */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-50 rounded-xl"><DollarSign size={18} className="text-green-600" /></div>
                <p className="font-semibold text-gray-800 text-sm">Ganancias totales</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{fmt(stats?.totalGanado)}</p>
              <p className="text-xs text-gray-400 mt-1">Después del 10% de comisión</p>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comisión plataforma</span>
                  <span className="font-medium text-red-500">-10%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Tu parte</span>
                  <span className="font-medium text-green-600">90%</span>
                </div>
              </div>
            </div>

            {/* Gráfico 7 días */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sm:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-50 rounded-xl"><TrendingUp size={18} className="text-orange-500" /></div>
                <p className="font-semibold text-gray-800 text-sm">Últimos 7 días</p>
              </div>
              <MiniBar data={stats?.ultimos7} />
              {stats?.ultimos7?.every(d => d.monto === 0) && (
                <p className="text-center text-gray-300 text-xs mt-2">Sin ingresos esta semana</p>
              )}
            </div>
          </div>

          {/* ── Solicitudes recientes + reseñas ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Solicitudes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">Solicitudes recientes</p>
                <Link to="/tecnico/solicitudes"
                  className="text-xs text-orange-500 font-medium hover:text-orange-600 flex items-center gap-1">
                  Ver todas <ChevronRight size={13} />
                </Link>
              </div>
              {solicitudes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300 text-3xl mb-2">📋</p>
                  <p className="text-sm text-gray-400">Aún no tienes solicitudes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {solicitudes.map(s => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0 mt-0.5">
                        {s.profiles?.nombre?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{s.titulo}</p>
                        <p className="text-xs text-gray-400">
                          {s.profiles?.nombre} · {new Date(s.creado_en).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <EstadoBadge estado={s.estado} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reseñas recientes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">Reseñas recientes</p>
                <div className="flex items-center gap-1.5 text-sm">
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  <span className="font-bold text-gray-700">{tecnico?.calificacion_promedio?.toFixed(1) || '—'}</span>
                  <span className="text-gray-400 text-xs">({tecnico?.total_resenas || 0})</span>
                </div>
              </div>
              {stats?.resenas?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300 text-3xl mb-2">⭐</p>
                  <p className="text-sm text-gray-400">Aún no tienes reseñas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.resenas.map((r, i) => (
                    <div key={i} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-gray-700">{r.profiles?.nombre}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star key={n} size={10}
                              className={n <= r.calificacion ? 'text-amber-400' : 'text-gray-200'}
                              fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {r.comentario && (
                        <p className="text-xs text-gray-500 line-clamp-2">{r.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── CTA Premium si no lo es ── */}
          {!tecnico?.es_premium && verificado && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={20} fill="white" />
                    <h3 className="font-bold text-lg">Hazte Premium</h3>
                  </div>
                  <p className="text-white/80 text-sm max-w-sm">
                    Aparece primero en búsquedas, obtén la etiqueta verificada y recibe hasta 3× más solicitudes.
                  </p>
                </div>
                <Link to="/tecnico/planes"
                  className="flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-3 rounded-xl hover:bg-orange-50 transition whitespace-nowrap text-sm">
                  Ver planes <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}