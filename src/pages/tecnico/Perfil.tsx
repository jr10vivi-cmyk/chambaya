import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "../../lib/leafletFix";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  DollarSign,
  Briefcase,
  Tag,
  Camera,
  Save,
  Crown,
  Star,
  CheckCircle,
  AlertCircle,
  Shield,
  LocateFixed,
  Loader2,
  FileText,
  Upload,
} from "lucide-react";

// Selector de ubicación en mapa
function LocationPicker({ lat, lng, onChange }) {
  function ClickHandler() {
    useMapEvents({
      click: (e) => onChange(e.latlng.lat, e.latlng.lng),
    });
    return null;
  }
  return (
    <MapContainer
      center={lat && lng ? [lat, lng] : [-13.1588, -74.2236]}
      zoom={14}
      style={{ height: "220px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler />
      {lat && lng && <Marker position={[lat, lng]} />}
    </MapContainer>
  );
}

// Sección colapsable
function Seccion({ titulo, icono: Icon, color, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 ">
      <div
        className={`flex items-center gap-3 px-6 py-4 border-b border-gray-50 ${color}`}
      >
        <div className="p-1.5 rounded-lg bg-white/60">
          <Icon size={17} />
        </div>
        <h2 className="font-semibold text-sm">{titulo}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Campo({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT =
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";

export default function TecnicoPerfil() {
  const { profile, tecnico, refreshProfile } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [catsSelec, setCatsSelec] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const fileRef = useRef();

  // Datos personales
  const [personal, setPersonal] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    ciudad: "",
    departamento: "",
  });

  // Datos profesionales
  const [prof, setProf] = useState({
    descripcion: "",
    experiencia_anos: 0,
    tarifa_hora: "",
    tarifa_minima: "",
    radio_servicio_km: 10,
    disponible: true,
    lat: null,
    lng: null,
  });

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    if (profile) {
      setPersonal({
        nombre: profile.nombre || "",
        apellido: profile.apellido || "",
        telefono: profile.telefono || "",
        ciudad: profile.ciudad || "",
        departamento: profile.departamento || "",
      });
      setAvatarUrl(profile.avatar_url);
    }
    if (tecnico) {
      setProf({
        descripcion: tecnico.descripcion || "",
        experiencia_anos: tecnico.experiencia_anos || 0,
        tarifa_hora: tecnico.tarifa_hora || "",
        tarifa_minima: tecnico.tarifa_minima || "",
        radio_servicio_km: tecnico.radio_servicio_km || 10,
        disponible: tecnico.disponible ?? true,
        lat: tecnico.lat || null,
        lng: tecnico.lng || null,
      });
    }
    // Cargar categorías
    supabase
      .from("categorias")
      .select("*")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => setCategorias(data || []));
    // Categorías seleccionadas del técnico
    if (profile?.id) {
      supabase
        .from("tecnico_categorias")
        .select("categoria_id")
        .eq("tecnico_id", profile.id)
        .then(({ data }) =>
          setCatsSelec(data?.map((c) => c.categoria_id) || []),
        );
    }
  }, [profile, tecnico]);

  // Subir avatar
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagen máx. 2MB");
      return;
    }
    setSubiendo(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${profile.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);
      setAvatarUrl(publicUrl);
      toast.success("Foto actualizada ✓");
    } catch (err) {
      toast.error("Error al subir imagen");
    } finally {
      setSubiendo(false);
    }
  };

  // Obtener ubicación actual
  const handleGPS = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProf((p) => ({
          ...p,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        setLocLoading(false);
        toast.success("Ubicación obtenida ✓");
      },
      () => {
        toast.error("No se pudo obtener la ubicación");
        setLocLoading(false);
      },
    );
  };

  // Toggle categoría
  const toggleCat = (id) => {
    setCatsSelec((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  // Guardar todo
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!personal.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (catsSelec.length === 0) {
      toast.error("Selecciona al menos una categoría");
      return;
    }
    setGuardando(true);

    try {
      // 1. Actualizar perfil personal
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ ...personal, actualizado_en: new Date().toISOString() })
        .eq("id", profile.id);
      if (pErr) throw pErr;

      // 2. Actualizar datos de técnico
      const { error: tErr } = await supabase
        .from("tecnicos")
        .update({
          descripcion: prof.descripcion,
          experiencia_anos: Number(prof.experiencia_anos) || 0,
          tarifa_hora: prof.tarifa_hora ? Number(prof.tarifa_hora) : null,
          tarifa_minima: prof.tarifa_minima ? Number(prof.tarifa_minima) : null,
          radio_servicio_km: Number(prof.radio_servicio_km) || 10,
          disponible: prof.disponible,
          lat: prof.lat,
          lng: prof.lng,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", profile.id);
      if (tErr) throw tErr;

      // 3. Sincronizar categorías (borrar y reinsertar)
      await supabase
        .from("tecnico_categorias")
        .delete()
        .eq("tecnico_id", profile.id);
      if (catsSelec.length > 0) {
        await supabase
          .from("tecnico_categorias")
          .insert(
            catsSelec.map((cid) => ({
              tecnico_id: profile.id,
              categoria_id: cid,
            })),
          );
      }

      await refreshProfile();
      toast.success("✅ Perfil actualizado");
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const inicial = personal.nombre?.[0]?.toUpperCase() || "?";

  return (
    <form onSubmit={handleGuardar} className="max-w-2xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Un perfil completo recibe hasta 3× más solicitudes
          </p>
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          {guardando ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save size={15} /> Guardar cambios
            </>
          )}
        </button>
      </div>

      {/* ── Estado de verificación ── */}
      {tecnico && (
        <div
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-medium
          ${
            {
              aprobado: "bg-green-50 border-green-200 text-green-800",
              pendiente: "bg-amber-50 border-amber-200 text-amber-800",
              rechazado: "bg-red-50 border-red-200 text-red-800",
              suspendido: "bg-gray-100 border-gray-200 text-gray-700",
            }[tecnico.estado_verificacion] || ""
          }`}
        >
          {
            {
              aprobado: (
                <>
                  <Shield size={16} className="text-green-500" /> Cuenta
                  verificada y activa
                </>
              ),
              pendiente: (
                <>
                  <AlertCircle size={16} className="text-amber-500" /> En
                  revisión por el equipo ChambaYA
                </>
              ),
              rechazado: (
                <>
                  <AlertCircle size={16} className="text-red-500" /> Cuenta no
                  aprobada — contacta soporte
                </>
              ),
              suspendido: (
                <>
                  <AlertCircle size={16} /> Cuenta suspendida
                </>
              ),
            }[tecnico.estado_verificacion]
          }
        </div>
      )}

      {/* ── Avatar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center ">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-orange-600">
                  {inicial}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-md transition"
            >
              {subiendo ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Camera size={13} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {personal.nombre} {personal.apellido}
            </p>
            <p className="text-sm text-gray-400">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    className={
                      n <= Math.round(tecnico?.calificacion_promedio || 0)
                        ? "text-amber-400"
                        : "text-gray-200"
                    }
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {tecnico?.calificacion_promedio?.toFixed(1) || "Nuevo"}
              </span>
              <span className="text-xs text-gray-400">
                · {tecnico?.total_trabajos || 0} trabajos
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-orange-500 hover:underline mt-1 block"
            >
              Cambiar foto de perfil
            </button>
          </div>
        </div>
      </div>

      {/* ── Datos personales ── */}
      <Seccion
        titulo="Datos personales"
        icono={User}
        color="text-blue-600 bg-blue-50"
      >
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nombre *">
            <input
              required
              value={personal.nombre}
              onChange={(e) =>
                setPersonal((p) => ({ ...p, nombre: e.target.value }))
              }
              className={INPUT}
              placeholder="Tu nombre"
            />
          </Campo>
          <Campo label="Apellido">
            <input
              value={personal.apellido}
              onChange={(e) =>
                setPersonal((p) => ({ ...p, apellido: e.target.value }))
              }
              className={INPUT}
              placeholder="Tu apellido"
            />
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Campo label="Teléfono" hint="Oculto para clientes por seguridad">
            <input
              type="tel"
              value={personal.telefono}
              onChange={(e) =>
                setPersonal((p) => ({ ...p, telefono: e.target.value }))
              }
              className={INPUT}
              placeholder="999 999 999"
            />
          </Campo>
          <Campo label="Distrito / Ciudad">
            <select
              value={personal.ciudad}
              onChange={(e) =>
                setPersonal((p) => ({ ...p, ciudad: e.target.value }))
              }
              className={INPUT}
            >
              <option value="">Selecciona tu distrito</option>
              <optgroup label="Huamanga (Ayacucho)">
                {[
                  "Huamanga",
                  "Acos Vinchos",
                  "Carmen Alto",
                  "Chiara",
                  "Jesús Nazareno",
                  "Ocros",
                  "Pacaycasa",
                  "Quinua",
                  "San José de Ticllas",
                  "San Juan Bautista",
                  "Santiago de Pischa",
                  "Socos",
                  "Tambillo",
                  "Vinchos",
                  "Andrés Avelino Cáceres",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Otras provincias de Ayacucho">
                {[
                  "Huanta",
                  "Ayahuanco",
                  "San Miguel",
                  "Cangallo",
                  "Vilcashuamán",
                  "Puquio",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Otras ciudades del Perú">
                {[
                  "Lima",
                  "Cusco",
                  "Arequipa",
                  "Trujillo",
                  "Piura",
                  "Chiclayo",
                  "Iquitos",
                  "Huancayo",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </optgroup>
            </select>
          </Campo>
        </div>
        <div className="mt-4">
          <Campo label="Departamento">
            <select
              value={personal.departamento}
              onChange={(e) =>
                setPersonal((p) => ({ ...p, departamento: e.target.value }))
              }
              className={INPUT}
            >
              <option value="">Selecciona tu departamento</option>
              {[
                "Ayacucho",
                "Amazonas",
                "Áncash",
                "Apurímac",
                "Arequipa",
                "Cajamarca",
                "Callao",
                "Cusco",
                "Huancavelica",
                "Huánuco",
                "Ica",
                "Junín",
                "La Libertad",
                "Lambayeque",
                "Lima",
                "Loreto",
                "Madre de Dios",
                "Moquegua",
                "Pasco",
                "Piura",
                "Puno",
                "San Martín",
                "Tacna",
                "Tumbes",
                "Ucayali",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Seccion>

      {/* ── Datos profesionales ── */}
      <Seccion
        titulo="Información profesional"
        icono={Briefcase}
        color="text-orange-600 bg-orange-50"
      >
        <div className="space-y-4">
          <Campo
            label="Descripción de tus servicios *"
            hint="Cuéntale a los clientes qué haces y tu experiencia. Mín. 50 caracteres."
          >
            <textarea
              value={prof.descripcion}
              rows={4}
              onChange={(e) =>
                setProf((p) => ({ ...p, descripcion: e.target.value }))
              }
              placeholder="Ej: Electricista con 8 años de experiencia en instalaciones residenciales y comerciales. Especializado en paneles eléctricos, iluminación LED y sistemas de seguridad..."
              className={INPUT + " resize-none"}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {prof.descripcion.length} caracteres
            </p>
          </Campo>

          <div className="grid grid-cols-3 gap-4">
            <Campo label="Años de experiencia">
              <input
                type="number"
                min={0}
                max={50}
                value={prof.experiencia_anos}
                onChange={(e) =>
                  setProf((p) => ({ ...p, experiencia_anos: e.target.value }))
                }
                className={INPUT}
              />
            </Campo>
            <Campo label="Tarifa por hora (S/)">
              <input
                type="number"
                min={0}
                step="0.50"
                value={prof.tarifa_hora}
                onChange={(e) =>
                  setProf((p) => ({ ...p, tarifa_hora: e.target.value }))
                }
                className={INPUT}
                placeholder="35.00"
              />
            </Campo>
            <Campo label="Tarifa mínima (S/)">
              <input
                type="number"
                min={0}
                step="0.50"
                value={prof.tarifa_minima}
                onChange={(e) =>
                  setProf((p) => ({ ...p, tarifa_minima: e.target.value }))
                }
                className={INPUT}
                placeholder="50.00"
              />
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Radio de servicio (km)">
              <select
                value={prof.radio_servicio_km}
                onChange={(e) =>
                  setProf((p) => ({ ...p, radio_servicio_km: e.target.value }))
                }
                className={INPUT}
              >
                {[2, 5, 10, 20, 50].map((r) => (
                  <option key={r} value={r}>
                    {r} km
                  </option>
                ))}
              </select>
            </Campo>

            <Campo label="Disponibilidad">
              <div
                onClick={() =>
                  setProf((p) => ({ ...p, disponible: !p.disponible }))
                }
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition
                  ${prof.disponible ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"}`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${prof.disponible ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                >
                  {prof.disponible && (
                    <CheckCircle size={12} className="text-white" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${prof.disponible ? "text-green-700" : "text-gray-500"}`}
                  >
                    {prof.disponible ? "Disponible" : "No disponible"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Los clientes pueden encontrarte
                  </p>
                </div>
              </div>
            </Campo>
          </div>
        </div>
      </Seccion>

      {/* ── Categorías ── */}
      <Seccion
        titulo="Categorías de servicio *"
        icono={Tag}
        color="text-purple-600 bg-purple-50"
      >
        <p className="text-xs text-gray-400 mb-4">
          Selecciona todos los oficios que ofreces. Aparecerás en los resultados
          de búsqueda de cada categoría.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categorias.map((cat) => {
            const sel = catsSelec.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCat(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition
                  ${
                    sel
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                  ${sel ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}
                >
                  {sel && <CheckCircle size={12} className="text-white" />}
                </div>
                {cat.nombre}
              </button>
            );
          })}
        </div>
        {catsSelec.length > 0 && (
          <p className="text-xs text-orange-600 font-medium mt-3">
            ✓ {catsSelec.length} categoría{catsSelec.length > 1 ? "s" : ""}{" "}
            seleccionada{catsSelec.length > 1 ? "s" : ""}
          </p>
        )}
      </Seccion>

      {/* ── Ubicación ── */}
      <Seccion
        titulo="Tu ubicación en el mapa"
        icono={MapPin}
        color="text-teal-600 bg-teal-50"
      >
        <p className="text-xs text-gray-400 mb-4">
          Los clientes te encontrarán en el mapa. Haz clic en el mapa o usa tu
          GPS para marcar tu zona de trabajo.
        </p>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={handleGPS}
            disabled={locLoading}
            className="flex items-center gap-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl hover:bg-teal-100 transition"
          >
            {locLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LocateFixed size={14} />
            )}
            Usar mi ubicación actual
          </button>
          {prof.lat && prof.lng && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <CheckCircle size={13} className="text-green-500" />
              {prof.lat.toFixed(4)}, {prof.lng.toFixed(4)}
            </div>
          )}
        </div>
        <LocationPicker
          lat={prof.lat}
          lng={prof.lng}
          onChange={(lat, lng) => setProf((p) => ({ ...p, lat, lng }))}
        />
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Shield size={11} />
          Tu ubicación exacta no es visible para los clientes, solo tu zona
          aproximada.
        </p>
      </Seccion>

      {/* ── Suscripción Premium ── */}
      {!tecnico?.es_premium ? (
        <Seccion
          titulo="Plan Premium"
          icono={Crown}
          color="text-amber-600 bg-amber-50"
        >
          <p className="text-sm text-gray-600 mb-5">
            Destácate sobre la competencia y recibe más clientes con el plan
            Premium.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { plan: "mensual", precio: 29.9, label: "1 mes", ahorro: null },
              {
                plan: "trimestral",
                precio: 79.9,
                label: "3 meses",
                ahorro: "11%",
              },
              {
                plan: "anual",
                precio: 249.9,
                label: "12 meses",
                ahorro: "30%",
              },
            ].map(({ plan, precio, label, ahorro }) => (
              <div
                key={plan}
                className="border-2 border-gray-200 hover:border-amber-400 rounded-xl p-4 text-center cursor-pointer transition group"
              >
                {ahorro && (
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                    Ahorra {ahorro}
                  </div>
                )}
                <p className="font-bold text-gray-900 text-2xl">S/{precio}</p>
                <p className="text-sm text-gray-500">{label}</p>
                <ul className="text-xs text-gray-500 mt-3 space-y-1 text-left">
                  <li>✓ Etiqueta Premium visible</li>
                  <li>✓ Primero en búsquedas</li>
                  <li>✓ Más visibilidad</li>
                </ul>
                <button
                  type="button"
                  className="mt-4 w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 rounded-xl text-sm transition"
                >
                  Suscribirme
                </button>
              </div>
            ))}
          </div>
        </Seccion>
      ) : (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown size={24} fill="white" />
            <div>
              <p className="font-bold">¡Eres Premium! ⭐</p>
              <p className="text-sm text-white/80">
                Activo hasta{" "}
                {new Date(tecnico.premium_hasta).toLocaleDateString("es-PE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <CheckCircle size={28} className="text-white/80" fill="white" />
        </div>
      )}

      {/* ── Verificación de identidad ── */}
      {tecnico?.estado_verificacion !== "aprobado" && (
        <Seccion
          titulo="Verificación de identidad"
          icono={FileText}
          color="text-blue-600 bg-blue-50"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Para recibir solicitudes pagas debes verificar tu identidad con tu
              DNI. El proceso toma hasta 48 horas.
            </p>
            {tecnico?.notas_verificacion &&
              tecnico.estado_verificacion === "rechazado" && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <span className="font-semibold">Motivo del rechazo: </span>
                  {tecnico.notas_verificacion}
                </div>
              )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Número de DNI">
                <input
                  type="text"
                  maxLength={8}
                  pattern="\d{8}"
                  placeholder="12345678"
                  defaultValue={tecnico?.dni || ""}
                  id="input-dni"
                  className={INPUT}
                />
              </Campo>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Foto del DNI (frontal)
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl p-6 cursor-pointer transition">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Haz clic para subir
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const path = `dni/${tecnico?.id}/${Date.now()}_dni.jpg`;
                      const { error } = await supabase.storage
                        .from("documentos-identidad")
                        .upload(path, file, { upsert: true });
                      if (!error) toast.success("Foto DNI subida");
                      else toast.error("Error al subir foto");
                    }}
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Selfie sosteniendo el DNI
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl p-6 cursor-pointer transition">
                  <Camera size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Haz clic para subir
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const path = `selfie/${tecnico?.id}/${Date.now()}_selfie.jpg`;
                      const { error } = await supabase.storage
                        .from("documentos-identidad")
                        .upload(path, file, { upsert: true });
                      if (!error) toast.success("Selfie subida");
                      else toast.error("Error al subir selfie");
                    }}
                  />
                </label>
              </div>
            </div>
            {tecnico?.estado_verificacion === "pendiente" ? (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertCircle size={15} /> Solicitud enviada — revisión en hasta
                48 horas.
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  const dniVal = (
                    document.getElementById("input-dni") as HTMLInputElement
                  )?.value;
                  if (!dniVal || dniVal.length !== 8) {
                    toast.error("Ingresa un DNI válido de 8 dígitos");
                    return;
                  }
                  const { error } = await supabase.rpc(
                    "solicitar_verificacion",
                    {
                      p_tecnico_id: tecnico?.id,
                      p_dni: dniVal,
                      p_foto_dni_url: "",
                      p_foto_selfie_url: "",
                    },
                  );
                  if (!error)
                    toast.success(
                      "Solicitud de verificación enviada. Revisión en 48 horas.",
                    );
                  else toast.error("Error al enviar solicitud");
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
              >
                <Shield size={14} /> Solicitar verificación
              </button>
            )}
          </div>
        </Seccion>
      )}

      {/* ── Botón guardar final ── */}
      <div className="flex justify-end pb-6">
        <button
          type="submit"
          disabled={guardando}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-8 py-3 rounded-xl transition shadow-lg shadow-orange-200"
        >
          {guardando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save size={16} /> Guardar perfil
            </>
          )}
        </button>
      </div>
    </form>
  );
}
