import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { exportarCSV } from '../../lib/exportCSV'
import { Download, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminIngresos() {
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    const fetch = async () => {
      let q = supabase.from('ingresos_plataforma')
        .select('*').order('fecha', { ascending: false }).limit(200)
      if (filtro) q = q.eq('tipo', filtro)
      const { data } = await q
      setIngresos(data || [])
      setLoading(false)
    }
    fetch()
  }, [filtro])

  const total = ingresos.reduce((s, i) => s + Number(i.monto), 0)
  const fmt = n => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

  const handleExportar = () => {
    exportarCSV(
      ingresos.map(i => ({
        Fecha: new Date(i.fecha).toLocaleDateString('es-PE'),
        Tipo: i.tipo, Monto: Number(i.monto).toFixed(2),
        Descripción: i.descripcion || ''
      })),
      'ingresos'
    )
    toast.success('CSV exportado ✓')
  }

  const tipoCfg = {
    comision: { color: 'bg-orange-50 text-orange-700', label: 'Comisión' },
    publicidad: { color: 'bg-blue-50 text-blue-700', label: 'Publicidad' },
    suscripcion: { color: 'bg-purple-50 text-purple-700', label: 'Suscripción' },
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingresos</h1>
          <p className="text-sm text-gray-500 mt-1">Total: <span className="font-bold text-green-600">{fmt(total)}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="">Todos los tipos</option>
            <option value="comision">Comisiones</option>
            <option value="publicidad">Publicidad</option>
            <option value="suscripcion">Suscripciones</option>
          </select>
          <button onClick={handleExportar}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition">
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>{['Fecha', 'Tipo', 'Monto', 'Descripción'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ingresos.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">Sin registros</td></tr>
              )}
              {ingresos.map((ing, i) => {
                const cfg = tipoCfg[ing.tipo] || { color: 'bg-gray-100 text-gray-600', label: ing.tipo }
                return (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(ing.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{fmt(ing.monto)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{ing.descripcion || '—'}</td>
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