import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Crown, Check, Zap, TrendingUp, Star,
  Shield, ChevronRight, Clock, AlertCircle
} from 'lucide-react'

// Configuracion de planes
const PLANES = [
  {
    key: 'mensual',
    label: 'Mensual',
    precio: 29.90,
    duracion: '30 dias',
    popular: false,
    color: 'border-gray-200 hover:border-orange-300',
    badge: null,
  },
  {
    key: 'trimestral',
    label: 'Trimestral',
    precio: 74.90,
    precioMes: 24.97,
    duracion: '90 dias',
    popular: true,
    color: 'border-orange-400 ring-2 ring-orange-200',
    badge: 'Mas popular',
    ahorro: 'Ahorra 17%',
  },
  {
    key: 'anual',
    label: 'Anual',
    precio: 239.90,
    precioMes: 19.99,
    duracion: '365 dias',
    popular: false,
    color: 'border-amber-400 hover:border-amber-500',
    badge: 'Mejor valor',
    ahorro: 'Ahorra 33%',
  },
]

const BENEFICIOS = [
  { icon: TrendingUp, texto: 'Apareces primero en resultados de busqueda' },
  { icon: Crown,      texto: 'Etiqueta "PREMIUM VERIFICADO" en tu perfil' },
  { icon: Star,       texto: 'Destacado con fondo dorado en el mapa' },
  { icon: Zap,        texto: 'Hasta 3x mas solicitudes de clientes' },
  { icon: Shield,     texto: 'Insignia de confianza en todas tus tarjetas' },
]

const fmt = n =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

export default function TecnicoPlanes() {
  const { profile, tecnico } = useAuth()
  const navigate = useNavigate()
  const [planSeleccionado, setPlan] = useState('trimestral')
  const [comprando, setComprando] = useState(false)
  const [suscripcionActual, setSuscripcionActual] = useState(null)

  // Cargar suscripcion activa si existe
  useEffect(() => {
    if (!tecnico?.id) return
    supabase
      .from('suscripciones')
      .select('*')
      .eq('tecnico_id', tecnico.id)
      .eq('estado', 'activo')
      .order('creado_en', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setSuscripcionActual(data || null))
  }, [tecnico?.id])

  const handleContratar = async () => {
    if (!tecnico?.id) return
    const plan = PLANES.find(p => p.key === planSeleccionado)
    if (!plan) return

    setComprando(true)
    try {
      // Llamar a la funcion SQL que activa el premium
      const { data, error } = await supabase.rpc('activar_premium', {
        p_tecnico_id: tecnico.id,
        p_plan: plan.key,
        p_precio: plan.precio,
      })

      if (error) throw error

      toast.success('Premium activado! Ahora apareces primero en busquedas.')

      // Refrescar la pagina para actualizar el contexto de auth
      setTimeout(() => {
        navigate('/tecnico')
        window.location.reload()
      }, 1500)
    } catch (err) {
      toast.error('Error al activar: ' + err.message)
    } finally {
      setComprando(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-8">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Crown size={15} fill="currentColor" /> ChambaYA Premium
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Consigue mas trabajo con Premium
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Aparece primero en las busquedas, obtiene tu etiqueta verificada y recibe 3 veces mas solicitudes de clientes.
        </p>
      </div>

      {/* Suscripcion activa */}
      {tecnico?.es_premium && suscripcionActual && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white flex items-start gap-4">
          <Crown size={28} fill="white" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-lg">Eres Premium Activo</p>
            <p className="text-white/80 text-sm mt-1">
              Tu plan {suscripcionActual.plan} vence el{' '}
              <strong>{new Date(suscripcionActual.fin).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </p>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-medium">Activo</div>
        </div>
      )}

      {/* Beneficios */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Lo que obtienes con Premium</h2>
        <div className="space-y-3">
          {BENEFICIOS.map(({ icon: Icon, texto }) => (
            <div key={texto} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-amber-600" />
              </div>
              <span className="text-sm text-gray-700">{texto}</span>
              <Check size={14} className="text-green-500 ml-auto flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Planes */}
      <div>
        <h2 className="font-bold text-gray-900 mb-4 text-center">Elige tu plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANES.map(plan => (
            <button
              key={plan.key}
              onClick={() => setPlan(plan.key)}
              className={`relative text-left rounded-2xl border-2 p-5 transition-all cursor-pointer
                ${planSeleccionado === plan.key
                  ? 'border-orange-500 bg-orange-50/50 shadow-md'
                  : plan.color + ' bg-white'}`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                  ${plan.popular ? 'bg-orange-500 text-white' : 'bg-amber-400 text-white'}`}>
                  {plan.badge}
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">{plan.label}</span>
                {planSeleccionado === plan.key && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>

              <p className="text-2xl font-bold text-gray-900">{fmt(plan.precio)}</p>
              {plan.precioMes && (
                <p className="text-xs text-gray-400">{fmt(plan.precioMes)}/mes</p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <Clock size={11} className="text-gray-400" />
                <span className="text-xs text-gray-400">{plan.duracion}</span>
              </div>
              {plan.ahorro && (
                <span className="mt-2 inline-block text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                  {plan.ahorro}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen del plan seleccionado */}
      {(() => {
        const plan = PLANES.find(p => p.key === planSeleccionado)
        if (!plan) return null
        return (
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">Resumen de tu pedido</h3>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Plan {plan.label}</span>
              <span className="font-semibold text-gray-900">{fmt(plan.precio)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Duracion</span>
              <span className="text-gray-700">{plan.duracion}</span>
            </div>
            {plan.ahorro && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Descuento</span>
                <span>{plan.ahorro}</span>
              </div>
            )}
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{fmt(plan.precio)}</span>
            </div>
          </div>
        )
      })()}

      {/* Aviso de pago */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Pago simulado:</strong> ChambaYA actualmente registra la suscripcion directamente.
          En produccion, este flujo se integra con una pasarela de pago (MercadoPago/Stripe).
          El cobro se realizara de forma automatica.
        </p>
      </div>

      {/* Boton CTA */}
      <button
        onClick={handleContratar}
        disabled={comprando}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3 text-base shadow-lg shadow-orange-200"
      >
        {comprando ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Activando Premium...
          </>
        ) : (
          <>
            <Crown size={20} fill="white" />
            Activar Premium — {fmt(PLANES.find(p => p.key === planSeleccionado)?.precio || 0)}
            <ChevronRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Puedes cancelar tu suscripcion en cualquier momento desde el panel de administracion.
      </p>
    </div>
  )
}
