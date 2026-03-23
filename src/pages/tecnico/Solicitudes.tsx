import { useEffect, useState } from 'react'
import { useSolicitudes } from '../../hooks/useSolicitudes'
import TarjetaSolicitud from '../../components/solicitudes/TarjetaSolicitud'
import { Filter, RefreshCw, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'pendiente',  label: 'Pendientes',  color: 'text-amber-600'  },
  { key: 'aceptado',   label: 'Aceptadas',   color: 'text-blue-600'   },
  { key: 'en_proceso', label: 'En proceso',  color: 'text-purple-600' },
  { key: null,         label: 'Todas',       color: 'text-gray-600'   },
]

export default function TecnicoSolicitudes() {
  const [tabActiva, setTabActiva] = useState('pendiente')
  const {
    solicitudes, loading,
    fetchSolicitudes, cambiarEstado
  } = useSolicitudes(tabActiva)

  useEffect(() => { fetchSolicitudes() }, [tabActiva])

  const handleCambiarEstado = async (id, estado, extras) => {
    const result = await cambiarEstado(id, estado, extras)
    if (result?.ok) {
      toast.success({
        aceptado:    '✅ Solicitud aceptada',
        en_proceso:  '🔧 Trabajo iniciado',
        completado:  '🎉 Marcado como completado',
        cancelado:   'Solicitud rechazada',
      }[estado] || 'Actualizado')
      fetchSolicitudes()
    } else {
      toast.error(result?.error || 'Error al actualizar')
    }
    return result
  }

  const conteos = TABS.reduce((acc, t) => {
    acc[t.key] = solicitudes.filter(s =>
      t.key ? s.estado === t.key : true
    ).length
    return acc
  }, {})

  return (
    <div className="max-w-3xl space-y-5">

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los trabajos que te solicitan los clientes
          </p>
        </div>
        <button onClick={fetchSolicitudes}
          className="flex items-center gap-2 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition text-gray-600">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {TABS.map(tab => {
          const activa = tabActiva === tab.key
          return (
            <button
              key={String(tab.key)}
              onClick={() => setTabActiva(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition
                ${activa ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
              {conteos[tab.key] > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                  ${activa ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                  {conteos[tab.key]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-center bg-white rounded-2xl border border-gray-100">
          <ClipboardList size={40} className="text-gray-200 mb-3" />
          <p className="font-medium text-gray-500">Sin solicitudes {tabActiva || ''}</p>
          <p className="text-sm text-gray-400 mt-1">
            {tabActiva === 'pendiente'
              ? 'Cuando un cliente te solicite, aparecerá aquí'
              : 'Cambia el filtro para ver otras solicitudes'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map(s => (
            <TarjetaSolicitud
              key={s.id}
              solicitud={s}
              miRole="tecnico"
              onCambiarEstado={handleCambiarEstado}
              onConfirmar={() => {}}
              onCalificar={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}