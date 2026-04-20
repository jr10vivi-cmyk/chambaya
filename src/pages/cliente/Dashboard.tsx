import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import BannerPublicidad from "../../components/publicidad/BannerPublicidad";
import {
  Search,
  ClipboardList,
  MessageCircle,
  Star,
  Crown,
  Zap,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    n || 0,
  );

// Tarjeta tecnico destacado
function TecnicoDestacadoCard({ tecnico }) {
  const nombre =
    `${tecnico.profiles?.nombre || ""} ${tecnico.profiles?.apellido || ""}`.trim();
  return (
    <Link
      to={`/cliente/tecnico/${tecnico.id}`}
      className={`block bg-white rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
        ${tecnico.es_premium ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-100"}`}
    >
      {tecnico.es_premium && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 flex items-center gap-1">
          <Crown size={10} className="text-white" fill="white" />
          <span className="text-[10px] font-semibold text-white">PREMIUM</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0
            ${tecnico.es_premium ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-600"}`}
          >
            {tecnico.profiles?.avatar_url ? (
              <img
                src={tecnico.profiles.avatar_url}
                alt={nombre}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              nombre[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {nombre}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-gray-300" />
              <span className="text-xs text-gray-400 truncate">
                {tecnico.profiles?.ciudad || "Sin ubicacion"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" fill="currentColor" />
            <span className="font-semibold text-gray-700">
              {tecnico.calificacion_promedio?.toFixed(1) || "Nuevo"}
            </span>
            <span className="text-gray-400">
              ({tecnico.total_resenas || 0})
            </span>
          </div>
          {tecnico.tarifa_hora && (
            <span className="font-semibold text-orange-600">
              S/{tecnico.tarifa_hora}/h
            </span>
          )}
        </div>
        {tecnico.tecnico_categorias?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tecnico.tecnico_categorias.slice(0, 2).map((tc) => (
              <span
                key={tc.categoria_id}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs"
              >
                {tc.categorias?.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ClienteDashboard() {
  const { profile } = useAuth();
  const [tecnicosDestacados, setTecnicosDestacados] = useState([]);
  const [stats, setStats] = useState({
    pendientes: 0,
    completados: 0,
    gastado: 0,
  });
  const [loading, setLoading] = useState(true);

  const nombre = profile?.nombre?.split(" ")[0] || "Cliente";

  useEffect(() => {
    if (!profile?.id) return;

    const cargarDatos = async () => {
      // Tecnicos premium + mejor calificados para mostrar como destacados
      const { data: tecnicos } = await supabase
        .from("tecnicos")
        .select(
          `
          id, es_premium, tarifa_hora, calificacion_promedio,
          total_resenas, total_trabajos,
          profiles(nombre, apellido, avatar_url, ciudad),
          tecnico_categorias(categoria_id, categorias(nombre))
        `,
        )
        .eq("estado_verificacion", "aprobado")
        .order("es_premium", { ascending: false })
        .order("calificacion_promedio", { ascending: false })
        .limit(6);

      setTecnicosDestacados(tecnicos || []);

      // Stats del cliente
      const { data: sols } = await supabase
        .from("solicitudes")
        .select("estado")
        .eq("cliente_id", profile.id);

      const arr = sols || [];
      const pendientes = arr.filter((s) =>
        ["pendiente", "aceptado", "en_proceso"].includes(s.estado),
      ).length;
      const completados = arr.filter((s) => s.estado === "completado").length;

      const { data: pagos } = await supabase
        .from("pagos")
        .select("monto_total")
        .eq("cliente_id", profile.id)
        .eq("estado", "completado");

      const gastado = (pagos || []).reduce(
        (s, p) => s + Number(p.monto_total),
        0,
      );
      setStats({ pendientes, completados, gastado });
      setLoading(false);
    };

    cargarDatos();
  }, [profile?.id]);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {nombre} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Banner de publicidad principal */}
      <BannerPublicidad posicion="inicio" className="w-full" />

      {/* Accesos rapidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            to: "/cliente/buscar",
            icon: Search,
            label: "Buscar tecnico",
            color: "bg-orange-50 text-orange-600",
          },
          {
            to: "/cliente/solicitudes",
            icon: ClipboardList,
            label: "Mis solicitudes",
            color: "bg-blue-50 text-blue-600",
            badge: stats.pendientes,
          },
          {
            to: "/cliente/chat",
            icon: MessageCircle,
            label: "Chat",
            color: "bg-green-50 text-green-600",
          },
          {
            to: "/cliente/historial",
            icon: Clock,
            label: "Historial",
            color: "bg-purple-50 text-purple-600",
          },
        ].map(({ to, icon: Icon, label, color, badge }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all relative"
          >
            {badge > 0 && (
              <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={20} />
            </div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
          </Link>
        ))}
      </div>

      {/* Stats del cliente */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
              <Clock size={18} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.pendientes}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">En proceso</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completados}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Completados</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <Star size={18} className="text-blue-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {fmt(stats.gastado)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Total gastado</p>
          </div>
        </div>
      )}

      {/* Tecnicos recomendados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-xl">
              <Zap size={16} className="text-amber-500" />
            </div>
            <h2 className="font-bold text-gray-900">Tecnicos recomendados</h2>
          </div>
          <Link
            to="/cliente/buscar"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
          >
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tecnicosDestacados.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400 text-sm">
              Sin tecnicos disponibles aun
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tecnicosDestacados.map((t) => (
              <TecnicoDestacadoCard key={t.id} tecnico={t} />
            ))}
          </div>
        )}
      </div>

      {/* Banner secundario en lateral (si existe) */}
      <BannerPublicidad posicion="lateral" className="w-full" />
    </div>
  );
}
