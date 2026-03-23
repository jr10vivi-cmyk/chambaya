import { useEffect, useState } from "react";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import TarjetaSolicitud from "../../components/solicitudes/TarjetaSolicitud";
import { Link } from "react-router-dom";
import { Search, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { key: null, label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "en_proceso", label: "En proceso" },
  { key: "completado", label: "Completadas" },
  { key: "cancelado", label: "Canceladas" },
];

export default function ClienteSolicitudes() {
  const [tabActiva, setTabActiva] = useState(null);
  const {
    solicitudes,
    loading,
    fetchSolicitudes,
    cambiarEstado,
    confirmarServicio,
    enviarResena,
  } = useSolicitudes(tabActiva);

  useEffect(() => {
    fetchSolicitudes();
  }, [tabActiva]);

  const handleCambiarEstado = async (id, estado, extras) => {
    const result = await cambiarEstado(id, estado, extras);
    if (result?.ok) {
      toast.success(
        { cancelado: "Solicitud cancelada" }[estado] || "Actualizado",
      );
      fetchSolicitudes();
    } else {
      toast.error(result?.error || "Error");
    }
    return result;
  };

  const handleConfirmar = async (id, monto) => {
    const result = await confirmarServicio(id, monto);
    if (result?.ok) {
      toast.success("🎉 Pago confirmado. ¡Gracias por usar ChambaYA!");
      fetchSolicitudes();
    } else {
      toast.error(result?.error || "Error al confirmar");
    }
  };

  const handleResena = async (id, datos) => {
    const result = await enviarResena(id, datos);
    if (result?.ok) {
      toast.success("⭐ ¡Reseña enviada! Gracias por tu opinión");
      fetchSolicitudes();
    } else {
      toast.error(result?.error || "Error al enviar reseña");
    }
  };

  // Solicitudes que necesitan acción
  const pendientesAccion = solicitudes.filter(
    (s) =>
      (s.estado === "completado" && !s.confirmado_cliente) ||
      s.estado === "pendiente",
  ).length;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis solicitudes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historial y gestión de tus servicios
          </p>
        </div>
        {pendientesAccion > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium">
            ⚠️ {pendientesAccion} solicitud{pendientesAccion > 1 ? "es" : ""}{" "}
            requiere{pendientesAccion > 1 ? "n" : ""} tu atención
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 p-1 rounded-2xl">
        {TABS.map((tab) => (
          <button
            key={String(tab.key)}
            onClick={() => setTabActiva(tab.key)}
            className={`flex-shrink-0 py-2 px-4 rounded-xl text-sm font-medium transition
              ${tabActiva === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 text-center bg-white rounded-2xl border border-gray-100">
          <ClipboardList size={40} className="text-gray-200 mb-3" />
          <p className="font-medium text-gray-500">Sin solicitudes aún</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Encuentra un técnico y solicita tu primer servicio
          </p>
          <Link
            to="/cliente/buscar"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Buscar técnicos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((s) => (
            <TarjetaSolicitud
              key={s.id}
              solicitud={s}
              miRole="cliente"
              onCambiarEstado={handleCambiarEstado}
              onConfirmar={handleConfirmar}
              onCalificar={handleResena}
            />
          ))}
        </div>
      )}
    </div>
  );
}
