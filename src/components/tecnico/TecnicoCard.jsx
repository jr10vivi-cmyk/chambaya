import { Star, MapPin, Clock, Crown, ChevronRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TecnicoCard({ tecnico, destacado = false }) {
    const { id, profiles, descripcion, tarifa_hora, calificacion_promedio,
        total_trabajos, total_resenas, es_premium, distancia,
        tecnico_categorias } = tecnico

    const nombre = `${profiles?.nombre || ''} ${profiles?.apellido || ''}`.trim()
    const inicial = nombre[0]?.toUpperCase()

    return (
        <Link
            to={`/cliente/tecnico/${id}`}
            className={`block bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden
        ${destacado
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
        >
            {/* Banner premium */}
            {es_premium && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 flex items-center gap-1.5">
                    <Crown size={12} className="text-white" fill="white" />
                    <span className="text-xs font-semibold text-white tracking-wide">TÉCNICO PREMIUM</span>
                </div>
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-3">
                    {/* Avatar */}
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0
            ${es_premium ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-600'}`}>
                        {profiles?.avatar_url
                            ? <img src={profiles.avatar_url} alt={nombre} className="w-full h-full object-cover rounded-2xl" />
                            : inicial
                        }
                        {/* Indicador disponible */}
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm">{nombre}</h3>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-gray-300 flex-shrink-0" />
                            <span className="text-xs text-gray-400 truncate">
                                {profiles?.ciudad || 'Ubicación no definida'}
                                {distancia != null && ` · ${distancia.toFixed(1)} km`}
                            </span>
                        </div>
                        {/* Calificación */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Star key={n} size={12}
                                        className={n <= Math.round(calificacion_promedio || 0)
                                            ? 'text-amber-400' : 'text-gray-200'}
                                        fill="currentColor" />
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                                {calificacion_promedio?.toFixed(1) || 'Nuevo'}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({total_resenas || 0} reseñas)
                            </span>
                        </div>
                    </div>

                    {/* Tarifa */}
                    <div className="text-right flex-shrink-0">
                        {tarifa_hora ? (
                            <>
                                <p className="text-lg font-bold text-gray-900">S/{tarifa_hora}</p>
                                <p className="text-xs text-gray-400">/hora</p>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400">Tarifa<br />a convenir</p>
                        )}
                    </div>
                </div>

                {/* Descripción */}
                {descripcion && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {descripcion}
                    </p>
                )}

                {/* Categorías */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {tecnico_categorias?.slice(0, 3).map(tc => (
                        <span key={tc.categoria_id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            {tc.categorias?.nombre}
                        </span>
                    ))}
                    {tecnico_categorias?.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-lg text-xs">
                            +{tecnico_categorias.length - 3} más
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Zap size={11} className="text-green-500" />
                        <span className="text-green-600 font-medium">{total_trabajos || 0}</span>
                        <span>trabajos realizados</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                        Ver perfil <ChevronRight size={14} />
                    </div>
                </div>
            </div>
        </Link>
    )
}