import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Crown, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSuscripciones() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('suscripciones')
      .select('*, tecnicos(id, profiles(nombre, apellido, email))')
      .order('creado_en', { ascending: false })
      .then(({ data }) => { setSubs(data || []); setLoading(false) })
  }, [])

  const cancelar = async (id, tecnicoId) => {
    if (!window.confirm('¿Cancelar esta suscripción?')) return
    await Promise.all([
      supabase.from('suscripciones').update({ estado: 'cancelado' }).eq('id', id),
      supabase.from('tecnicos').update({ es_premium: false, premium_hasta: null }).eq('id', tecnicoId)
    ])
    setSubs(s => s.map(x => x.id === id ? { ...x, estado: 'cancelado' } : x))
    toast.success('Suscripción cancelada')
  }

  const totales = {
    activas: subs.filter(s => s.estado === 'activo').length,
    ingresos: subs.filter(s => s.estado === 'activo').reduce((a, s) => a + Number(s.precio || 0), 0),
  }
  const fmt = n => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

  const planCfg = {
    mensual: { label: 'Mensual', color: 'bg-blue-50 text-blue-700' },
    trimestral: { label: 'Trimestral', color: 'bg-purple-50 text-purple-700' },
    anual: { label: 'Anual', color: 'bg-green-50 text-green-700' },
  }

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Suscripciones Premium</h1>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-amber-500" fill="currentColor" />
            <span className="font-semibold text-gray-700 text-sm">Suscripciones activas</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totales.activas}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-500" />
            <span className="font-semibold text-gray-700 text-sm">Ingresos por suscripciones</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{fmt(totales.ingresos)}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>{['Técnico', 'Plan', 'Precio', 'Inicio', 'Vence', 'Estado', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subs.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Sin suscripciones</td></tr>
              )}
              {subs.map(s => {
                const pc = planCfg[s.plan] || { label: s.plan, color: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {s.tecnicos?.profiles?.nombre} {s.tecnicos?.profiles?.apellido}
                      </p>
                      <p className="text-xs text-gray-400">{s.tecnicos?.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${pc.color}`}>{pc.label}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{fmt(s.precio)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(s.inicio).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(s.fin).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${{ activo: 'bg-green-50 text-green-700', cancelado: 'bg-red-50 text-red-600', expirado: 'bg-gray-100 text-gray-500' }[s.estado] || ''}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {s.estado === 'activo' && (
                        <button onClick={() => cancelar(s.id, s.tecnicos?.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                          <XCircle size={12} /> Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}