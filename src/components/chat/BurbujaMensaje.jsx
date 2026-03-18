import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShieldAlert, Check, CheckCheck } from 'lucide-react'

export default function BurbujaMensaje({ mensaje, esMio }) {
    const hora = format(new Date(mensaje.creado_en), 'HH:mm', { locale: es })
    const bloqueado = mensaje.bloqueado

    if (bloqueado) {
        return (
            <div className="flex justify-center my-2">
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-2xl text-xs max-w-sm">
                    <ShieldAlert size={14} className="flex-shrink-0" />
                    <span>
                        <span className="font-semibold">Mensaje bloqueado:</span> ChambaYA no permite compartir datos de contacto para proteger tu seguridad.
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex ${esMio ? 'justify-end' : 'justify-start'} mb-1.5`}>
            {/* Avatar (solo mensajes del otro) */}
            {!esMio && (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs mr-2 flex-shrink-0 self-end mb-1">
                    {mensaje.profiles?.nombre?.[0]?.toUpperCase()}
                </div>
            )}

            <div className={`max-w-[72%] ${esMio ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${esMio
                        ? 'bg-orange-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                    }`}
                >
                    {mensaje.contenido}
                </div>

                {/* Hora + estado de lectura */}
                <div className={`flex items-center gap-1 mt-0.5 ${esMio ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs text-gray-400">{hora}</span>
                    {esMio && (
                        mensaje.leido
                            ? <CheckCheck size={12} className="text-blue-400" />
                            : <Check size={12} className="text-gray-400" />
                    )}
                </div>
            </div>
        </div>
    )
}