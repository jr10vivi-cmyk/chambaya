import { useState, useRef } from 'react'
import { Send, ShieldAlert } from 'lucide-react'

interface InputMensajeProps {
  onEnviar: (texto: string) => Promise<boolean | void>
  enviando: boolean
  bloqueado: boolean
  disabled: boolean
}

export default function InputMensaje({ onEnviar, enviando, bloqueado, disabled }: InputMensajeProps) {
  const [texto, setTexto]   = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleEnviar = async () => {
    if (!texto.trim() || enviando || disabled) return
    const ok = await onEnviar(texto)
    if (ok !== false) setTexto('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">

      {/* Aviso anti-fuga */}
      {bloqueado && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl mb-3 text-xs animate-pulse">
          <ShieldAlert size={15} className="flex-shrink-0" />
          <span>
            <span className="font-bold">Bloqueado:</span> No se permite compartir telefonos, redes sociales ni datos de contacto. Usa solo el chat de ChambaYA.
          </span>
        </div>
      )}

      {/* Aviso privacidad siempre visible */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
        <ShieldAlert size={11} />
        <span>Chat protegido · No compartas datos personales</span>
      </div>

      <div className="flex items-end gap-2">
        <div className={`flex-1 bg-gray-50 border rounded-2xl px-4 py-2.5 transition
          ${bloqueado ? 'border-red-300 bg-red-50' : 'border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'}`}>
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || enviando}
            placeholder={disabled ? 'Chat no disponible' : 'Escribe un mensaje... (Enter para enviar)'}
            rows={1}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
        </div>

        <button
          onClick={handleEnviar}
          disabled={!texto.trim() || enviando || disabled}
          className="w-11 h-11 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-2xl transition flex-shrink-0"
        >
          {enviando
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Send size={17} />
          }
        </button>
      </div>

      <p className="text-xs text-gray-300 text-right mt-1.5">
        Enter para enviar · Shift+Enter nueva linea
      </p>
    </div>
  )
}
