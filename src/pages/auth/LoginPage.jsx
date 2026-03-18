import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Wrench, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const sessionData = await signIn(form)
            toast.success('¡Bienvenido de vuelta!')
            
            // Forzar redirección manual si es necesario
            const { data: profileData } = await supabase.from('profiles').select('role').eq('id', sessionData.user.id).single()
            if (profileData?.role === 'admin') navigate('/admin')
            else if (profileData?.role === 'tecnico') navigate('/tecnico')
            else navigate('/cliente')
        } catch (err) {
            toast.error(err.message || 'Credenciales incorrectas')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg mb-4">
                        <Wrench size={24} />
                        <span className="text-2xl font-bold tracking-tight">ChambaYA</span>
                    </div>
                    <p className="text-gray-500">Inicia sesión en tu cuenta</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Ingresando...</>
                            ) : 'Iniciar sesión'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" className="text-orange-500 hover:text-orange-600 font-medium">
                            Regístrate gratis
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}