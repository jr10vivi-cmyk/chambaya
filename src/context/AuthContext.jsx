import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, tecnicos(*)')
      .eq('id', userId)
      .single()

    if (!error) setProfile(data)
    setLoading(false)
  }

  const signUp = async ({ email, password, nombre, apellido, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre, apellido, role } }
    })
    if (error) throw error

    // Si es técnico, crear fila en tecnicos
    if (!error && role === 'tecnico' && data.user) {
      await supabase.from('tecnicos').insert({ id: data.user.id })
    }
    return data
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isTecnico: profile?.role === 'tecnico',
    isCliente: profile?.role === 'cliente',
    tecnico: profile?.tecnicos,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}