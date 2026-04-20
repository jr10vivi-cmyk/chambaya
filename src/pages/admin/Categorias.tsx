// src/pages/admin/Categorias.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategorias() {
    const [categorias, setCategorias] = useState([])
    const [form, setForm] = useState({ nombre: '', descripcion: '', icono: 'Wrench' })
    const [editando, setEditando] = useState(null)

    useEffect(() => {
        supabase.from('categorias').select('*').order('nombre')
            .then(({ data }) => setCategorias(data || []))
    }, [])

    const handleGuardar = async (e) => {
        e.preventDefault()
        const op = editando
            ? supabase.from('categorias').update(form).eq('id', editando)
            : supabase.from('categorias').insert(form).select().single()
        const { data, error } = await op
        if (error) { toast.error('Error al guardar'); return }
        if (editando) {
            setCategorias(cs => cs.map(c => c.id === editando ? { ...c, ...form } : c))
            toast.success('Categoría actualizada')
        } else {
            setCategorias(cs => [...cs, data])
            toast.success('Categoría creada')
        }
        setForm({ nombre: '', descripcion: '', icono: 'Wrench' })
        setEditando(null)
    }

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar esta categoría?')) return
        await supabase.from('categorias').delete().eq('id', id)
        setCategorias(cs => cs.filter(c => c.id !== id))
        toast.success('Categoría eliminada')
    }

    return (
        <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Categorías de Oficios</h1>

            {/* Formulario */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">
                    {editando ? 'Editar categoría' : 'Nueva categoría'}
                </h2>
                <form onSubmit={handleGuardar} className="flex gap-3 flex-wrap">
                    <input required placeholder="Nombre *" value={form.nombre}
                        onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                        className="flex-1 min-w-[160px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input placeholder="Descripción" value={form.descripcion}
                        onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                        className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <input placeholder="Icono (Lucide)" value={form.icono}
                        onChange={e => setForm(p => ({ ...p, icono: e.target.value }))}
                        className="w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <button type="submit"
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition">
                        <Plus size={15} />{editando ? 'Actualizar' : 'Agregar'}
                    </button>
                    {editando && (
                        <button type="button" onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '', icono: 'Wrench' }) }}
                            className="px-5 py-2.5 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-2xl border border-gray-100">
                <table className="w-full">
                    <thead className="border-b border-gray-100 bg-gray-50">
                        <tr>{['Nombre', 'Descripción', 'Icono', ''].map(h => (
                            <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {categorias.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition">
                                <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{c.nombre}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-500">{c.descripcion || '—'}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-400 font-mono">{c.icono || '—'}</td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setEditando(c.id); setForm({ nombre: c.nombre, descripcion: c.descripcion || '', icono: c.icono || '' }) }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => eliminar(c.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500">
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