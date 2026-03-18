import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Star, MapPin, Clock, Crown, ChevronLeft, MessageCircle,
  ClipboardList, Zap, Shield, Calendar, Phone
} from 'lucide-react'

export default function ClienteTecnicoPerfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [tecnico, setTecnico] = useState(null)
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [solicitando, setSolic] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [solicitud, setSolicitud] = useState({
    titulo: '', descripcion: '', direccion: '', presupuesto: ''
  })

  useEffect(() => {
    const fetch = async () => {
      const [{ data: t }, { data: r }] = await Promise.all([
        supabase
          .from('tecnicos')
          .select(`
            *,
            profiles(nombre, apellido, avatar_url, ciudad, departamento),
            tecnico_categorias(categoria_id, categorias(nombre, icono))
          `)
          .eq('id', id)
          .eq('estado_verificacion', 'aprobado')
          .single(),
        supabase
          .from('resenas')
          .select('*, profiles!cliente_id(nombre, apellido)')
          .eq('tecnico_id', id)
          .order('creado_en', { ascending: false })
          .limit(10)
      ])
      setTecnico(t)
      setResenas(r || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleSolicitar = async (e) => {
    e.preventDefault()
    setSolic(true)
    try {
      // 1. Crear la solicitud
      const { data: nuevaSol, error: solErr } = await supabase
        .from('solicitudes')
        .insert({
          cliente_id: profile.id,
          tecnico_id: id,
          titulo: solicitud.titulo,
          descripcion: solicitud.descripcion,
          direccion: solicitud.direccion,
          presupuesto_cliente: solicitud.presupuesto || null,
          estado: 'pendiente',
        })
        .select()
        .single()

      if (solErr) throw solErr

      // 2. Crear conversación de chat automáticamente
      const { error: convErr } = await supabase
        .from('conversaciones')
        .insert({
          solicitud_id: nuevaSol.id,
          cliente_id: profile.id,
          tecnico_id: id,
        })

      // 3. Notificar al técnico
      await supabase.from('notificaciones').insert({
        usuario_id: id,
        tipo: 'nueva_solicitud',
        titulo: '¡Nueva solicitud de servicio!',
        mensaje: `${profile.nombre} necesita: ${solicitud.titulo}`,
        datos: { solicitud_id: nuevaSol.id },
      })

      toast.success('✅ Solicitud enviada al técnico')
      setShowModal(false)
      navigate('/cliente/solicitudes')
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setSolic(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!tecnico) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-lg font-medium">Técnico no encontrado</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-orange-500 hover:underline text-sm">
        ← Volver a la búsqueda
      </button>
    </div>
  )

  const nombre = `${tecnico.profiles?.nombre} ${tecnico.profiles?.apellido}`.trim()

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Botón volver */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
        <ChevronLeft size={16} /> Volver a la búsqueda
      </button>

      {/* Hero card */}
      <div className={`bg-white rounded-2xl overflow-hidden border
        ${tecnico.es_premium ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100'}`}>

        {tecnico.es_premium && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-2 flex items-center gap-2">
            <Crown size={14} className="text-white" fill="white" />
            <span className="text-sm font-semibold text-white">TÉCNICO PREMIUM VERIFICADO</span>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar grande */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold flex-shrink-0
              ${tecnico.es_premium ? 'bg-amber-100 text-amber-700' : 'bg-orange-100 text-orange-600'}`}>
              {tecnico.profiles?.avatar_url
                ? <img src={tecnico.profiles.avatar_url} alt={nombre} className="w-full h-full object-cover rounded-2xl" />
                : nombre[0]?.toUpperCase()
              }
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{nombre}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={13} className="text-gray-300" />
                    <span className="text-sm text-gray-500">
                      {tecnico.profiles?.ciudad || 'Ubicación no disponible'}
                    </span>
                    <Shield size={13} className="text-green-500 ml-1" />
                    <span className="text-xs text-green-600 font-medium">Verificado</span>
                  </div>
                </div>

                {tecnico.tarifa_hora && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">S/{tecnico.tarifa_hora}</p>
                    <p className="text-xs text-gray-400">/hora</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={15}
                        className={n <= Math.round(tecnico.calificacion_promedio || 0)
                          ? 'text-amber-400' : 'text-gray-200'}
                        fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {tecnico.calificacion_promedio?.toFixed(1) || 'Nuevo'}
                  </span>
                  <span className="text-sm text-gray-400">({tecnico.total_resenas || 0})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Zap size={14} className="text-green-500" />
                  <span className="font-semibold text-gray-700">{tecnico.total_trabajos || 0}</span>
                  <span>trabajos</span>
                </div>
                {tecnico.experiencia_anos > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} className="text-blue-400" />
                    <span className="font-semibold text-gray-700">{tecnico.experiencia_anos}</span>
                    <span>año{tecnico.experiencia_anos > 1 ? 's' : ''} exp.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          {tecnico.descripcion && (
            <p className="mt-5 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">
              {tecnico.descripcion}
            </p>
          )}

          {/* Categorías */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Servicios que ofrece</p>
            <div className="flex flex-wrap gap-2">
              {tecnico.tecnico_categorias?.map(tc => (
                <span key={tc.categoria_id}
                  className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl text-sm font-medium">
                  {tc.categorias?.nombre}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition min-w-[160px]">
              <ClipboardList size={18} />
              Solicitar servicio
            </button>
            <button
              onClick={() => navigate(`/cliente/chat`)}
              className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-5 rounded-xl transition">
              <MessageCircle size={18} />
              Chatear
            </button>
          </div>

          {/* Aviso privacidad */}
          <p className="mt-3 text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <Shield size={11} />
            El teléfono del técnico está protegido. Comunícate solo por el chat.
          </p>
        </div>
      </div>

      {/* Reseñas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Star size={18} className="text-amber-400" fill="currentColor" />
          Reseñas de clientes
          <span className="text-sm font-normal text-gray-400">({resenas.length})</span>
        </h2>

        {resenas.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Aún no tiene reseñas</p>
        ) : (
          <div className="space-y-4">
            {resenas.map(r => (
              <div key={r.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {r.profiles?.nombre?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {r.profiles?.nombre} {r.profiles?.apellido}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} size={12}
                        className={n <= r.calificacion ? 'text-amber-400' : 'text-gray-200'}
                        fill="currentColor" />
                    ))}
                  </div>
                </div>
                {r.comentario && (
                  <p className="text-sm text-gray-600 leading-relaxed ml-10">{r.comentario}</p>
                )}
                {r.respuesta_tecnico && (
                  <div className="ml-10 mt-2 bg-orange-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-orange-700 mb-1">Respuesta del técnico:</p>
                    <p className="text-xs text-orange-800">{r.respuesta_tecnico}</p>
                  </div>
                )}
                <p className="text-xs text-gray-300 mt-2 ml-10">
                  {new Date(r.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de solicitud */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Solicitar servicio a {tecnico.profiles?.nombre}</h3>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSolicitar} className="p-5 space-y-4">
              {[
                { key: 'titulo', label: '¿Qué necesitas?', placeholder: 'Ej: Reparar enchufe de cocina', required: true },
                { key: 'descripcion', label: 'Descripción del problema', placeholder: 'Describe el problema con detalle...', required: true, textarea: true },
                { key: 'direccion', label: 'Dirección del servicio', placeholder: 'Tu dirección exacta', required: true },
                { key: 'presupuesto', label: 'Presupuesto estimado (S/)', placeholder: 'Opcional', type: 'number' },
              ].map(({ key, label, placeholder, required, textarea, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  {textarea ? (
                    <textarea required={required} rows={3}
                      value={solicitud[key]}
                      onChange={e => setSolicitud(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none" />
                  ) : (
                    <input required={required} type={type || 'text'}
                      value={solicitud[key]}
                      onChange={e => setSolicitud(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                  )}
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-xs text-amber-700 flex items-start gap-1.5">
                  <Shield size={13} className="mt-0.5 flex-shrink-0" />
                  El pago se realiza dentro de la plataforma. El técnico recibirá el 90% al completar el trabajo.
                </p>
              </div>

              <button type="submit" disabled={solicitando}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                {solicitando
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando...</>
                  : '📤 Enviar solicitud'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}