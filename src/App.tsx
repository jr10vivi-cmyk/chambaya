import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { RoleRoute, PublicRoute } from "./components/routing/ProtectedRoute";

// Páginas públicas
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));

// Layouts
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const TecnicoLayout = lazy(() => import("./layouts/TecnicoLayout"));
const ClienteLayout = lazy(() => import("./layouts/ClienteLayout"));

// Admin páginas
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminTecnicos = lazy(() => import("./pages/admin/Tecnicos"));
const AdminClientes = lazy(() => import("./pages/admin/Clientes"));
const AdminServicios = lazy(() => import("./pages/admin/Servicios"));
const AdminCategorias = lazy(() => import("./pages/admin/Categorias"));
const AdminIngresos = lazy(() => import("./pages/admin/Ingresos"));
const AdminPublicidad = lazy(() => import("./pages/admin/Publicidad"));
const AdminSuscripciones = lazy(() => import("./pages/admin/Suscripciones"));
const AdminReportes = lazy(() => import("./pages/admin/Reportes"));

// Técnico páginas
const TecnicoDashboard = lazy(() => import("./pages/tecnico/Dashboard"));
const TecnicoPerfil = lazy(() => import("./pages/tecnico/Perfil"));
const TecnicoSolicitudes = lazy(() => import("./pages/tecnico/Solicitudes"));
const TecnicoTrabajos = lazy(() => import("./pages/tecnico/Trabajos"));
const TecnicoGanancias = lazy(() => import("./pages/tecnico/Ganancias"));
const TecnicoChat = lazy(() => import("./pages/tecnico/Chat"));
const TecnicoPlanes = lazy(() => import("./pages/tecnico/Planes"));

// Cliente páginas
const ClienteDashboard = lazy(() => import("./pages/cliente/Dashboard"));
const ClienteBuscar = lazy(() => import("./pages/cliente/Buscar"));
const ClienteTecnicoPerfil = lazy(
  () => import("./pages/cliente/TecnicoPerfil"),
);
const ClienteSolicitudes = lazy(() => import("./pages/cliente/Solicitudes"));
const ClienteHistorial = lazy(() => import("./pages/cliente/Historial"));
const ClienteChat = lazy(() => import("./pages/cliente/Chat"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "Inter, sans-serif" },
          }}
        />
        <Routes>
          {/* ── PÚBLICAS ── */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* ── ADMIN ── */}
          <Route
            path="/admin"
            element={
              <RoleRoute roles={["admin"]}>
                <AdminLayout />
              </RoleRoute>
            }
          >
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
          <Route
            path="/tecnico"
            element={
              <RoleRoute roles={["tecnico"]}>
                <TecnicoLayout />
              </RoleRoute>
            }
          >
            <Route index element={<TecnicoDashboard />} />
            <Route path="perfil" element={<TecnicoPerfil />} />
            <Route path="solicitudes" element={<TecnicoSolicitudes />} />
            <Route path="trabajos" element={<TecnicoTrabajos />} />
            <Route path="ganancias" element={<TecnicoGanancias />} />
            <Route path="planes" element={<TecnicoPlanes />} />
            <Route path="chat/:conversacionId?" element={<TecnicoChat />} />
          </Route>

          {/* ── CLIENTE ── */}
          <Route
            path="/cliente"
            element={
              <RoleRoute roles={["cliente"]}>
                <ClienteLayout />
              </RoleRoute>
            }
          >
            <Route index element={<ClienteDashboard />} />
            <Route path="buscar" element={<ClienteBuscar />} />
            <Route path="tecnico/:id" element={<ClienteTecnicoPerfil />} />
            <Route path="solicitudes" element={<ClienteSolicitudes />} />
            <Route path="historial" element={<ClienteHistorial />} />
            <Route path="chat/:conversacionId?" element={<ClienteChat />} />
          </Route>

          {/* Fallbacks */}
          <Route
            path="/no-autorizado"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl text-gray-500">
                  No tienes acceso a esta sección.
                </p>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
