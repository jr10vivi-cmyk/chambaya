import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { exportarCSV } from '../../lib/exportCSV'
import { Download, DollarSign, TrendingUp, Percent, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const fmt = n =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

// ── Mini KPI Card ─────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className={`w-fit p-2.5 rounded-xl mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function AdminIngresos() {
  const [ingresos, setIngresos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [kpis, setKpis] = useState({ total: 0, comision: 0, publicidad: 0, suscripcion: 0 })

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let q = supabase.from('ingresos_plataforma')
        .select('*').order('fecha', { ascending: false }).limit(300)
      if (filtro) q = q.eq('tipo', filtro)
      const { data } = await q
      const arr = data || []
      setIngresos(arr)

      // Calcular KPIs de todos los ingresos (sin filtro)
      const { data: todos } = await supabase
        .from('ingresos_plataforma').select('tipo, monto')
      const todosArr = todos || []
      const byTipo = tipo => todosArr.filter(i => i.tipo === tipo).reduce((s, i) => s + Number(i.monto), 0)
      setKpis({
        total: todosArr.reduce((s, i) => s + Number(i.monto), 0),
        comision: byTipo('comision'),
        publicidad: byTipo('publicidad'),
        suscripcion: byTipo('suscripcion'),
      })

      setLoading(false)
    }
    fetch()
  }, [filtro])

  const handleExportar = () => {
    exportarCSV(
      ingresos.map(i => ({
        Fecha: new Date(i.fecha).toLocaleDateString('es-PE'),
        Tipo: i.tipo,
        Monto: Number(i.monto).toFixed(2),
        Descripción: i.descripcion || '',
      })),
      'ingresos_chambaya'
    )
    toast.success('CSV exportado ✓')
  }

  const tipoCfg = {
    comision:   { color: 'bg-orange-50 text-orange-700 border-orange-100', label: 'Comisión' },
    publicidad: { color: 'bg-blue-50 text-blue-700 border-blue-100',     label: 'Publicidad' },
    suscripcion:{ color: 'bg-purple-50 text-purple-700 border-purple-100', label: 'Suscripción' },
  }

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingresos de la plataforma</h1>
          <p className="text-sm text-gray-500 mt-1">Comisiones (10%), publicidad y suscripciones</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign}  label="Total histórico"    value={fmt(kpis.total)}       color="green" />
        <KpiCard icon={Percent}     label="Comisiones (10%)"   value={fmt(kpis.comision)}    color="orange" />
        <KpiCard icon={TrendingUp}  label="Publicidad"         value={fmt(kpis.publicidad)}  color="blue" />
        <KpiCard icon={CreditCard}  label="Suscripciones"      value={fmt(kpis.suscripcion)} color="purple" />
      </div>

      {/* Barra de distribución */}
      {kpis.total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución de ingresos</h3>
          <div className="flex rounded-full overflow-hidden h-4">
            {[
              { pct: (kpis.comision / kpis.total) * 100, color: 'bg-orange-500' },
              { pct: (kpis.publicidad / kpis.total) * 100, color: 'bg-blue-500' },
              { pct: (kpis.suscripcion / kpis.total) * 100, color: 'bg-purple-500' },
            ].map((seg, i) => seg.pct > 0 && (
              <div key={i} style={{ width: `${seg.pct}%` }} className={`${seg.color} h-full transition-all duration-700`} />
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { color: 'bg-orange-500', label: 'Comisiones', value: kpis.total > 0 ? ((kpis.comision / kpis.total) * 100).toFixed(0) : 0 },
              { color: 'bg-blue-500', label: 'Publicidad', value: kpis.total > 0 ? ((kpis.publicidad / kpis.total) * 100).toFixed(0) : 0 },
              { color: 'bg-purple-500', label: 'Suscripciones', value: kpis.total > 0 ? ((kpis.suscripcion / kpis.total) * 100).toFixed(0) : 0 },
            ].map(seg => (
              <div key={seg.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                {seg.label} ({seg.value}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Fecha', 'Tipo', 'Monto', 'Descripción'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ingresos.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">Sin registros</td></tr>
              )}
              {ingresos.map((ing, i) => {
                const cfg = tipoCfg[ing.tipo] || { color: 'bg-gray-100 text-gray-600 border-gray-100', label: ing.tipo }
                return (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(ing.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{fmt(ing.monto)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{ing.descripcion || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
            {ingresos.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-100">
                <tr>
                  <td colSpan={2} className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                    Total ({ingresos.length} registros)
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold text-green-600">
                    {fmt(ingresos.reduce((s, i) => s + Number(i.monto), 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}