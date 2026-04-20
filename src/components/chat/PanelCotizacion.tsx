import { useEffect, useState } from 'react'
import { DollarSign, CheckCircle, X, RefreshCw, Wrench, AlertCircle } from 'lucide-react'
import { useCotizaciones } from '../../hooks/useCotizaciones'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

interface PanelCotizacionProps {
  solicitudId: string
  clienteId: string
  estadoSolicitud: string
  precioAcordado: number | null
}

const fmt = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  propuesta:    { label: 'Propuesta enviada', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  aceptada:     { label: 'Aceptada',          color: 'text-green-600 bg-green-50 border-green-200' },
  rechazada:    { label: 'Rechazada',          color: 'text-red-600 bg-red-50 border-red-200' },
  contraoferta: { label: 'Contraoferta',       color: 'text-orange-600 bg-orange-50 border-orange-200' },
}

export default function PanelCotizacion({
  solicitudId, clienteId, estadoSolicitud, precioAcordado
}: PanelCotizacionProps) {
  const { profile } = useAuth()
  const {
    cotizaciones, loading, fetchCotizaciones,
    enviarCotizacion, aceptarCotizacion, rechazarCotizacion, contraproponer,
  } = useCotizaciones(solicitudId)

  const esTecnico = profile?.role === 'tecnico'
  const esCliente = profile?.role === 'cliente'

  const [form, setForm] = useState({ monto: '', descripcion: '', incluye_visita: false, costo_visita: '15' })
  const [modalContra, setModalContra] = useState<string | null>(null)
  const [contraForm, setContraForm] = useState({ monto: '', nota: '' })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => { fetchCotizaciones() }, [fetchCotizaciones])

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.monto || isNaN(Number(form.monto))) { toast.error('Ingresa el monto'); return }
    setEnviando(true)
    const result = await enviarCotizacion({
      monto: Number(form.monto),
      descripcion: form.descripcion,
      incluye_visita: form.incluye_visita,
      costo_visita: form.incluye_visita ? Number(form.costo_visita) : 0,
      cliente_id: clienteId,
    })
    setEnviando(false)
    if (result?.ok) {
      toast.success('Cotización enviada al cliente')
      setForm({ monto: '', descripcion: '', incluye_visita: false, costo_visita: '15' })
    } else {
      toast.error(result?.error || 'Error al enviar')
    }
  }

  const handleAceptar = async (id: string) => {
    const r = await aceptarCotizacion(id)
    r?.ok ? toast.success('Cotización aceptada. Ahora realiza el depósito Yape/Plin.') : toast.error(r?.error || 'Error')
  }

  const handleRechazar = async (id: string) => {
    const r = await rechazarCotizacion(id)
    r?.ok ? toast.success('Cotización rechazada') : toast.error(r?.error || 'Error')
  }

  const handleContra = async () => {
    if (!modalContra || !contraForm.monto) return
    const r = await contraproponer(modalContra, Number(contraForm.monto), contraForm.nota)
    if (r?.ok) {
      toast.success('Contraoferta enviada')
      setModalContra(null)
      setContraForm({ monto: '', nota: '' })
    } else {
      toast.error(r?.error || 'Error')
    }
  }

  const puedeEnviar = esTecnico && ['aceptado', 'en_custodia', 'pendiente'].includes(estadoSolicitud)

  if (loading) return null

  return (
    <div className="border-t border-gray-100 bg-gray-50 rounded-b-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <DollarSign size={15} className="text-orange-500" />
        Cotizaciones
        {precioAcordado && (
          <span className="ml-auto text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg">
            Acordado: {fmt(precioAcordado)}
          </span>
        )}
      </div>

      {/* Lista de cotizaciones */}
      {cotizaciones.length > 0 && (
        <div className="space-y-3">
          {cotizaciones.map(c => {
            const cfg = ESTADO_LABELS[c.estado]
            return (
              <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{fmt(c.monto)}</p>
                    {c.incluye_visita && c.costo_visita > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        + {fmt(c.costo_visita)} visita de diagnóstico
                      </p>
                    )}
                    {c.descripcion && (
                      <p className="text-xs text-gray-500 mt-1">{c.descripcion}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                {c.estado === 'contraoferta' && c.monto_contraoferta && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                    <span className="font-semibold">Contraoferta del cliente: </span>
                    {fmt(c.monto_contraoferta)}
                    {c.nota_contraoferta && ` — ${c.nota_contraoferta}`}
                  </div>
                )}

                {/* Acciones del cliente */}
                {esCliente && c.estado === 'propuesta' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAceptar(c.id)}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                      <CheckCircle size={12} /> Aceptar
                    </button>
                    <button onClick={() => { setModalContra(c.id); setContraForm({ monto: String(c.monto), nota: '' }) }}
                      className="flex items-center gap-1 border border-orange-300 text-orange-600 hover:bg-orange-50 text-xs font-medium px-3 py-1.5 rounded-lg transition">
                      <RefreshCw size={12} /> Contraofertar
                    </button>
                    <button onClick={() => handleRechazar(c.id)}
                      className="flex items-center gap-1 border border-red-200 text-red-500 hover:bg-red-50 text-xs px-3 py-1.5 rounded-lg transition">
                      <X size={12} /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {cotizaciones.length === 0 && esCliente && (
        <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
          <AlertCircle size={13} /> El técnico aún no ha enviado una cotización.
        </div>
      )}

      {/* Formulario técnico */}
      {puedeEnviar && (
        <form onSubmit={handleEnviar} className="space-y-3 pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600">Enviar cotización al cliente</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min="1" step="0.50"
              value={form.monto}
              onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
              placeholder="Monto (S/)"
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <input type="text"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción (opcional)"
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.incluye_visita}
              onChange={e => setForm(f => ({ ...f, incluye_visita: e.target.checked }))}
              className="rounded" />
            <Wrench size={12} className="text-orange-500" />
            Incluir visita de diagnóstico
            {form.incluye_visita && (
              <span className="flex items-center gap-1">
                S/.
                <input type="number" min="10" max="30" step="1"
                  value={form.costo_visita}
                  onChange={e => setForm(f => ({ ...f, costo_visita: e.target.value }))}
                  className="w-14 px-2 py-0.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </span>
            )}
          </label>
          <button type="submit" disabled={enviando || !form.monto}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white text-xs font-semibold py-2 rounded-xl transition">
            {enviando ? 'Enviando...' : 'Enviar cotización'}
          </button>
        </form>
      )}

      {/* Modal contraoferta */}
      {modalContra && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 mb-4">Hacer contraoferta</h3>
            <div className="space-y-3 mb-5">
              <input type="number" min="1" step="0.50"
                value={contraForm.monto}
                onChange={e => setContraForm(f => ({ ...f, monto: e.target.value }))}
                placeholder="Tu precio (S/)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <textarea rows={2}
                value={contraForm.nota}
                onChange={e => setContraForm(f => ({ ...f, nota: e.target.value }))}
                placeholder="Nota para el técnico (opcional)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalContra(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleContra} disabled={!contraForm.monto}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                Enviar contraoferta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
