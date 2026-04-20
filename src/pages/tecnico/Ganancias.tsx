import { useGanancias } from "../../hooks/useGanancias";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Percent,
  ChevronUp,
  ChevronDown,
  Minus,
  AlertCircle,
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    n || 0,
  );

// ── Mini gráfico de barras ──────────────────────────────────────────────────
function MiniBar({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.monto), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-orange-500 rounded-t-md transition-all duration-500"
            style={{
              height: `${Math.max((d.monto / max) * 52, d.monto > 0 ? 6 : 2)}px`,
            }}
          />
          <span className="text-[10px] text-gray-400">{d.dia}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tarjeta de KPI ─────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = "orange", badge }) {
  const colors = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {badge}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Variación vs mes anterior ───────────────────────────────────────────────
function Variacion({ v }) {
  if (v === null)
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
        <Minus size={11} /> Sin datos prev.
      </span>
    );
  const num = Number(v);
  const pos = num >= 0;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
      ${pos ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}
    >
      {pos ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(num)}% vs mes ant.
    </span>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function TecnicoGanancias() {
  const { pagos, saldo, kpis, loading, periodo, setPeriodo } = useGanancias();

  const PERIODOS = [
    { key: "semana", label: "7 días" },
    { key: "mes", label: "Este mes" },
    { key: "año", label: "Este año" },
    { key: "todo", label: "Todo" },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Ganancias</h1>
          <p className="text-sm text-gray-500 mt-1">
            El técnico recibe el 90% por cada trabajo completado
          </p>
        </div>

        {/* Saldo disponible */}
        {saldo && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white min-w-[180px]">
            <p className="text-xs font-medium opacity-80 mb-1">
              Saldo disponible
            </p>
            <p className="text-2xl font-bold">{fmt(saldo.saldo_disponible)}</p>
            <p className="text-xs opacity-70 mt-1">
              Total histórico: {fmt(saldo.saldo_total)}
            </p>
          </div>
        )}
      </div>

      {/* Selector de período */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition
              ${periodo === p.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total ganado"
          value={fmt(kpis?.totalGanado)}
          color="green"
          badge={<Variacion v={kpis?.variacion} />}
        />
        <KpiCard
          icon={Briefcase}
          label="Trabajos pagados"
          value={kpis?.cantidadTrabajos ?? 0}
          sub={`Promedio: ${fmt(kpis?.promedio)}`}
          color="orange"
        />
        <KpiCard
          icon={TrendingUp}
          label="Total facturado"
          value={fmt(kpis?.totalFacturado)}
          sub="Antes de comisión"
          color="blue"
        />
        <KpiCard
          icon={Percent}
          label="Comisión ChambaYA"
          value={fmt(kpis?.totalComision)}
          sub="10% por servicio"
          color="red"
        />
      </div>

      {/* Gráfico de 7 días */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-orange-50 rounded-xl">
            <TrendingUp size={18} className="text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-800">
            Ganancias últimos 7 días
          </h3>
        </div>
        {kpis?.graficoDias?.every((d) => d.monto === 0) ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Sin ganancias en este período
          </p>
        ) : (
          <MiniBar data={kpis?.graficoDias} />
        )}
      </div>

      {/* Banner informativo sobre la comisión */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle
          size={18}
          className="text-amber-500 flex-shrink-0 mt-0.5"
        />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            ¿Cómo funciona el pago?
          </p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Cuando el cliente confirma que el trabajo fue completado, ChambaYA
            retiene el <strong>10%</strong> como comisión de plataforma y el
            restante <strong>90%</strong> se acredita a tu saldo disponible. El
            pago se procesa de forma segura dentro de la plataforma.
          </p>
        </div>
      </div>

      {/* Historial de pagos */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800">Historial de pagos</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {pagos.length} registro{pagos.length !== 1 ? "s" : ""}
          </p>
        </div>

        {pagos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <DollarSign size={36} className="text-gray-200 mb-3" />
            <p className="font-medium text-gray-500">
              Sin pagos en este período
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Completa trabajos para ver tus ganancias aquí
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pagos.map((pago) => {
              const clienteNombre =
                `${pago.profiles?.nombre || ""} ${pago.profiles?.apellido || ""}`.trim();
              return (
                <div
                  key={pago.id}
                  className="px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Info servicio */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">
                        {clienteNombre?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {pago.solicitudes?.titulo || "Servicio completado"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {clienteNombre || "Cliente"} ·{" "}
                          {new Date(pago.creado_en).toLocaleDateString(
                            "es-PE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Montos */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-green-600">
                        {fmt(pago.monto_tecnico)}
                      </p>
                      <p className="text-xs text-gray-400">
                        de {fmt(pago.monto_total)} · comisión{" "}
                        {fmt(pago.comision)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de desglose */}
                  <div className="mt-3 bg-gray-100 rounded-full h-1.5 ">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: "90%" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Tú recibiste (90%)</span>
                    <span>ChambaYA (10%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
