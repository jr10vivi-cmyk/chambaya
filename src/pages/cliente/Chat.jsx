import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversaciones } from '../../hooks/useChat'
import { useAuth } from '../../context/AuthContext'
import ConvItem    from '../../components/chat/ConvItem'
import VentanaChat from '../../components/chat/VentanaChat'
import { MessageCircle, Search, X } from 'lucide-react'

export default function ClienteChat() {
  const { conversacionId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { convs, loading } = useConversaciones()

  const [search, setSearch] = useState('')
  const [convActiva, setConvActiva] = useState(conversacionId || null)

  // Seleccionar automáticamente la primera conversación en desktop
  useEffect(() => {
    if (!convActiva && convs.length > 0 && window.innerWidth >= 1024) {
      setConvActiva(convs[0].id)
    }
  }, [convs, convActiva])

  // Sincronizar con URL
  useEffect(() => {
    if (conversacionId) setConvActiva(conversacionId)
  }, [conversacionId])

  const handleSeleccionar = (id) => {
    setConvActiva(id)
    navigate(`/cliente/chat/${id}`, { replace: true })
  }

  const handleVolver = () => {
    setConvActiva(null)
    navigate('/cliente/chat', { replace: true })
  }

  const filtradas = search
    ? convs.filter(c => {
        const nombre = `${c.tecnicos?.profiles?.nombre || ''} ${c.tecnicos?.profiles?.apellido || ''} ${c.solicitudes?.titulo || ''}`
        return nombre.toLowerCase().includes(search.toLowerCase())
      })
    : convs

  return (
    <div className="flex -m-4 md:-m-8 h-screen" style={{ maxHeight: 'calc(100vh - 0px)' }}>

      {/* ── Panel izquierdo: lista de conversaciones ── */}
      <div className={`flex-shrink-0 bg-white border-r border-gray-100 flex flex-col
        ${convActiva ? 'hidden lg:flex' : 'flex'}
        w-full lg:w-80`}>

        {/* Header del panel */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-3">Mensajes</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <MessageCircle size={36} className="text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">Sin conversaciones</p>
              <p className="text-xs text-gray-400 mt-1">
                {search ? 'Sin resultados' : 'Solicita un servicio para iniciar un chat'}
              </p>
            </div>
          ) : (
            filtradas.map(c => (
              <ConvItem
                key={c.id}
                conv={c}
                activa={convActiva === c.id}
                miRole={profile?.role}
                onClick={() => handleSeleccionar(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Panel derecho: ventana de chat ── */}
      <div className={`flex-1 flex flex-col
        ${!convActiva ? 'hidden lg:flex' : 'flex'}`}>

        {convActiva ? (
          <VentanaChat
            conversacionId={convActiva}
            onVolver={handleVolver}
          />
        ) : (
          /* Estado vacío en desktop */
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center text-4xl mb-5">
              💬
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Tus mensajes</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Selecciona una conversación para ver los mensajes o solicita un servicio para comenzar a chatear.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}