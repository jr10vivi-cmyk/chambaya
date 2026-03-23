import { useAdminStats } from '../../hooks/useAdminStats'
import {
    Users, Wrench, DollarSign, ShoppingBag,
    Clock, TrendingUp, Star, AlertCircle, CheckCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Componente de tarjeta de estadística
function StatCard({ icon: Icon, label, value, sub, color, to }) {
    const colors = {
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
        amber: 'bg-amber-50 text-amber-600',
    }
    const card = (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon size={22} />
                </div>
                {sub && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        {sub}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value ?? '—'}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    )
    return to ? <Link to={to}>{card}</Link> : card
}

// Mini gráfico de barras
function MiniBarChart({ data }) {
    if (!data?.length) return null
    const max = Math.max(...data.map(d => d.monto), 1)

    return (
        <div className="flex items-end gap-2 h-20">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full bg-orange-500 rounded-t-md transition-all duration-500"
                        style={{ height: `${Math.max((d.monto / max) * 64, d.monto > 0 ? 6 : 2)}px` }}
                    />
                    <span className="text-xs text-gray-400">{d.dia}</span>
                </div>
            ))}
        </div>
    )
}

// Badge de estado de solicitud
function EstadoBadge({ estado }) {
    const cfg = {
        pendiente: { color: 'bg-amber-50 text-amber-700', label: 'Pendiente' },
        aceptado: { color: 'bg-blue-50 text-blue-700', label: 'Aceptado' },
        en_proceso: { color: 'bg-purple-50 text-purple-700', label: 'En proceso' },
        completado: { color: 'bg-green-50 text-green-700', label: 'Completado' },
        cancelado: { color: 'bg-red-50 text-red-700', label: 'Cancelado' },
    }
    const { color, label } = cfg[estado] || { color: 'bg-gray-100 text-gray-600', label: estado }
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

export default function AdminDashboard() {
    const { stats, loading } = useAdminStats()

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const formatMoney = (n) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

    return (
        <div className="space-y-8 max-w-7xl">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {stats?.tecnicosPendientes > 0 && (
                    <Link to="/admin/tecnicos?filtro=pendiente"
                        className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-100 transition">
                        <AlertCircle size={16} />
                        {stats.tecnicosPendientes} técnico{stats.tecnicosPendientes > 1 ? 's' : ''} por aprobar
                    </Link>
                )}
            </div>

            {/* Tarjetas principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Clientes" value={stats?.totalClientes} color="blue" to="/admin/clientes" />
                <StatCard icon={Wrench} label="Técnicos" value={stats?.totalTecnicos} color="orange" to="/admin/tecnicos" />
                <StatCard icon={ShoppingBag} label="Servicios hoy" value={stats?.serviciosHoy} color="purple" to="/admin/servicios" />
                <StatCard icon={CheckCircle} label="Completados total" value={stats?.serviciosTotal} color="green" />
            </div>

            {/* Ingresos + gráfico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Total ingresos */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="p-2 bg-green-50 rounded-xl"><DollarSign size={18} className="text-green-600" /></div>
                        <h3 className="font-semibold text-gray-800">Ingresos totales</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-6">
                        {formatMoney(stats?.ingresosTotal)}
                    </p>
                    <div className="space-y-3">
                        {[
                            { label: 'Comisiones (10%)', value: stats?.ingresosPorTipo?.comision, color: 'bg-orange-500' },
                            { label: 'Publicidad', value: stats?.ingresosPorTipo?.publicidad, color: 'bg-blue-500' },
                            { label: 'Suscripciones', value: stats?.ingresosPorTipo?.suscripcion, color: 'bg-purple-500' },
                        ].map(({ label, value, color }) => {
                            const pct = stats?.ingresosTotal > 0 ? ((value / stats.ingresosTotal) * 100).toFixed(0) : 0
                            return (
                                <div key={label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">{label}</span>
                                        <span className="font-medium text-gray-800">{formatMoney(value)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Gráfico 7 días */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-50 rounded-xl"><TrendingUp size={18} className="text-orange-500" /></div>
                            <h3 className="font-semibold text-gray-800">Ingresos últimos 7 días</h3>
                        </div>
                    </div>
                    <MiniBarChart data={stats?.ultimos7dias} />
                    {stats?.ultimos7dias?.every(d => d.monto === 0) && (
                        <p className="text-center text-gray-400 text-sm mt-4">Aún no hay ingresos registrados</p>
                    )}
                </div>
            </div>

            {/* Técnicos top + Servicios recientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Técnicos más activos */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-gray-800">Técnicos más activos</h3>
                        <Link to="/admin/tecnicos" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Ver todos</Link>
                    </div>
                    <div className="space-y-3">
                        {stats?.tecnicosActivos?.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-6">Sin datos aún</p>
                        )}
                        {stats?.tecnicosActivos?.map((t, i) => (
                            <div key={t.id} className="flex items-center gap-3">
                                <span className="w-6 text-sm font-bold text-gray-400">#{i + 1}</span>
                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                                    {t.profiles?.nombre?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {t.profiles?.nombre} {t.profiles?.apellido}
                                    </p>
                                    <p className="text-xs text-gray-400">{t.total_trabajos} trabajos</p>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                                    <Star size={14} fill="currentColor" />
                                    {t.calificacion_promedio?.toFixed(1) || '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Servicios recientes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-gray-800">Servicios recientes</h3>
                        <Link to="/admin/servicios" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Ver todos</Link>
                    </div>
                    <div className="space-y-3">
                        {stats?.serviciosRecientes?.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-6">Sin servicios aún</p>
                        )}
                        {stats?.serviciosRecientes?.map(s => (
                            <div key={s.id} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {s.profiles?.nombre || 'Cliente'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(s.creado_en).toLocaleDateString('es-PE')}
                                        {s.precio_acordado ? ` · ${formatMoney(s.precio_acordado)}` : ''}
                                    </p>
                                </div>
                                <EstadoBadge estado={s.estado} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}