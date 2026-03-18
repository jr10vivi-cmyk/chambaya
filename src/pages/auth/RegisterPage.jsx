import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Wrench, User, Briefcase } from 'lucide-react'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [step, setStep] = useState(1) // 1: elegir rol, 2: datos
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmar: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmar) {
      toast.error('Las contraseñas no coinciden'); return
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres'); return
    }
    setLoading(true)
    try {
      await signUp({ ...form, role })
      toast.success('¡Cuenta creada! Revisa tu correo para confirmar.')
    } catch (err) {
      toast.error(err.message || 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg mb-4">
            <Wrench size={24} />
            <span className="text-2xl font-bold">ChambaYA</span>
          </div>
          <p className="text-gray-500">Crea tu cuenta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Paso 1: Elegir rol */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                ¿Cómo quieres usar ChambaYA?
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setRole('cliente')}
                  className={`p-5 rounded-xl border-2 text-center transition ${
                    role === 'cliente'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <User size={32} className="mx-auto mb-2 text-orange-500" />
                  <p className="font-semibold text-gray-800">Soy Cliente</p>
                  <p className="text-xs text-gray-500 mt-1">Busco técnicos para mis problemas</p>
                </button>

                <button
                  onClick={() => setRole('tecnico')}
                  className={`p-5 rounded-xl border-2 text-center transition ${
                    role === 'tecnico'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Briefcase size={32} className="mx-auto mb-2 text-orange-500" />
                  <p className="font-semibold text-gray-800">Soy Técnico</p>
                  <p className="text-xs text-gray-500 mt-1">Ofrezco mis servicios profesionales</p>
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!role}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Paso 2: Datos personales */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600 mb-2">
                ← Cambiar rol
              </button>

              <div className="grid grid-cols-2 gap-4">
                {[['nombre','Nombre'],['apellido','Apellido']].map(([k,l]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                    <input
                      required={k==='nombre'}
                      value={form[k]}
                      onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-sm"
                    />
                  </div>
                ))}
              </div>

              {[
                ['email','Correo electrónico','email'],
                ['password','Contraseña','password'],
                ['confirmar','Confirmar contraseña','password']
              ].map(([k,l,t]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                  <input
                    type={t} required
                    value={form[k]}
                    onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-sm"
                  />
                </div>
              ))}

              <button
                type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Creando...</>
                  : `Crear cuenta ${role === 'tecnico' ? 'de técnico' : 'de cliente'}`
                }
              </button>
            </form>
          )}

          <div className="mt-5 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}