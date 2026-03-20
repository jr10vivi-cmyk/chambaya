import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { DollarSign, CheckCircle, Star, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = n =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

export default function ClienteHistorial() {
  const { profile } = useAuth()
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, cantidad: 0 })

  useEffect(() => {
    if (!profile?.id) return
    const fetch = async () => {
      const { data } = await supabase
        .from('pagos')
        .select(`
          id, monto_total, comision, monto_tecnico,
          estado, creado_en,
          solicitudes(titulo, descripcion, estado, resenas(calificacion)),
          profiles!tecnico_id(nombre, apellido)
        `)
        .eq('cliente_id', profile.id)
        .eq('estado', 'completado')
        .order('creado_en', { ascending: false })

      const arr = data || []
      setPagos(arr)
      setStats({
        total: arr.reduce((s, p) => s + Number(p.monto_total), 0),
        cantidad: arr.length,
      })
      setLoading(false)
    }
    fetch()
  }, [profile?.id])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de servicios</h1>
        <p className="text-sm text-gray-500 mt-1">Registro de todos tus pagos y servicios completados</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-50 rounded-xl"><DollarSign size={18} className="text-green-600" /></div>
            <span className="text-sm text-gray-500">Total gastado</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(stats.total)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-50 rounded-xl"><ClipboardList size={18} className="text-orange-600" /></div>
            <span className="text-sm text-gray-500">Servicios pagados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.cantidad}</p>
        </div>
      </div>

      {/* Lista */}
      {pagos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-center bg-white rounded-2xl border border-gray-100">
          <ClipboardList size={40} className="text-gray-200 mb-3" />
          <p className="font-medium text-gray-500">Sin pagos aún</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Contrata un técnico y confirma el servicio para ver tu historial</p>
          <Link to="/cliente/buscar"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
            Buscar técnicos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {pagos.map(pago => {
              const tecnico = `${pago.profiles?.nombre || ''} ${pago.profiles?.apellido || ''}`.trim()
              const calif = pago.solicitudes?.resenas?.[0]?.calificacion
              return (
                <div key={pago.id} className="px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                        {tecnico?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {pago.solicitudes?.titulo || 'Servicio'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {tecnico || 'Técnico'} ·{' '}
                          {new Date(pago.creado_en).toLocaleDateString('es-PE', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="text-sm font-bold text-gray-900">{fmt(pago.monto_total)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Pagado</span>
                      </div>
                    </div>
                  </div>

                  {/* Calificación */}
                  {calif && (
                    <div className="mt-2 ml-12 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} size={12}
                          className={n <= calif ? 'text-amber-400' : 'text-gray-200'}
                          fill="currentColor" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">Tu calificación</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
