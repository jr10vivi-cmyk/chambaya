import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, RoleRoute, PublicRoute } from './components/routing/ProtectedRoute'

// Páginas públicas
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import TecnicoLayout from './layouts/TecnicoLayout'
import ClienteLayout from './layouts/ClienteLayout'

// Admin páginas
import AdminDashboard from './pages/admin/Dashboard'
import AdminTecnicos from './pages/admin/Tecnicos'
import AdminClientes from './pages/admin/Clientes'
import AdminServicios from './pages/admin/Servicios'
import AdminCategorias from './pages/admin/Categorias'
import AdminIngresos from './pages/admin/Ingresos'
import AdminPublicidad from './pages/admin/Publicidad'
import AdminSuscripciones from './pages/admin/Suscripciones'
import AdminReportes from './pages/admin/Reportes'

// Técnico páginas
import TecnicoDashboard from './pages/tecnico/Dashboard'
import TecnicoPerfil from './pages/tecnico/Perfil'
import TecnicoSolicitudes from './pages/tecnico/Solicitudes'
import TecnicoTrabajos from './pages/tecnico/Trabajos'
import TecnicoGanancias from './pages/tecnico/Ganancias'
import TecnicoChat from './pages/tecnico/Chat'
import TecnicoPlanes from './pages/tecnico/Planes'

// Cliente páginas
import ClienteDashboard from './pages/cliente/Dashboard'
import ClienteBuscar from './pages/cliente/Buscar'
import ClienteTecnicoPerfil from './pages/cliente/TecnicoPerfil'
import ClienteSolicitudes from './pages/cliente/Solicitudes'
import ClienteHistorial from './pages/cliente/Historial'
import ClienteChat from './pages/cliente/Chat'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'Inter, sans-serif' }
        }} />
        <Routes>

          {/* ── PÚBLICAS ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/registro" element={
            <PublicRoute><RegisterPage /></PublicRoute>
          } />

          {/* ── ADMIN ── */}
          <Route path="/admin" element={
            <RoleRoute roles={['admin']}>
              <AdminLayout />
            </RoleRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="tecnicos" element={<AdminTecnicos />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="servicios" element={<AdminServicios />} />
            <Route path="categorias" element={<AdminCategorias />} />
            <Route path="ingresos" element={<AdminIngresos />} />
            <Route path="publicidad" element={<AdminPublicidad />} />
            <Route path="suscripciones" element={<AdminSuscripciones />} />
            <Route path="reportes" element={<AdminReportes />} />
          </Route>

          {/* ── TÉCNICO ── */}
          <Route path="/tecnico" element={
            <RoleRoute roles={['tecnico']}>
              <TecnicoLayout />
            </RoleRoute>
          }>
            <Route index element={<TecnicoDashboard />} />
            <Route path="perfil" element={<TecnicoPerfil />} />
            <Route path="solicitudes" element={<TecnicoSolicitudes />} />
            <Route path="trabajos" element={<TecnicoTrabajos />} />
            <Route path="ganancias" element={<TecnicoGanancias />} />
            <Route path="planes" element={<TecnicoPlanes />} />
            <Route path="chat/:conversacionId?" element={<TecnicoChat />} />
          </Route>

          {/* ── CLIENTE ── */}
          <Route path="/cliente" element={
            <RoleRoute roles={['cliente']}>
              <ClienteLayout />
            </RoleRoute>
          }>
            <Route index element={<ClienteDashboard />} />
            <Route path="buscar" element={<ClienteBuscar />} />
            <Route path="tecnico/:id" element={<ClienteTecnicoPerfil />} />
            <Route path="solicitudes" element={<ClienteSolicitudes />} />
            <Route path="historial" element={<ClienteHistorial />} />
            <Route path="chat/:conversacionId?" element={<ClienteChat />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/no-autorizado" element={<div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-500">No tienes acceso a esta sección.</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}