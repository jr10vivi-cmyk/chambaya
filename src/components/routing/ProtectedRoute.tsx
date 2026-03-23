import { type ReactNode } from 'react'
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAvailableRole } from "../../lib/storage";
import { ROUTES, ROLE_HOME } from "../../lib/routes";
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: ReactNode
}

// Ruta que requiere sesion iniciada
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  return children;
}

interface RoleRouteProps {
  children: ReactNode
  roles: UserRole[]
}

// Ruta que requiere un rol especifico
export function RoleRoute({ children, roles }: RoleRouteProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!profile) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  if (!roles.includes(profile.role as UserRole)) return <Navigate to={ROUTES.NO_AUTH} replace />;
  return children;
}

interface PublicRouteProps {
  children: ReactNode
}

// Ruta publica (redirige si ya esta logueado)
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, profile, loading } = useAuth();

  // Durante la carga: usar caché para redirect instantáneo sin esperar el fetch del perfil
  if (loading) {
    const role = getAvailableRole()
    if (role) return <Navigate to={ROLE_HOME[role] ?? ROUTES.HOME} replace />
    return <LoadingScreen />
  }

  // Perfil cargado exitosamente → redirigir a su home
  if (user && profile) {
    return <Navigate to={ROLE_HOME[profile.role] ?? ROUTES.HOME} replace />
  }

  // user seteado pero profile=null (fetch falló tras 3 intentos) → mostrar login
  // para que el usuario pueda reintentar sin loop infinito
  return children;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Cargando ChambaYA...</p>
      </div>
    </div>
  );
}
