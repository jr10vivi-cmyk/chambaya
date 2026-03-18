import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Ruta que requiere sesión iniciada
export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingScreen />
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />
    return children
}

// Ruta que requiere un rol específico
export function RoleRoute({ children, roles }) {
    const { profile, loading } = useAuth()
    const location = useLocation()

    if (loading) return <LoadingScreen />
    if (!profile) return <Navigate to="/login" state={{ from: location }} replace />
    if (!roles.includes(profile.role)) return <Navigate to="/no-autorizado" replace />
    return children
}

// Ruta pública (redirige si ya está logueado)
export function PublicRoute({ children }) {
    const { user, profile, loading } = useAuth()

    if (loading) return <LoadingScreen />
    if (user && profile) {
        const redirects = { admin: '/admin', tecnico: '/tecnico', cliente: '/cliente' }
        return <Navigate to={redirects[profile.role] || '/'} replace />
    }
    return children
}

function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Cargando ChambaYA...</p>
            </div>
        </div>
    )
}