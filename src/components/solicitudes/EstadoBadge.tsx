import { Clock, CheckCircle, Wrench, XCircle, AlertCircle, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { EstadoSolicitud } from '../../types'

interface EstadoCfg {
    color: string
    icon: LucideIcon
    label: string
}

const CFG: Record<string, EstadoCfg> = {
    pendiente:   { color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Clock,        label: 'Pendiente' },
    aceptado:    { color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: CheckCircle,  label: 'Aceptado' },
    en_custodia: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200',icon: Lock,         label: 'Pago en custodia' },
    en_proceso:  { color: 'bg-purple-50 text-purple-700 border-purple-200',   icon: Wrench,       label: 'En proceso' },
    completado:  { color: 'bg-green-50 text-green-700 border-green-200',      icon: CheckCircle,  label: 'Completado' },
    cancelado:   { color: 'bg-red-50 text-red-600 border-red-200',            icon: XCircle,      label: 'Cancelado' },
    en_disputa:  { color: 'bg-orange-50 text-orange-700 border-orange-200',   icon: AlertCircle,  label: 'En disputa' },
}

interface EstadoBadgeProps {
    estado: EstadoSolicitud | string
    size?: 'sm' | 'md'
}

export default function EstadoBadge({ estado, size = 'md' }: EstadoBadgeProps) {
    const { color, icon: Icon, label } = CFG[estado] || CFG.pendiente
    const sz = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'

    return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color} ${sz}`}>
            <Icon size={11} />
            {label}
        </span>
    )
}
