import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, Circle } from "react-leaflet";
import { useTecnicos } from "../../hooks/useTecnicos";
import TecnicoCard from "../../components/tecnico/TecnicoCard";
import TecnicoMarker from "../../components/mapa/TecnicoMarker";
import "../../lib/leafletFix";
import {
  Search,
  MapPin,
  Sliders,
  Star,
  ChevronDown,
  List,
  Map,
  Loader2,
  X,
  LocateFixed,
} from "lucide-react";

// Sub-componente: centrar mapa cuando cambia la ubicación
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || 13, { animate: true });
  }, [center, zoom]);
  return null;
}

// Opciones de radio de búsqueda
const RADIOS = [
  { label: "2 km", value: 2 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "20 km", value: 20 },
  { label: "Todo", value: null },
];

const CALIFICACIONES = [
  { label: "Cualquiera", value: 0 },
  { label: "⭐ 3+", value: 3 },
  { label: "⭐ 4+", value: 4 },
  { label: "⭐ 4.5+", value: 4.5 },
];

export default function ClienteBuscar() {
  // Ubicación del usuario
  const [userPos, setUserPos] = useState(null);
  const [locError, setLocError] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Vista actual: mapa o lista
  const [vista, setVista] = useState("ambos"); // 'mapa' | 'lista' | 'ambos'

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [radioKm, setRadioKm] = useState(10);
  const [calificacionMin, setCalMin] = useState(0);
  const [showFiltros, setShowFiltros] = useState(false);

  // Técnico seleccionado en mapa
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);

  const { tecnicos, loading, categorias } = useTecnicos({
    busqueda,
    categoriaId: categoriaId || undefined,
    userLat: userPos?.lat,
    userLng: userPos?.lng,
    radioKm: radioKm || undefined,
    calificacionMin: calificacionMin || undefined,
  });

  // Posición por defecto: Ayacucho, Perú
  const DEFAULT_CENTER = [-13.1588, -74.2236];
  const mapCenter = userPos ? [userPos.lat, userPos.lng] : DEFAULT_CENTER;

  // Obtener geolocalización del usuario
  const handleLocate = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        setLocError(false);
      },
      () => {
        setLocError(true);
        setLocLoading(false);
      },
    );
  };

  // Auto-localizar al cargar si el navegador lo permite
  useEffect(() => {
    navigator.permissions?.query({ name: "geolocation" }).then((p) => {
      if (p.state === "granted") handleLocate();
    });
  }, []);

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(busquedaInput), 400);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  const premiums = tecnicos.filter((t) => t.es_premium);
  const normales = tecnicos.filter((t) => !t.es_premium);

  return (
    <div className="flex flex-col h-full -m-4 md:-m-8">
      {/* ── Barra de búsqueda y filtros ── */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 z-10 flex-shrink-0">
        {/* Fila 1: búsqueda + botones */}
        <div className="flex gap-2 mb-2">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar técnico, oficio..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 focus:bg-white transition"
            />
            {busquedaInput && (
              <button
                onClick={() => {
                  setBusquedaInput("");
                  setBusqueda("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros avanzados */}
          <button
            onClick={() => setShowFiltros((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition
              ${showFiltros ? "bg-orange-50 border-orange-300 text-orange-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Sliders size={15} />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          {/* Ubicación */}
          <button
            onClick={handleLocate}
            disabled={locLoading}
            title="Usar mi ubicación"
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm font-medium transition
              ${userPos ? "bg-green-50 border-green-300 text-green-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}
              ${locLoading ? "opacity-60" : ""}`}
          >
            {locLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LocateFixed size={15} />
            )}
            <span className="hidden sm:inline">
              {userPos ? "Ubicado" : "Mi ubicación"}
            </span>
          </button>

          {/* Toggle vista (solo móvil/tablet) */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden lg:hidden">
            <button
              onClick={() => setVista("mapa")}
              className={`px-3 py-2.5 text-sm transition ${vista === "mapa" ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Map size={15} />
            </button>
            <button
              onClick={() => setVista("lista")}
              className={`px-3 py-2.5 text-sm transition ${vista === "lista" ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Fila 2: filtros rápidos de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoriaId("")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition
              ${!categoriaId ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setCategoriaId(cat.id === categoriaId ? "" : cat.id)
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition
                ${categoriaId === cat.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Panel de filtros avanzados */}
        {showFiltros && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Radio */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                <MapPin size={11} className="inline mr-1" />
                Radio de búsqueda
              </label>
              <div className="flex gap-1 flex-wrap">
                {RADIOS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRadioKm(r.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition
                      ${radioKm === r.value ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calificación mínima */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                <Star size={11} className="inline mr-1" />
                Calificación mínima
              </label>
              <div className="flex gap-1 flex-wrap">
                {CALIFICACIONES.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => setCalMin(c.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition
                      ${calificacionMin === c.value ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resultado count */}
        {!loading && (
          <p className="text-xs text-gray-400 mt-2">
            {tecnicos.length === 0
              ? "Sin resultados"
              : `${tecnicos.length} técnico${tecnicos.length > 1 ? "s" : ""} encontrado${tecnicos.length > 1 ? "s" : ""}
                 ${premiums.length ? ` · ${premiums.length} premium` : ""}`}
          </p>
        )}
      </div>

      {/* ── Contenido: mapa + lista ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Lista de técnicos */}
        <div
          className={`flex-shrink-0 overflow-y-auto bg-gray-50
          ${vista === "mapa" ? "hidden lg:block" : "block"}
          ${vista === "lista" ? "w-full" : "w-full lg:w-96"}
          `}
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Buscando técnicos...</p>
              </div>
            </div>
          ) : tecnicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-2xl">
                🔍
              </div>
              <p className="font-semibold text-gray-700 mb-1">
                Sin técnicos disponibles
              </p>
              <p className="text-sm text-gray-400">
                Prueba cambiando los filtros o amplía el radio de búsqueda
              </p>
              <button
                onClick={() => {
                  setCategoriaId("");
                  setBusqueda("");
                  setBusquedaInput("");
                  setRadioKm(null);
                }}
                className="mt-4 text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Premium primero */}
              {premiums.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 px-1">
                    ⭐ Premium
                  </p>
                  <div className="space-y-3">
                    {premiums.map((t) => (
                      <TecnicoCard key={t.id} tecnico={t} destacado />
                    ))}
                  </div>
                </div>
              )}

              {/* Técnicos normales */}
              {normales.length > 0 && (
                <div>
                  {premiums.length > 0 && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                      Otros técnicos
                    </p>
                  )}
                  <div className="space-y-3">
                    {normales.map((t) => (
                      <TecnicoCard key={t.id} tecnico={t} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mapa */}
        <div
          className={`flex-1
          ${vista === "lista" ? "hidden lg:block" : "block"}
        `}
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%", minHeight: "400px" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={mapCenter} zoom={userPos ? 13 : 12} />

            {/* Círculo de radio del usuario */}
            {userPos && radioKm && (
              <Circle
                center={[userPos.lat, userPos.lng]}
                radius={radioKm * 1000}
                pathOptions={{
                  color: "#f97316",
                  fillColor: "#f97316",
                  fillOpacity: 0.05,
                  weight: 1.5,
                  dashArray: "6 4",
                }}
              />
            )}

            {/* Marcador del usuario */}
            {userPos && (
              <TecnicoMarker
                tecnico={{
                  id: "user",
                  lat: userPos.lat,
                  lng: userPos.lng,
                  profiles: { nombre: "Tú", ciudad: "Tu ubicación" },
                  tecnico_categorias: [],
                  es_premium: false,
                }}
              />
            )}

            {/* Marcadores de técnicos */}
            {tecnicos.map((t) => (
              <TecnicoMarker key={t.id} tecnico={t} />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
