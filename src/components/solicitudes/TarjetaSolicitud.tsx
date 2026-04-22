import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import EstadoBadge from './EstadoBadge'
import {
    MapPin, DollarSign, Calendar, ChevronDown, ChevronUp,
    MessageCircle, Star, CheckCircle, Play, X, Clock, Smartphone, Lock, AlertTriangle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { SolicitudConRelaciones, UserRole } from '../../types'

interface ResenaInput {
    calificacion: number
    comentario: string
}

interface TarjetaSolicitudProps {
    solicitud: SolicitudConRelaciones
    miRole: UserRole
    onCambiarEstado: (id: string, estado: string, extras?: Record<string, unknown>) => Promise<{ error?: string } | undefined>
    onConfirmar: (id: string, precio: number) => Promise<void>
    onCalificar: (id: string, resena: ResenaInput) => Promise<void>
}

export default function TarjetaSolicitud({
    solicitud,
    miRole,
    onCambiarEstado,
    onConfirmar,
    onCalificar,
}: TarjetaSolicitudProps) {
    const [expandida, setExpandida] = useState(false)
    const [procesando, setProcesando] = useState(false)
    const [modalPrecio, setModalPrecio] = useState(false)
    const [modalResena, setModalResena] = useState(false)
    const [modalDeposito, setModalDeposito] = useState(false)
    const [modalDisputa, setModalDisputa] = useState(false)
    const [precio, setPrecio] = useState<string | number>(solicitud.precio_acordado || '')
    const [resena, setResena] = useState<ResenaInput>({ calificacion: 5, comentario: '' })
    const [deposito, setDeposito] = useState({ metodo: 'yape', referencia: '', monto: '' })
    const [disputa, setDisputa] = useState({ motivo: 'trabajo_incompleto', descripcion: '' })
    const [nps, setNps] = useState(8)

    const esTecnico = miRole === 'tecnico'
    const esCliente = miRole === 'cliente'

    const otroNombre = esTecnico
        ? `${solicitud.profiles?.nombre || ''} ${solicitud.profiles?.apellido || ''}`.trim()
        : `${solicitud.tecnicos?.profiles?.nombre || ''} ${solicitud.tecnicos?.profiles?.apellido || ''}`.trim()

    const tiempoAtras = formatDistanceToNow(
        new Date(solicitud.creado_en), { addSuffix: true, locale: es }
    )

    const fmt = (n: number | string) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0)

    const handleAccion = async (estado: string, extras?: Record<string, unknown>) => {
        setProcesando(true)
        const result = await onCambiarEstado(solicitud.id, estado, extras)
        if (result?.error) alert(result.error)
        setProcesando(false)
    }

    const handleConfirmar = async () => {
        if (!precio || isNaN(Number(precio))) { alert('Ingresa el monto final'); return }
        setProcesando(true)
        await onConfirmar(solicitud.id, Number(precio))
        setModalPrecio(false)
        setProcesando(false)
    }

    const handleDeposito = async () => {
        if (!deposito.referencia.trim()) { alert('Ingresa el código de operación'); return }
        if (!deposito.monto || isNaN(Number(deposito.monto))) { alert('Ingresa el monto'); return }
        setProcesando(true)
        await onCambiarEstado(solicitud.id, 'en_custodia', {
            metodo_pago_cliente: deposito.metodo,
            referencia_deposito: deposito.referencia.trim(),
            monto_depositado: Number(deposito.monto),
            fecha_deposito: new Date().toISOString(),
        })
        setModalDeposito(false)
        setProcesando(false)
    }

    const handleResena = async () => {
        setProcesando(true)
        await onCalificar(solicitud.id, resena)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('nps_respuestas').insert({
            solicitud_id: solicitud.id,
            puntuacion: nps,
        })
        // marcar como calificado localmente para actualizar la UI inmediatamente
        setYaCalificado(true)
        setModalResena(false)
        setProcesando(false)
    }

    const handleAbrirDisputa = async () => {
        if (!disputa.descripcion.trim()) { alert('Describe el problema para abrir la disputa'); return }
        setProcesando(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).rpc('abrir_disputa', {
            p_solicitud_id: solicitud.id,
            p_motivo: disputa.motivo,
            p_descripcion: disputa.descripcion.trim(),
        })
        if (error) alert('No se pudo abrir la disputa: ' + error.message)
        setModalDisputa(false)
        setProcesando(false)
    }

    const { profile } = useAuth()
    const [yaCalificado, setYaCalificado] = useState<boolean>((solicitud.resenas?.length ?? 0) > 0)
    const confirmado = solicitud.confirmado_cliente

    useEffect(() => {
        let mounted = true
        const check = async () => {
            if (!esCliente) return
            // si ya vienen resenas en el payload no preguntar
            if ((solicitud.resenas?.length ?? 0) > 0) return
            try {
                const { data } = await supabase.from('resenas').select('id').eq('solicitud_id', solicitud.id).eq('cliente_id', profile?.id).limit(1)
                if (mounted && data && (data as any).length > 0) setYaCalificado(true)
            } catch (e) {
                // ignore
            }
        }
        check()
        return () => { mounted = false }
    }, [solicitud.id, profile?.id, esCliente, solicitud.resenas])

    return (
        <>
            <div className={`bg-white rounded-2xl border transition-all duration-200
        ${solicitud.estado === 'pendiente' && esTecnico ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}
        ${procesando ? 'opacity-60' : ''}`}>

                {/* -- Cabecera -- */}
                <div className="p-5">
                    <div className="flex items-start gap-3">

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                            {otroNombre?.[0]?.toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                        {solicitud.titulo}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{otroNombre} · {tiempoAtras}</p>
                                </div>
                                <EstadoBadge estado={solicitud.estado} />
                            </div>

                            {/* Precio */}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {solicitud.presupuesto_cliente && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <DollarSign size={11} />
                                        Presupuesto: {fmt(solicitud.presupuesto_cliente)}
                                    </span>
                                )}
                                {solicitud.precio_acordado && (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">
                                        <CheckCircle size={11} />
                                        Acordado: {fmt(solicitud.precio_acordado)}
                                    </span>
                                )}
                                {solicitud.ganancia_tecnico && (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                                        Tu ganancia: {fmt(solicitud.ganancia_tecnico)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Expandir */}
                        <button onClick={() => setExpandida(v => !v)}
                            className="p-1.5 hover:bg-gray-100 rounded-xl transition flex-shrink-0">
                            {expandida
                                ? <ChevronUp size={16} className="text-gray-400" />
                                : <ChevronDown size={16} className="text-gray-400" />
                            }
                        </button>
                    </div>

                    {/* Detalles expandidos */}
                    {expandida && (
                        <div className="mt-4 pt-4 border-t border-gray-50 space-y-2.5">
                            <p className="text-sm text-gray-600 leading-relaxed">{solicitud.descripcion}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin size={12} className="text-gray-300 flex-shrink-0" />
                                {solicitud.direccion}
                            </div>
                            {solicitud.notas_tecnico && (
                                <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700">
                                    <span className="font-semibold">Nota del tecnico: </span>
                                    {solicitud.notas_tecnico}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                {solicitud.fecha_aceptado && (
                                    <span className="flex items-center gap-1">
                                        <Calendar size={11} />
                                        Aceptado: {new Date(solicitud.fecha_aceptado).toLocaleDateString('es-PE')}
                                    </span>
                                )}
                                {solicitud.fecha_completado && (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle size={11} />
                                        Completado: {new Date(solicitud.fecha_completado).toLocaleDateString('es-PE')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* -- Acciones -- */}
                <div className="px-5 pb-4 flex items-center gap-2 flex-wrap border-t border-gray-50 pt-3">

                    {/* -- Acciones del TECNICO -- */}
                    {esTecnico && (
                        <>
                            {solicitud.estado === 'pendiente' && (
                                <>
                                    <button onClick={() => handleAccion('aceptado')} disabled={procesando}
                                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                                        <CheckCircle size={13} /> Aceptar
                                    </button>
                                    <button onClick={() => handleAccion('cancelado')} disabled={procesando}
                                        className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-2 rounded-xl transition">
                                        <X size={13} /> Rechazar
                                    </button>
                                </>
                            )}

                            {solicitud.estado === 'aceptado' && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                                    <Clock size={12} /> Esperando depósito Yape/Plin del cliente
                                </div>
                            )}

                            {solicitud.estado === 'en_custodia' && (
                                <>
                                    <button onClick={() => handleAccion('en_proceso')} disabled={procesando}
                                        className="flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                                        <Play size={13} /> Iniciar trabajo
                                    </button>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                                        <Lock size={11} /> Pago asegurado
                                    </div>
                                </>
                            )}

                            {solicitud.estado === 'en_proceso' && (
                                <button
                                    onClick={() => handleAccion('completado')}
                                    disabled={procesando}
                                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                                    <CheckCircle size={13} /> Marcar completado
                                </button>
                            )}

                            {/* Chat */}
                            <Link
                                to={`/tecnico/chat`}
                                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium px-3 py-2 rounded-xl transition ml-auto">
                                <MessageCircle size={13} /> Chat
                            </Link>
                        </>
                    )}

                    {/* -- Acciones del CLIENTE -- */}
                    {esCliente && (
                        <>
                            {solicitud.estado === 'pendiente' && (
                                <button onClick={() => handleAccion('cancelado')} disabled={procesando}
                                    className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-2 rounded-xl transition">
                                    <X size={13} /> Cancelar solicitud
                                </button>
                            )}

                            {solicitud.estado === 'aceptado' && (
                                <button onClick={() => setModalDeposito(true)} disabled={procesando}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                                    <Smartphone size={13} /> Depositar via Yape/Plin
                                </button>
                            )}

                            {solicitud.estado === 'en_custodia' && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                                    <Lock size={12} /> Pago en custodia — esperando inicio del trabajo
                                </div>
                            )}

                            {solicitud.estado === 'completado' && !confirmado && (
                                <button onClick={() => setModalPrecio(true)} disabled={procesando}
                                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                                    <CheckCircle size={13} /> Confirmar y pagar
                                </button>
                            )}

                            {solicitud.estado === 'completado' && confirmado && !yaCalificado && (
                                <button onClick={() => setModalResena(true)} disabled={procesando}
                                    className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
                                    <Star size={13} fill="white" /> Calificar servicio
                                </button>
                            )}

                            {yaCalificado && solicitud.resenas && solicitud.resenas[0] && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Star size={12} className="text-amber-400" fill="currentColor" />
                                    Calificaste con {solicitud.resenas[0].calificacion} estrella{solicitud.resenas[0].calificacion !== 1 ? 's' : ''}
                                </div>
                            )}

                            {['en_proceso', 'completado'].includes(solicitud.estado) && !solicitud.tiene_disputa && (
                                <button onClick={() => setModalDisputa(true)} disabled={procesando}
                                    className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-2 rounded-xl transition">
                                    <AlertTriangle size={13} /> Abrir disputa
                                </button>
                            )}

                            {solicitud.tiene_disputa && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                                    <AlertTriangle size={12} /> Disputa en revisión
                                </div>
                            )}

                            {/* Chat */}
                            <Link to={`/cliente/chat`}
                                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium px-3 py-2 rounded-xl transition ml-auto">
                                <MessageCircle size={13} /> Chat
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* -- Modal: Depositar via Yape/Plin (Escrow) -- */}
            {modalDeposito && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Depositar en custodia</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Envía el pago por Yape o Plin al número de ChambaYA. El dinero quedará retenido hasta que confirmes la conformidad del trabajo.
                        </p>

                        {/* Número de cuenta ChambaYA */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 text-center">
                            <p className="text-xs text-orange-600 font-medium mb-1">Número ChambaYA</p>
                            <p className="text-2xl font-bold text-orange-700 tracking-widest">999 000 000</p>
                            <p className="text-xs text-orange-500 mt-1">A nombre de: ChambaYA SAC</p>
                        </div>

                        {/* Método */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Método de pago</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['yape', 'plin'] as const).map(m => (
                                    <button key={m} type="button"
                                        onClick={() => setDeposito(d => ({ ...d, metodo: m }))}
                                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition capitalize
                                            ${deposito.metodo === m
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-gray-200 text-gray-500 hover:border-orange-300'}`}>
                                        {m === 'yape' ? '💜 Yape' : '🔵 Plin'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Monto */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto depositado (S/)</label>
                            <input type="number" min="0" step="0.50"
                                value={deposito.monto}
                                onChange={e => setDeposito(d => ({ ...d, monto: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="0.00" />
                        </div>

                        {/* Código operación */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de operación</label>
                            <input type="text"
                                value={deposito.referencia}
                                onChange={e => setDeposito(d => ({ ...d, referencia: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Ej: 123456789" />
                            <p className="text-xs text-gray-400 mt-1">Código que aparece en tu comprobante {deposito.metodo === 'yape' ? 'Yape' : 'Plin'}</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setModalDeposito(false)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                Cancelar
                            </button>
                            <button onClick={handleDeposito} disabled={procesando || !deposito.referencia || !deposito.monto}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                {procesando ? 'Procesando...' : 'Confirmar depósito'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -- Modal: Confirmar y pagar -- */}
            {modalPrecio && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Confirmar servicio</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Al confirmar, el pago se liberara al tecnico (90%) y ChambaYA cobrara la comision del 10%.
                        </p>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Monto final del servicio (S/)
                            </label>
                            <input
                                type="number" min="0" step="0.50"
                                value={precio}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrecio(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="0.00"
                            />
                        </div>

                        {precio && !isNaN(Number(precio)) && Number(precio) > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total del servicio</span>
                                    <span className="font-semibold">{fmt(precio)}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Comision ChambaYA (10%)</span>
                                    <span>-{fmt(Number(precio) * 0.10)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-semibold border-t border-gray-200 pt-2 mt-2">
                                    <span>Tecnico recibe</span>
                                    <span>{fmt(Number(precio) * 0.90)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => setModalPrecio(false)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                Cancelar
                            </button>
                            <button onClick={handleConfirmar} disabled={procesando || !precio}
                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                {procesando ? 'Procesando...' : 'Confirmar y pagar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -- Modal: Calificar -- */}
            {modalResena && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Calificar servicio</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Tu resena ayuda a otros clientes y mejora el ranking del tecnico.
                        </p>

                        {/* Estrellas */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Calificacion</label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setResena(r => ({ ...r, calificacion: n }))}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={36}
                                            className={n <= resena.calificacion ? 'text-amber-400' : 'text-gray-200'}
                                            fill="currentColor"
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-sm font-medium text-gray-600 mt-2">
                                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][resena.calificacion]}
                            </p>
                        </div>

                        {/* Comentario */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Comentario (opcional)
                            </label>
                            <textarea
                                value={resena.comentario}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResena(r => ({ ...r, comentario: e.target.value }))}
                                rows={2}
                                placeholder="Cuentanos como fue tu experiencia..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                            />
                        </div>

                        {/* NPS */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ¿Qué tan probable es que recomiendes ChambaYA a un amigo?
                            </label>
                            <p className="text-xs text-gray-400 mb-2">0 = Nada probable · 10 = Muy probable</p>
                            <div className="flex gap-1 justify-between">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                                    <button key={n} type="button" onClick={() => setNps(n)}
                                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition
                                            ${nps === n ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-orange-100'}`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setModalResena(false)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                Ahora no
                            </button>
                            <button onClick={handleResena} disabled={procesando}
                                className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                {procesando ? 'Enviando...' : 'Enviar resena'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* -- Modal: Abrir disputa -- */}
            {modalDisputa && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Abrir disputa</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Nuestro equipo revisará tu caso y se comunicará con ambas partes para resolverlo.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
                            <select value={disputa.motivo}
                                onChange={e => setDisputa(d => ({ ...d, motivo: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                                <option value="trabajo_incompleto">Trabajo no completado</option>
                                <option value="calidad_deficiente">Mala calidad del trabajo</option>
                                <option value="cobro_excesivo">Cobro excesivo o no acordado</option>
                                <option value="no_presento">Técnico no se presentó</option>
                                <option value="daño_propiedad">Daño a la propiedad</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción del problema</label>
                            <textarea value={disputa.descripcion}
                                onChange={e => setDisputa(d => ({ ...d, descripcion: e.target.value }))}
                                rows={3}
                                placeholder="Explica con detalle qué ocurrió..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setModalDisputa(false)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                Cancelar
                            </button>
                            <button onClick={handleAbrirDisputa} disabled={procesando || !disputa.descripcion.trim()}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                                {procesando ? 'Enviando...' : 'Abrir disputa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
