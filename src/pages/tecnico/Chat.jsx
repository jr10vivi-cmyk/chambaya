import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversaciones } from '../../hooks/useChat'
import { useAuth } from '../../context/AuthContext'
import ConvItem from '../../components/chat/ConvItem'
import VentanaChat from '../../components/chat/VentanaChat'
import { MessageCircle, Search, X } from 'lucide-react'


export default function TecnicoChat() {
  const { conversacionId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { convs, loading } = useConversaciones()

  const [search, setSearch] = useState('')
  const [convActiva, setConvActiva] = useState(conversacionId || null)

  useEffect(() => {
    if (!convActiva && convs.length > 0 && window.innerWidth >= 1024)
      setConvActiva(convs[0].id)
  }, [convs, convActiva])

  useEffect(() => { if (conversacionId) setConvActiva(conversacionId) }, [conversacionId])

  const handleSeleccionar = (id) => {
    setConvActiva(id)
    navigate(`/tecnico/chat/${id}`, { replace: true })
  }

  const filtradas = search
    ? convs.filter(c => {
      const n = `${c.profiles?.nombre || ''} ${c.profiles?.apellido || ''} ${c.solicitudes?.titulo || ''}`
      return n.toLowerCase().includes(search.toLowerCase())
    })
    : convs

  return (
    <div className="flex -m-4 md:-m-8" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Lista */}
      <div className={`flex-shrink-0 bg-white border-r border-gray-100 flex flex-col
        ${convActiva ? 'hidden lg:flex' : 'flex'} w-full lg:w-80`}>
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg mb-3">Mensajes</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <MessageCircle size={36} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">Sin conversaciones aún</p>
            </div>
          ) : filtradas.map(c => (
            <ConvItem key={c.id} conv={c} activa={convActiva === c.id}
              miRole={profile?.role} onClick={() => handleSeleccionar(c.id)} />
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className={`flex-1 flex flex-col ${!convActiva ? 'hidden lg:flex' : 'flex'}`}>
        {convActiva ? (
          <VentanaChat conversacionId={convActiva} onVolver={() => { setConvActiva(null); navigate('/tecnico/chat') }} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center text-4xl mb-5">💬</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Bandeja de mensajes</h3>
            <p className="text-sm text-gray-400 max-w-xs">Selecciona una conversación para responder a tus clientes.</p>
          </div>
        )}
      </div>
    </div>
  )
}