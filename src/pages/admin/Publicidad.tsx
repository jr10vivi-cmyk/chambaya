import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Eye, MousePointer } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPublicidad() {
  const [anuncios, setAnuncios] = useState([])
  const [form, setForm] = useState({
    titulo: '', url_destino: '', tipo: 'banner',
    posicion: 'inicio', costo: '', activo: true,
    fecha_inicio: '', fecha_fin: ''
  })
  const [editando, setEditando] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('publicidades').select('*').order('creado_en', { ascending: false })
      .then(({ data }) => { setAnuncios(data || []); setLoading(false) })
  }, [])

  const handleGuardar = async (e) => {
    e.preventDefault()
    const op = editando
      ? supabase.from('publicidades').update(form).eq('id', editando).select().single()
      : supabase.from('publicidades').insert(form).select().single()
    const { data, error } = await op
    if (error) { toast.error('Error al guardar'); return }
    if (editando) {
      setAnuncios(a => a.map(x => x.id === editando ? data : x))
      toast.success('Anuncio actualizado')
    } else {
      setAnuncios(a => [data, ...a])
      toast.success('Anuncio creado')
    }
    setForm({ titulo: '', url_destino: '', tipo: 'banner', posicion: 'inicio', costo: '', activo: true, fecha_inicio: '', fecha_fin: '' })
    setEditando(null)
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este anuncio?')) return
    await supabase.from('publicidades').delete().eq('id', id)
    setAnuncios(a => a.filter(x => x.id !== id))
    toast.success('Eliminado')
  }

  const toggleActivo = async (id, activo) => {
    await supabase.from('publicidades').update({ activo: !activo }).eq('id', id)
    setAnuncios(a => a.map(x => x.id === id ? { ...x, activo: !activo } : x))
  }

  const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Publicidad</h1>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-5">
          {editando ? 'Editar anuncio' : 'Nuevo anuncio'}
        </h2>
        <form onSubmit={handleGuardar} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Título *</label>
            <input required value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              className={INPUT} placeholder="Nombre del anuncio" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">URL destino</label>
            <input type="url" value={form.url_destino} onChange={e => setForm(p => ({ ...p, url_destino: e.target.value }))}
              className={INPUT} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipo</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className={INPUT}>
              <option value="banner">Banner</option>
              <option value="destacado">Destacado</option>
              <option value="popup">Popup</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Costo (S/)</label>
            <input type="number" step="0.01" value={form.costo}
              onChange={e => setForm(p => ({ ...p, costo: e.target.value }))}
              className={INPUT} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha inicio</label>
            <input type="date" value={form.fecha_inicio}
              onChange={e => setForm(p => ({ ...p, fecha_inicio: e.target.value }))} className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha fin</label>
            <input type="date" value={form.fecha_fin}
              onChange={e => setForm(p => ({ ...p, fecha_fin: e.target.value }))} className={INPUT} />
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="submit"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
              <Plus size={15} />{editando ? 'Actualizar' : 'Crear anuncio'}
            </button>
            {editando && (
              <button type="button"
                onClick={() => { setEditando(null); setForm({ titulo: '', url_destino: '', tipo: 'banner', posicion: 'inicio', costo: '', activo: true, fecha_inicio: '', fecha_fin: '' }) }}
                className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>{['Anuncio', 'Tipo', 'Clicks', 'Impresiones', 'Costo', 'Estado', ''].map(h => (
              <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {anuncios.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Sin anuncios creados</td></tr>
            )}
            {anuncios.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4 text-sm font-medium text-gray-800">{a.titulo}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs capitalize">{a.tipo}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1"><MousePointer size={12} className="text-gray-300" />{a.clicks || 0}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1"><Eye size={12} className="text-gray-300" />{a.impresiones || 0}</div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                  {a.costo ? `S/${Number(a.costo).toFixed(2)}` : '—'}
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleActivo(a.id, a.activo)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition
                      ${a.activo ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditando(a.id); setForm({ titulo: a.titulo, url_destino: a.url_destino || '', tipo: a.tipo, posicion: a.posicion || 'inicio', costo: a.costo || '', activo: a.activo, fecha_inicio: a.fecha_inicio?.split('T')[0] || '', fecha_fin: a.fecha_fin?.split('T')[0] || '' }) }}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => eliminar(a.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}