import { useEffect } from 'react'
import { useSolicitudes } from '../../hooks/useSolicitudes'
import TarjetaSolicitud from '../../components/solicitudes/TarjetaSolicitud'
import toast from 'react-hot-toast'
import { Briefcase } from 'lucide-react'

export default function TecnicoTrabajos() {
  const {
    solicitudes, loading,
    fetchSolicitudes, cambiarEstado
  } = useSolicitudes('en_proceso')

  // Incluir también completados recientes
  const { solicitudes: completados, fetchSolicitudes: fetchComp } = useSolicitudes('completado')

  useEffect(() => {
    fetchSolicitudes()
    fetchComp()
  }, [])

  const handleCambiar = async (id, estado, extras) => {
    const result = await cambiarEstado(id, estado, extras)
    if (result?.ok) {
      toast.success({ completado: '🎉 ¡Trabajo completado! Esperando confirmación del cliente.' }[estado] || 'Actualizado')
      fetchSolicitudes()
      fetchComp()
    } else {
      toast.error(result?.error || 'Error')
    }
    return result
  }

  const todos = [...solicitudes, ...completados.slice(0, 5)]

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis trabajos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Trabajos activos y completados recientemente
        </p>
      </div>

      {solicitudes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
            🔧 En proceso ({solicitudes.length})
          </p>
          <div className="space-y-4">
            {solicitudes.map(s => (
              <TarjetaSolicitud key={s.id} solicitud={s} miRole="tecnico"
                onCambiarEstado={handleCambiar} onConfirmar={() => {}} onCalificar={() => {}} />
            ))}
          </div>
        </div>
      )}

      {completados.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3 mt-6">
            ✅ Completados recientemente
          </p>
          <div className="space-y-4">
            {completados.slice(0, 5).map(s => (
              <TarjetaSolicitud key={s.id} solicitud={s} miRole="tecnico"
                onCambiarEstado={handleCambiar} onConfirmar={() => {}} onCalificar={() => {}} />
            ))}
          </div>
        </div>
      )}

      {todos.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-56 text-center bg-white rounded-2xl border border-gray-100">
          <Briefcase size={40} className="text-gray-200 mb-3" />
          <p className="font-medium text-gray-500">Sin trabajos activos</p>
          <p className="text-sm text-gray-400 mt-1">
            Acepta solicitudes para ver tus trabajos aquí
          </p>
        </div>
      )}
    </div>
  )
}