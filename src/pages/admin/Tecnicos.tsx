import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  MapPin,
  Clock,
  Crown,
  ChevronDown,
  RefreshCw,
  Ban,
  Wrench,
} from "lucide-react";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { ActionMenu } from "../../components/ui/ActionMenu";

// ── Constantes ──────────────────────────────────────────────
const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "aprobado", label: "Aprobados" },
  { value: "rechazado", label: "Rechazados" },
  { value: "suspendido", label: "Suspendidos" },
];

const ESTADO_CFG = {
  pendiente: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pendiente",
  },
  aprobado: {
    color: "bg-green-50 text-green-700 border-green-200",
    label: "Aprobado",
  },
  rechazado: {
    color: "bg-red-50 text-red-700 border-red-200",
    label: "Rechazado",
  },
  suspendido: {
    color: "bg-gray-100 text-gray-600 border-gray-200",
    label: "Suspendido",
  },
};

// ── Sub-componentes ──────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CFG[estado as keyof typeof ESTADO_CFG] || {
    color: "bg-gray-100 text-gray-600 border-gray-200",
    label: estado,
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function TecnicoModal({ tecnico, onClose }: { tecnico: TecnicoRow; onClose: () => void }) {
  if (!tecnico) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalle del Técnico
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <XCircle size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Avatar + nombre */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl">
              {tecnico.profiles?.nombre?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {tecnico.profiles?.nombre} {tecnico.profiles?.apellido}
              </h3>
              <p className="text-sm text-gray-500">{tecnico.profiles?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <EstadoBadge estado={tecnico.estado_verificacion} />
                {tecnico.es_premium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-medium">
                    <Crown size={11} fill="currentColor" /> Premium
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Calificación",
                value: tecnico.calificacion_promedio?.toFixed(1) || "—",
                icon: Star,
              },
              {
                label: "Trabajos",
                value: tecnico.total_trabajos || 0,
                icon: CheckCircle,
              },
              {
                label: "Tarifa/hr",
                value: tecnico.tarifa_hora ? `S/${tecnico.tarifa_hora}` : "—",
                icon: Clock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <Icon size={16} className="mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            {[
              ["Teléfono", tecnico.profiles?.telefono || "No registrado"],
              ["Ciudad", tecnico.profiles?.ciudad || "No registrado"],
              ["Descripción", tecnico.descripcion || "Sin descripción"],
              [
                "Experiencia",
                tecnico.experiencia_anos
                  ? `${tecnico.experiencia_anos} año(s)`
                  : "No especificada",
              ],
              [
                "Radio servicio",
                tecnico.radio_servicio_km
                  ? `${tecnico.radio_servicio_km} km`
                  : "No especificado",
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-medium text-gray-500 w-28 flex-shrink-0">
                  {k}:
                </span>
                <span className="text-gray-700">{v}</span>
              </div>
            ))}
          </div>

          {/* Categorías */}
          {tecnico.tecnico_categorias?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Categorías de servicio:
              </p>
              <div className="flex flex-wrap gap-2">
                {tecnico.tecnico_categorias.map((tc) => (
                  <span
                    key={tc.categoria_id}
                    className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium"
                  >
                    {tc.categorias?.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documentos de identidad */}
          {(tecnico.dni || tecnico.foto_dni_url || tecnico.foto_selfie_url) && (
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-700">
                Documentos de identidad
              </p>
              {tecnico.dni && (
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-gray-500 w-28 flex-shrink-0">
                    DNI:
                  </span>
                  <span className="text-gray-700 font-mono">{tecnico.dni}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {tecnico.foto_dni_url && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Foto DNI</p>
                    <a
                      href={tecnico.foto_dni_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-20 bg-gray-200 rounded-lg hover:opacity-80 transition"
                    >
                      <img
                        src={tecnico.foto_dni_url}
                        alt="DNI"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </div>
                )}
                {tecnico.foto_selfie_url && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Selfie con DNI</p>
                    <a
                      href={tecnico.foto_selfie_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full h-20 bg-gray-200 rounded-lg hover:opacity-80 transition"
                    >
                      <img
                        src={tecnico.foto_selfie_url}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </div>
                )}
              </div>
              {tecnico.notas_verificacion && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Notas: </span>
                  {tecnico.notas_verificacion}
                </div>
              )}
            </div>
          )}

          {/* Registro */}
          <p className="text-xs text-gray-400">
            Registrado el{" "}
            {new Date(tecnico.creado_en ?? "").toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tipos ────────────────────────────────────────────────────

type TecnicoRow = {
  id: string;
  estado_verificacion: string;
  es_premium: boolean | null;
  premium_hasta: string | null;
  calificacion_promedio: number | null;
  total_resenas: number | null;
  total_trabajos: number | null;
  tarifa_hora: number | null;
  descripcion: string | null;
  experiencia_anos: number | null;
  radio_servicio_km: number | null;
  dni: string | null;
  foto_dni_url: string | null;
  foto_selfie_url: string | null;
  notas_verificacion: string | null;
  creado_en: string | null;
  profiles: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    email: string | null;
    telefono: string | null;
    ciudad: string | null;
    avatar_url: string | null;
    activo: boolean | null;
  } | null;
  tecnico_categorias: { categoria_id: string; categorias: { nombre: string } | null }[];
};

// ── Página principal ─────────────────────────────────────────

export default function AdminTecnicos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tecnicos, setTecnicos] = useState<TecnicoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(
    searchParams.get("filtro") || "",
  );
  const [tecnicoDetalle, setTecnicoDetalle] = useState<TecnicoRow | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const fetchTecnicos = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tecnicos")
      .select(
        `
        *,
        profiles(id, nombre, apellido, email, telefono, ciudad, avatar_url, activo),
        tecnico_categorias(categoria_id, categorias(nombre))
      `,
      )
      .order("creado_en", { ascending: false });

    if (filtroEstado) query = query.eq("estado_verificacion", filtroEstado);

    const { data, error } = await query;
    if (!error) {
      // Filtro de búsqueda en frontend
      const filtered = search
        ? data.filter((t) =>
            `${t.profiles?.nombre} ${t.profiles?.apellido} ${t.profiles?.email}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
        : data;
      setTecnicos(filtered as unknown as TecnicoRow[]);
    }
    setLoading(false);
  }, [filtroEstado, search]);

  useEffect(() => {
    fetchTecnicos();
  }, [fetchTecnicos]);

  const handleAccion = async (accion: string, tecnico: TecnicoRow) => {
    if (accion === "ver") {
      setTecnicoDetalle(tecnico);
      return;
    }

    const confirmar = {
      aprobar: "¿Aprobar este técnico?",
      rechazar: "¿Rechazar este técnico?",
      suspender: "¿Suspender esta cuenta?",
      premium: "¿Activar Premium por 30 días?",
      sin_premium: "¿Quitar suscripción Premium?",
    }[accion];

    if (!window.confirm(confirmar)) return;

    setProcesando(tecnico.id);
    try {
      const updates: Record<string, unknown> = {};

      if (accion === "aprobar") updates.estado_verificacion = "aprobado";
      if (accion === "rechazar") updates.estado_verificacion = "rechazado";
      if (accion === "suspender") updates.estado_verificacion = "suspendido";
      if (accion === "premium") {
        const fin = new Date();
        fin.setDate(fin.getDate() + 30);
        updates.es_premium = true;
        updates.premium_hasta = fin.toISOString();
      }
      if (accion === "sin_premium") {
        updates.es_premium = false;
        updates.premium_hasta = null;
      }

      const { error } = await supabase
        .from("tecnicos")
        .update(updates)
        .eq("id", tecnico.id);

      if (error) throw error;

      // Si aprobado/rechazado, notificar al técnico
      if (accion === "aprobar" || accion === "rechazar") {
        await supabase.from("notificaciones").insert({
          usuario_id: tecnico.id,
          tipo: "verificacion",
          titulo:
            accion === "aprobar"
              ? "¡Tu cuenta fue aprobada!"
              : "Tu cuenta fue rechazada",
          mensaje:
            accion === "aprobar"
              ? "Ya puedes recibir solicitudes de servicio."
              : "Contacta soporte para más información.",
        });
      }

      const msgs: Record<string, string> = {
        aprobar: "✅ Técnico aprobado",
        rechazar: "❌ Técnico rechazado",
        suspender: "⛔ Cuenta suspendida",
        premium: "⭐ Premium activado",
        sin_premium: "Premium removido",
      };
      toast.success(msgs[accion] ?? "Acción realizada");

      fetchTecnicos();
    } catch (err) {
      toast.error("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setProcesando(null);
    }
  };

  const conteos = {
    pendiente: tecnicos.filter((t) => t.estado_verificacion === "pendiente")
      .length,
    aprobado: tecnicos.filter((t) => t.estado_verificacion === "aprobado")
      .length,
    premium: tecnicos.filter((t) => t.es_premium).length,
  };

  const tecnicosColumns: Column<(typeof tecnicos)[0]>[] = [
    {
      key: "tecnico",
      header: "Técnico",
      cell: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
            {t.profiles?.nombre?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              {t.profiles?.nombre} {t.profiles?.apellido}
              {t.es_premium && (
                <Crown size={12} className="text-amber-500" fill="currentColor" />
              )}
            </p>
            <p className="text-xs text-gray-400">{t.profiles?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "ciudad",
      header: "Ciudad",
      cell: (t) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={13} className="text-gray-300 flex-shrink-0" />
          {t.profiles?.ciudad || "—"}
        </div>
      ),
    },
    {
      key: "categorias",
      header: "Categorías",
      cell: (t) => (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {t.tecnico_categorias?.slice(0, 2).map((tc) => (
            <span key={tc.categoria_id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs">
              {tc.categorias?.nombre}
            </span>
          ))}
          {t.tecnico_categorias?.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-xs">
              +{t.tecnico_categorias.length - 2}
            </span>
          )}
          {!t.tecnico_categorias?.length && (
            <span className="text-xs text-gray-300">Sin categoría</span>
          )}
        </div>
      ),
    },
    {
      key: "calificacion",
      header: "Calificación",
      cell: (t) => (
        <div className="flex items-center gap-1">
          <Star size={14} className="text-amber-400" fill="currentColor" />
          <span className="text-sm font-medium text-gray-700">
            {t.calificacion_promedio?.toFixed(1) || "—"}
          </span>
          <span className="text-xs text-gray-400">({t.total_resenas || 0})</span>
        </div>
      ),
    },
    {
      key: "trabajos",
      header: "Trabajos",
      cell: (t) => (
        <span className="text-sm font-medium text-gray-700">{t.total_trabajos || 0}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      cell: (t) => <EstadoBadge estado={t.estado_verificacion} />,
    },
    {
      key: "acciones",
      header: "",
      cell: (t) => (
        <ActionMenu
          items={[
            { label: "Ver detalle", icon: Eye, onClick: () => handleAccion("ver", t) },
            { label: "Aprobar", icon: CheckCircle, onClick: () => handleAccion("aprobar", t), show: t.estado_verificacion !== "aprobado" },
            { label: "Rechazar", icon: XCircle, variant: "danger", onClick: () => handleAccion("rechazar", t), show: t.estado_verificacion !== "rechazado" },
            { label: "Suspender", icon: Ban, variant: "danger", onClick: () => handleAccion("suspender", t), show: t.estado_verificacion !== "suspendido" },
            { label: "Dar Premium", icon: Crown, onClick: () => handleAccion("premium", t), show: !t.es_premium },
            { label: "Quitar Premium", icon: Crown, onClick: () => handleAccion("sin_premium", t), show: !!t.es_premium },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Técnicos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tecnicos.length} técnico(s) encontrado(s)
          </p>
        </div>
        <button
          onClick={fetchTecnicos}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Mini-stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Pendientes",
            value: conteos.pendiente,
            color: "text-amber-600 bg-amber-50 border-amber-200",
          },
          {
            label: "Aprobados",
            value: conteos.aprobado,
            color: "text-green-600 bg-green-50 border-green-200",
          },
          {
            label: "Premium",
            value: conteos.premium,
            color: "text-purple-600 bg-purple-50 border-purple-200",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-xl px-4 py-3 border text-center ${color}`}
          >
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium opacity-75">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
          />
        </div>
        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white appearance-none cursor-pointer"
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        columns={tecnicosColumns}
        data={tecnicos}
        getRowKey={(t) => t.id}
        loading={loading}
        scrollX
        empty={{
          icon: <Wrench size={40} className="mx-auto opacity-30" />,
          title: "No se encontraron técnicos",
          subtitle: "Prueba cambiando los filtros",
        }}
        rowClassName={(t) => (procesando === t.id ? "opacity-50" : "")}
      />

      {/* Modal de detalle */}
      {tecnicoDetalle && (
        <TecnicoModal
          tecnico={tecnicoDetalle}
          onClose={() => setTecnicoDetalle(null)}
        />
      )}
    </div>
  );
}
