import { Clock, CheckCircle, Wrench, XCircle, AlertCircle, Star } from 'lucide-react'

const CFG = {
    pendiente: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pendiente' },
    aceptado: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Aceptado' },
    en_proceso: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Wrench, label: 'En proceso' },
    completado: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Completado' },
    cancelado: { color: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, label: 'Cancelado' },
    en_disputa: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle, label: 'En disputa' },
}

export default function EstadoBadge({ estado, size = 'md' }) {
    const { color, icon: Icon, label } = CFG[estado] || CFG.pendiente
    const sz = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'

    return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color} ${sz}`}>
            <Icon size={11} />
            {label}
        </span>
    )
}