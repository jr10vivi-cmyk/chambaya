import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { exportarCSV } from '../../lib/exportCSV'
import { Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const ESTADOS = ['', 'pendiente', 'aceptado', 'en_proceso', 'completado', 'cancelado']
const ESTADO_CFG = {
    pendiente: { color: 'bg-amber-50 text-amber-700', label: 'Pendiente' },
    aceptado: { color: 'bg-blue-50 text-blue-700', label: 'Aceptado' },
    en_proceso: { color: 'bg-purple-50 text-purple-700', label: 'En proceso' },
    completado: { color: 'bg-green-50 text-green-700', label: 'Completado' },
    cancelado: { color: 'bg-red-50 text-red-600', label: 'Cancelado' },
}

export default function AdminServicios() {
    const [servicios, setServicios] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtro, setFiltro] = useState('')

    const fetchData = async () => {
        setLoading(true)
        let q = supabase.from('solicitudes')
            .select(`
        id, titulo, estado, precio_acordado, comision_plataforma, ganancia_tecnico, creado_en, fecha_completado,
        profiles!cliente_id(nombre, apellido),
        tecnicos(profiles(nombre, apellido))
      `)
            .order('creado_en', { ascending: false })
            .limit(100)
        if (filtro) q = q.eq('estado', filtro)
        const { data } = await q
        setServicios(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [filtro])

    const fmt = n => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0)

    const handleExportar = () => {
        exportarCSV(
            servicios.map(s => ({
                ID: s.id,
                Titulo: s.titulo,
                Estado: s.estado,
                Cliente: `${s.profiles?.nombre} ${s.profiles?.apellido}`,
                Tecnico: `${s.tecnicos?.profiles?.nombre} ${s.tecnicos?.profiles?.apellido}`,
                Precio: s.precio_acordado || '',
                Comision: s.comision_plataforma || '',
                Ganancia_Tecnico: s.ganancia_tecnico || '',
                Fecha: new Date(s.creado_en).toLocaleDateString('es-PE'),
            })),
            'servicios_chambaya'
        )
        toast.success('CSV exportado ✓')
    }

    const totalComisiones = servicios
        .filter(s => s.estado === 'completado')
        .reduce((a, s) => a + Number(s.comision_plataforma || 0), 0)

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Total comisiones cobradas: <span className="font-bold text-green-600">{fmt(totalComisiones)}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={filtro} onChange={e => setFiltro(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                        {ESTADOS.map(e => (
                            <option key={e} value={e}>{e ? ESTADO_CFG[e]?.label : 'Todos los estados'}</option>
                        ))}
                    </select>
                    <button onClick={handleExportar}
                        className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition">
                        <Download size={14} /> CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-100 bg-gray-50">
                                <tr>{['Servicio', 'Cliente', 'Técnico', 'Estado', 'Precio', 'Comisión', 'Fecha'].map(h => (
                                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {servicios.length === 0 && (
                                    <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Sin servicios</td></tr>
                                )}
                                {servicios.map(s => {
                                    const cfg = ESTADO_CFG[s.estado] || { color: 'bg-gray-100 text-gray-500', label: s.estado }
                                    return (
                                        <tr key={s.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3.5 text-sm font-medium text-gray-800 max-w-[180px] truncate">{s.titulo}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{s.profiles?.nombre} {s.profiles?.apellido}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600">{s.tecnicos?.profiles?.nombre} {s.tecnicos?.profiles?.apellido}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                                                {s.precio_acordado ? fmt(s.precio_acordado) : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm font-semibold text-orange-600">
                                                {s.comision_plataforma ? fmt(s.comision_plataforma) : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-gray-400">
                                                {new Date(s.creado_en).toLocaleDateString('es-PE')}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}