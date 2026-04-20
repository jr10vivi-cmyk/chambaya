import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Wrench,
  Download,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  BarChart2,
} from "lucide-react";
import { useReportes } from "../../hooks/useReportes";
import GraficoDonut from "../../components/reportes/GraficoDonut";
import { exportarCSV } from "../../lib/exportCSV";

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    n || 0,
  );

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short" });

// ── Gráfico de barras diario ───────────────────────────────────────────────────

function GraficoBarras({
  datos,
}: {
  datos: { fecha: string; total: number }[];
}) {
  const visibles = datos.slice(-30);
  const max = Math.max(...visibles.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-1 h-32 mt-4 ">
      {visibles.map((d, i) => {
        const pct = (d.total / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                {fmtFecha(d.fecha)}: {fmt(d.total)}
              </div>
            </div>
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{
                height: `${Math.max(pct, d.total > 0 ? 4 : 1)}%`,
                background:
                  d.total > 0
                    ? "linear-gradient(to top, #f97316, #fb923c)"
                    : "#e5e7eb",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bgColor: string;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon size={18} className={color} />
        </div>
        {sub && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {sub}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ── Distribución por estado ───────────────────────────────────────────────────

const ESTADO_CFG = {
  completado: {
    label: "Completados",
    color: "#22c55e",
    bg: "bg-green-50",
    text: "text-green-700",
    icon: CheckCircle2,
  },
  en_proceso: {
    label: "En proceso",
    color: "#8b5cf6",
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: Loader2,
  },
  aceptado: {
    label: "Aceptados",
    color: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: ShoppingBag,
  },
  pendiente: {
    label: "Pendientes",
    color: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Clock,
  },
  cancelado: {
    label: "Cancelados",
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: XCircle,
  },
} as const;

type EstadoKey = keyof typeof ESTADO_CFG;

// ── Página principal ──────────────────────────────────────────────────────────

const RANGOS = [
  { label: "7 días", value: 7 },
  { label: "15 días", value: 15 },
  { label: "30 días", value: 30 },
  { label: "90 días", value: 90 },
];

export default function AdminReportes() {
  const { data, loading, fetchReportes } = useReportes();
  const [rango, setRango] = useState(30);

  useEffect(() => {
    fetchReportes(rango);
  }, [rango, fetchReportes]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const d = data!;

  // Segmentos donut ingresos
  const segmentosIngresos = [
    { valor: d.totales.comision, color: "#f97316", label: "Comisión" },
    { valor: d.totales.publicidad, color: "#3b82f6", label: "Publicidad" },
    { valor: d.totales.suscripcion, color: "#8b5cf6", label: "Suscripción" },
  ];

  // Segmentos donut solicitudes
  const segmentosSolicitudes = (Object.keys(ESTADO_CFG) as EstadoKey[]).map(
    (k) => ({
      valor: d.porEstado[k] || 0,
      color: ESTADO_CFG[k].color,
      label: ESTADO_CFG[k].label,
    }),
  );

  const handleExport = () => {
    exportarCSV(
      d.ingresosDetalle.map((r) => ({
        fecha: r.fecha ?? "",
        tipo: r.tipo ?? "",
        descripcion: r.descripcion ?? "",
        monto: r.monto,
      })),
      "reporte_ingresos",
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Análisis de actividad y rendimiento de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de rango */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {RANGOS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRango(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  rango === r.value
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Exportar */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Download size={15} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Ingresos del período"
          value={fmt(d.totales.total)}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KpiCard
          icon={TrendingUp}
          label="Promedio diario"
          value={fmt(d.promedioDiario)}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Total solicitudes"
          value={d.totalSolicitudes}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Tasa de completación"
          value={`${d.tasaCompletacion}%`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KpiCard
          icon={Users}
          label="Clientes registrados"
          value={d.totalUsuarios}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <KpiCard
          icon={Wrench}
          label="Técnicos activos"
          value={d.totalTecnicos}
          color="text-orange-500"
          bgColor="bg-orange-50"
        />
      </div>

      {/* ── Gráfico de ingresos por día ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-orange-50 rounded-xl">
            <BarChart2 size={16} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">Ingresos diarios</h3>
          <span className="ml-auto text-sm text-gray-400">
            últimos {rango} días
          </span>
        </div>
        {d.ingresoPorDia.every((x) => x.total === 0) ? (
          <p className="text-center text-gray-400 text-sm py-10">
            Aún no hay ingresos registrados en este período
          </p>
        ) : (
          <GraficoBarras datos={d.ingresoPorDia} />
        )}
      </div>

      {/* ── Donuts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por tipo */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">
            Composición de ingresos
          </h3>
          <div className="flex items-center gap-6">
            <GraficoDonut
              segmentos={segmentosIngresos}
              total={d.totales.total}
              label="total"
            />
            <div className="flex-1 space-y-3">
              {[
                {
                  label: "Comisiones (10%)",
                  valor: d.totales.comision,
                  color: "bg-orange-500",
                },
                {
                  label: "Publicidad",
                  valor: d.totales.publicidad,
                  color: "bg-blue-500",
                },
                {
                  label: "Suscripciones",
                  valor: d.totales.suscripcion,
                  color: "bg-purple-500",
                },
              ].map(({ label, valor, color }) => {
                const pct =
                  d.totales.total > 0
                    ? ((valor / d.totales.total) * 100).toFixed(0)
                    : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-800">
                        {fmt(valor)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`${color} h-1.5 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Solicitudes por estado */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">
            Solicitudes por estado
          </h3>
          {d.totalSolicitudes === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">
              Sin solicitudes en este período
            </p>
          ) : (
            <div className="flex items-center gap-6">
              <GraficoDonut
                segmentos={segmentosSolicitudes}
                total={d.totalSolicitudes}
                label="total"
              />
              <div className="flex-1 space-y-2">
                {(Object.keys(ESTADO_CFG) as EstadoKey[]).map((k) => {
                  const cfg = ESTADO_CFG[k];
                  const cant = d.porEstado[k] || 0;
                  const pct =
                    d.totalSolicitudes > 0
                      ? ((cant / d.totalSolicitudes) * 100).toFixed(0)
                      : 0;
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm mb-1">
                        <span
                          className={`flex items-center gap-1.5 ${cfg.text}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ background: cfg.color }}
                          />
                          {cfg.label}
                        </span>
                        <span className="font-medium text-gray-700">
                          {cant}{" "}
                          <span className="text-gray-400 font-normal">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className="h-1 rounded-full"
                          style={{ width: `${pct}%`, background: cfg.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Top técnicos + Categorías ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top técnicos */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">
            Top técnicos por trabajos
          </h3>
          {d.tecnicosTop.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {d.tecnicosTop.slice(0, 8).map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-gray-400">
                    #{i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                    {t.profiles?.nombre?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {t.profiles?.nombre} {t.profiles?.apellido}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.profiles?.ciudad} · {t.total_trabajos} trabajos ·{" "}
                      {t.total_resenas} reseñas
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                      <Star size={13} fill="currentColor" />
                      {t.calificacion_promedio?.toFixed(1) ?? "—"}
                    </div>
                    {t.es_premium && (
                      <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categorías populares */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">
            Categorías más demandadas
          </h3>
          {d.categoriasPopulares.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {d.categoriasPopulares.map((cat, i) => {
                const max = d.categoriasPopulares[0]?.count || 1;
                const pct = (cat.count / max) * 100;
                const colores = [
                  "bg-orange-500",
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-purple-500",
                  "bg-amber-500",
                  "bg-red-500",
                ];
                return (
                  <div key={cat.nombre}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 font-medium">
                        {cat.nombre}
                      </span>
                      <span className="text-gray-400">
                        {cat.count} técnicos
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${colores[i % colores.length]} h-2 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Detalle de ingresos recientes ── */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Últimos ingresos registrados
          </h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            <Download size={14} />
            Exportar
          </button>
        </div>
        {d.ingresosDetalle.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            Sin ingresos registrados
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-medium">Fecha</th>
                  <th className="text-left px-6 py-3 font-medium">Tipo</th>
                  <th className="text-left px-6 py-3 font-medium">
                    Descripción
                  </th>
                  <th className="text-right px-6 py-3 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {d.ingresosDetalle.map((ing, i) => {
                  const tipoCfg: Record<
                    string,
                    { label: string; color: string }
                  > = {
                    comision: {
                      label: "Comisión",
                      color: "bg-orange-50 text-orange-700",
                    },
                    publicidad: {
                      label: "Publicidad",
                      color: "bg-blue-50 text-blue-700",
                    },
                    suscripcion: {
                      label: "Suscripción",
                      color: "bg-purple-50 text-purple-700",
                    },
                  };
                  const cfg = tipoCfg[ing.tipo ?? ""] ?? {
                    label: ing.tipo ?? "—",
                    color: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500">
                        {ing.fecha ? fmtFecha(ing.fecha) : "—"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                        {ing.descripcion ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {fmt(ing.monto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
