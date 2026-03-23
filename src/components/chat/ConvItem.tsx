import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { UserRole, Profile } from '../../types'

interface ConvData {
    id: string
    ultimo_mensaje?: string | null
    ultimo_mensaje_en?: string | null
    solicitudes?: { titulo?: string; estado?: string } | null
    profiles?: Pick<Profile, 'nombre' | 'apellido'> | null
    tecnicos?: { profiles?: Pick<Profile, 'nombre' | 'apellido'> | null } | null
}

interface ConvItemProps {
    conv: ConvData
    activa: boolean
    onClick: () => void
    miRole: UserRole
}

export default function ConvItem({ conv, activa, onClick, miRole }: ConvItemProps) {
    // Determinar nombre del otro participante
    const otroNombre = miRole === 'cliente'
        ? `${conv.tecnicos?.profiles?.nombre || ''} ${conv.tecnicos?.profiles?.nombre ? conv.tecnicos.profiles.apellido || '' : ''}`.trim()
        : `${conv.profiles?.nombre || ''} ${conv.profiles?.apellido || ''}`.trim()

    const otroInicial = otroNombre?.[0]?.toUpperCase() || '?'

    const tiempo = conv.ultimo_mensaje_en
        ? formatDistanceToNow(new Date(conv.ultimo_mensaje_en), { addSuffix: true, locale: es })
        : null

    const estadoColor: Record<string, string> = {
        pendiente: 'bg-amber-400',
        aceptado: 'bg-blue-400',
        en_proceso: 'bg-purple-400',
        completado: 'bg-green-400',
        cancelado: 'bg-gray-300',
    }

    const colorClass = estadoColor[conv.solicitudes?.estado || ''] || 'bg-gray-300'

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition
        ${activa
                    ? 'bg-orange-50 border-r-2 border-orange-500'
                    : 'hover:bg-gray-50 border-r-2 border-transparent'
                }`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-700 font-bold text-base">
                    {otroInicial}
                </div>
                {/* Indicador de estado de solicitud */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${colorClass} rounded-full border-2 border-white`} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-semibold truncate
            ${activa ? 'text-orange-700' : 'text-gray-800'}`}>
                        {otroNombre || 'Usuario'}
                    </p>
                    {tiempo && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{tiempo}</span>
                    )}
                </div>
                <p className="text-xs text-gray-400 truncate">
                    {conv.solicitudes?.titulo || 'Servicio'}
                </p>
                {conv.ultimo_mensaje && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.ultimo_mensaje}
                    </p>
                )}
            </div>
        </button>
    )
}
