import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
    AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, User, Wrench, X
} from 'lucide-react'

const ESTADOS_DISPUTA = [
    { value: '', label: 'Todas' },
    { value: 'abierta', label: 'Abiertas' },
    { value: 'en_revision', label: 'En revisión' },
    { value: 'resuelta_cliente', label: 'Res. cliente' },
    { value: 'resuelta_tecnico', label: 'Res. técnico' },
    { value: 'cerrada', label: 'Cerradas' },
]

const ESTADO_CFG = {
    abierta:           { color: 'bg-red-50 text-red-700 border-red-200',       label: 'Abierta' },
    en_revision:       { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'En revisión' },
    resuelta_cliente:  { color: 'bg-blue-50 text-blue-700 border-blue-200',    label: 'Res. cliente' },
    resuelta_tecnico:  { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Res. técnico' },
    cerrada:           { color: 'bg-gray-100 text-gray-600 border-gray-200',   label: 'Cerrada' },
}

const MOTIVO_LABELS: Record<string, string> = {
    trabajo_incompleto: 'Trabajo incompleto',
    calidad_deficiente: 'Mala calidad',
    cobro_excesivo:     'Cobro excesivo',
    no_presento:        'Técnico no llegó',
    daño_propiedad:     'Daño a propiedad',
    otro:               'Otro',
}

interface Disputa {
    id: string
    solicitud_id: string
    motivo: string
    descripcion: string | null
    estado: string
    resolucion: string | null
    creado_en: string
    resuelto_en: string | null
    cliente: { nombre: string; apellido: string; email: string } | null
    tecnico: { nombre: string; apellido: string; email: string } | null
    solicitud_titulo: string | null
}

interface ModalResolverState {
    disputa: Disputa
    decision: 'resuelta_cliente' | 'resuelta_tecnico' | 'cerrada'
    resolucion: string
}

function EstadoBadge({ estado }: { estado: string }) {
    const cfg = ESTADO_CFG[estado as keyof typeof ESTADO_CFG] ?? { color: 'bg-gray-100 text-gray-600 border-gray-200', label: estado }
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
            {cfg.label}
        </span>
    )
}

export default function AdminDisputas() {
    const [disputas, setDisputas] = useState<Disputa[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState('')
    const [modal, setModal] = useState<ModalResolverState | null>(null)
    const [procesando, setProcesando] = useState(false)

    const fetchDisputas = useCallback(async () => {
        setLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q = (supabase as any)
            .from('disputas')
            .select(`
                id, solicitud_id, motivo, descripcion, estado,
                resolucion, creado_en, resuelto_en,
                cliente:profiles!disputas_cliente_id_fkey(nombre, apellido, email),
                tecnico:profiles!disputas_tecnico_id_fkey(nombre, apellido, email),
                solicitudes(titulo)
            `)
            .order('creado_en', { ascending: false })

        if (filtroEstado) q = q.eq('estado', filtroEstado)

        const { data, error } = await q
        if (error) toast.error('Error cargando disputas')
        else setDisputas(
            (data ?? []).map((d: any) => ({
                ...d,
                cliente: Array.isArray(d.cliente) ? d.cliente[0] ?? null : d.cliente,
                tecnico: Array.isArray(d.tecnico) ? d.tecnico[0] ?? null : d.tecnico,
                solicitud_titulo: d.solicitudes?.titulo ?? null,
            }))
        )
        setLoading(false)
    }, [filtroEstado])

    useEffect(() => { fetchDisputas() }, [fetchDisputas])

    const handleResolver = async () => {
        if (!modal) return
        if (!modal.resolucion.trim()) { toast.error('Ingresa la nota de resolución'); return }
        setProcesando(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).rpc('resolver_disputa', {
            p_disputa_id: modal.disputa.id,
            p_decision: modal.decision,
            p_resolucion: modal.resolucion.trim(),
        })
        if (error) toast.error('Error al resolver: ' + error.message)
        else { toast.success('Disputa resuelta'); setModal(null); fetchDisputas() }
        setProcesando(false)
    }

    const handleMarcarRevision = async (id: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('disputas')
            .update({ estado: 'en_revision' })
            .eq('id', id)
        if (error) toast.error('Error al actualizar')
        else { toast.success('Disputa en revisión'); fetchDisputas() }
    }

    const abiertasCount = disputas.filter(d => d.estado === 'abierta').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Disputas</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {abiertasCount > 0
                            ? `${abiertasCount} disputa${abiertasCount !== 1 ? 's' : ''} requiere${abiertasCount === 1 ? '' : 'n'} atención`
                            : 'Sin disputas pendientes'}
                    </p>
                </div>
                <button onClick={fetchDisputas}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                    <RefreshCw size={14} /> Actualizar
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
                {ESTADOS_DISPUTA.map(e => (
                    <button key={e.value} onClick={() => setFiltroEstado(e.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition border
                            ${filtroEstado === e.value
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'border-gray-200 text-gray-600 hover:border-orange-300 bg-white'}`}>
                        {e.label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : disputas.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <AlertTriangle size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400">No hay disputas{filtroEstado ? ' con este estado' : ''}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {disputas.map(d => (
                        <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                            <div className="flex items-start gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                    {/* Motivo + estado */}
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {MOTIVO_LABELS[d.motivo] ?? d.motivo}
                                        </span>
                                        <EstadoBadge estado={d.estado} />
                                    </div>

                                    {/* Servicio */}
                                    {d.solicitud_titulo && (
                                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                            <Wrench size={11} /> {d.solicitud_titulo}
                                        </p>
                                    )}

                                    {/* Descripción */}
                                    {d.descripcion && (
                                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 mb-3">{d.descripcion}</p>
                                    )}

                                    {/* Partes */}
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <User size={11} className="text-blue-400" />
                                            Cliente: {d.cliente ? `${d.cliente.nombre} ${d.cliente.apellido}` : '—'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Wrench size={11} className="text-orange-400" />
                                            Técnico: {d.tecnico ? `${d.tecnico.nombre} ${d.tecnico.apellido}` : '—'}
                                        </span>
                                    </div>

                                    {/* Resolución (si hay) */}
                                    {d.resolucion && (
                                        <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700">
                                            <span className="font-semibold">Resolución: </span>{d.resolucion}
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-400 text-right">
                                        {new Date(d.creado_en).toLocaleDateString('es-PE')}
                                    </span>
                                    {d.estado === 'abierta' && (
                                        <button onClick={() => handleMarcarRevision(d.id)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-medium hover:bg-amber-100 transition">
                                            <Clock size={12} /> En revisión
                                        </button>
                                    )}
                                    {['abierta', 'en_revision'].includes(d.estado) && (
                                        <>
                                            <button
                                                onClick={() => setModal({ disputa: d, decision: 'resuelta_cliente', resolucion: '' })}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium hover:bg-blue-100 transition">
                                                <CheckCircle size={12} /> Favor cliente
                                            </button>
                                            <button
                                                onClick={() => setModal({ disputa: d, decision: 'resuelta_tecnico', resolucion: '' })}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-medium hover:bg-purple-100 transition">
                                                <CheckCircle size={12} /> Favor técnico
                                            </button>
                                            <button
                                                onClick={() => setModal({ disputa: d, decision: 'cerrada', resolucion: '' })}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-100 transition">
                                                <XCircle size={12} /> Cerrar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal resolver */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Resolver disputa</h3>
                            <button onClick={() => setModal(null)} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-sm">
                            <p className="font-medium text-gray-700">{MOTIVO_LABELS[modal.disputa.motivo] ?? modal.disputa.motivo}</p>
                            {modal.disputa.descripcion && (
                                <p className="text-gray-500 mt-1">{modal.disputa.descripcion}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Decisión</p>
                            <div className="flex gap-2">
                                {([
                                    ['resuelta_cliente', 'Favor cliente', 'bg-blue-500'],
                                    ['resuelta_tecnico', 'Favor técnico', 'bg-purple-500'],
                                    ['cerrada',          'Cerrar caso',   'bg-gray-400'],
                                ] as const).map(([val, lbl, cls]) => (
                                    <button key={val} onClick={() => setModal(m => m ? { ...m, decision: val } : m)}
                                        className={`flex-1 py-2.5 rounded-xl text-white text-xs font-semibold transition ${cls}
                                            ${modal.decision === val ? 'ring-2 ring-offset-1 ring-current opacity-100' : 'opacity-50 hover:opacity-80'}`}>
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nota de resolución (visible para ambas partes)
                            </label>
                            <textarea value={modal.resolucion}
                                onChange={e => setModal(m => m ? { ...m, resolucion: e.target.value } : m)}
                                rows={3}
                                placeholder="Explica la decisión tomada..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setModal(null)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                Cancelar
                            </button>
                            <button onClick={handleResolver} disabled={procesando || !modal.resolucion.trim()}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                {procesando ? 'Guardando...' : 'Confirmar resolución'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
