// src/pages/admin/Clientes.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Ban } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminClientes() {
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'cliente')
                .order('creado_en', { ascending: false })
            setClientes(data || [])
            setLoading(false)
        }
        fetch()
    }, [])

    const toggleActivo = async (id, activo) => {
        await supabase.from('profiles').update({ activo: !activo }).eq('id', id)
        setClientes(cs => cs.map(c => c.id === id ? { ...c, activo: !activo } : c))
        toast.success(activo ? 'Cuenta suspendida' : 'Cuenta reactivada')
    }

    const filtrados = search
        ? clientes.filter(c => `${c.nombre} ${c.apellido} ${c.email}`.toLowerCase().includes(search.toLowerCase()))
        : clientes

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                <p className="text-sm text-gray-500 mt-1">{clientes.length} clientes registrados</p>
            </div>
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-gray-100 bg-gray-50">
                            <tr>{['Cliente', 'Email', 'Ciudad', 'Registrado', 'Estado', ''].map(h => (
                                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtrados.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {c.nombre?.[0]?.toUpperCase()}
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">{c.nombre} {c.apellido}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-500">{c.email}</td>
                                    <td className="px-5 py-4 text-sm text-gray-500">{c.ciudad || '—'}</td>
                                    <td className="px-5 py-4 text-sm text-gray-400">
                                        {new Date(c.creado_en).toLocaleDateString('es-PE')}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {c.activo ? 'Activo' : 'Suspendido'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => toggleActivo(c.id, c.activo)}
                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50">
                                            <Ban size={13} />
                                            {c.activo ? 'Suspender' : 'Reactivar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}