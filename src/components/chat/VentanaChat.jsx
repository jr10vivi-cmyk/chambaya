import { useEffect, useRef } from 'react'
import { useChat } from '../../hooks/useChat'
import { useAuth } from '../../context/AuthContext'
import BurbujaMensaje from './BurbujaMensaje'
import InputMensaje from './InputMensaje'
import {
    Phone, MoreVertical, ArrowLeft,
    CheckCircle, Clock, Wrench, DollarSign, Shield
} from 'lucide-react'

const ESTADO_CFG = {
    pendiente: { color: 'bg-amber-100 text-amber-700', label: 'Pendiente', icon: Clock },
    aceptado: { color: 'bg-blue-100 text-blue-700', label: 'Aceptado', icon: CheckCircle },
    en_proceso: { color: 'bg-purple-100 text-purple-700', label: 'En proceso', icon: Wrench },
    completado: { color: 'bg-green-100 text-green-700', label: 'Completado', icon: CheckCircle },
    cancelado: { color: 'bg-gray-100 text-gray-600', label: 'Cancelado', icon: MoreVertical },
}

export default function VentanaChat({ conversacionId, onVolver }) {
    const { profile } = useAuth()
    const { conv, mensajes, loading, enviando, bloqueado, enviar } = useChat(conversacionId)
    const bottomRef = useRef()

    // Auto-scroll al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [mensajes])

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Cargando mensajes...</p>
            </div>
        </div>
    )

    if (!conv) return (
        <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="font-medium">Conversación no encontrada</p>
            </div>
        </div>
    )

    // Determinar nombre y rol del otro participante
    const esCliente = profile?.role === 'cliente'
    const otroNombre = esCliente
        ? `${conv.tecnicos?.profiles?.nombre || ''} ${conv.tecnicos?.profiles?.apellido || ''}`.trim()
        : `${conv.profiles?.nombre || ''} ${conv.profiles?.apellido || ''}`.trim()
    const otroInicial = otroNombre?.[0]?.toUpperCase() || '?'

    const solicitud = conv.solicitudes
    const estadoCfg = ESTADO_CFG[solicitud?.estado] || ESTADO_CFG.pendiente
    const EstadoIcon = estadoCfg.icon

    // Agrupar mensajes por fecha
    const gruposPorFecha = mensajes.reduce((acc, msg) => {
        const fecha = new Date(msg.creado_en).toLocaleDateString('es-PE', {
            day: 'numeric', month: 'long'
        })
        if (!acc[fecha]) acc[fecha] = []
        acc[fecha].push(msg)
        return acc
    }, {})

    return (
        <div className="flex flex-col h-full">

            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                {/* Botón volver (móvil) */}
                {onVolver && (
                    <button onClick={onVolver} className="p-1.5 hover:bg-gray-100 rounded-xl transition lg:hidden">
                        <ArrowLeft size={18} className="text-gray-500" />
                    </button>
                )}

                {/* Avatar del otro */}
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-base flex-shrink-0">
                    {otroInicial}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{otroNombre}</p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-xs text-gray-400">En línea</span>
                    </div>
                </div>

                {/* Info de la solicitud */}
                {solicitud && (
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${estadoCfg.color}`}>
                        <EstadoIcon size={12} />
                        {estadoCfg.label}
                    </div>
                )}
            </div>

            {/* ── Info de solicitud (banner) ── */}
            {solicitud && (
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-3">
                    <Wrench size={14} className="text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">
                            {solicitud.titulo}
                        </p>
                        {solicitud.precio_acordado && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <DollarSign size={10} />
                                Acordado: S/{solicitud.precio_acordado}
                            </p>
                        )}
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${estadoCfg.color} sm:hidden`}>
                        {estadoCfg.label}
                    </div>
                </div>
            )}

            {/* ── Área de mensajes ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">

                {/* Sin mensajes */}
                {mensajes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mb-4">
                            👋
                        </div>
                        <p className="font-semibold text-gray-700 mb-1">¡Inicia la conversación!</p>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Cuéntale al {esCliente ? 'técnico' : 'cliente'} los detalles del trabajo que necesitas.
                        </p>
                        <div className="mt-4 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-gray-500">
                            <Shield size={12} className="text-green-500" />
                            Chat protegido — No compartas datos de contacto
                        </div>
                    </div>
                )}

                {/* Mensajes agrupados por fecha */}
                {Object.entries(gruposPorFecha).map(([fecha, msgs]) => (
                    <div key={fecha}>
                        {/* Separador de fecha */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium px-2 bg-gray-50">{fecha}</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {msgs.map((msg, i) => {
                            const esMio = msg.emisor_id === profile?.id
                            // Agrupar burbujas consecutivas del mismo emisor
                            const anterior = msgs[i - 1]
                            const mismoEmisor = anterior?.emisor_id === msg.emisor_id
                            return (
                                <div key={msg.id} className={mismoEmisor ? 'mt-0.5' : 'mt-3'}>
                                    <BurbujaMensaje mensaje={msg} esMio={esMio} />
                                </div>
                            )
                        })}
                    </div>
                ))}

                {/* Indicador "escribiendo" placeholder */}
                <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <InputMensaje
                onEnviar={enviar}
                enviando={enviando}
                bloqueado={bloqueado}
                disabled={solicitud?.estado === 'cancelado' || solicitud?.estado === 'completado'}
            />
        </div>
    )
}