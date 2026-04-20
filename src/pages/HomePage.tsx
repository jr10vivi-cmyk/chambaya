import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Search,
  Star,
  Shield,
  Zap,
  MapPin,
  MessageCircle,
  CheckCircle,
  Crown,
  ChevronRight,
  Hammer,
  Droplets,
  Flame,
  Monitor,
  Wind,
  Key,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

// ── Datos estáticos ───────────────────────────────────────────

const CATEGORIAS = [
  { icon: Zap, nombre: "Electricista", color: "from-amber-400 to-orange-500" },
  { icon: Droplets, nombre: "Plomero", color: "from-blue-400 to-cyan-500" },
  { icon: Hammer, nombre: "Carpintero", color: "from-orange-400 to-red-500" },
  { icon: Flame, nombre: "Gasfitero", color: "from-red-400 to-pink-500" },
  {
    icon: Monitor,
    nombre: "Técnico PC",
    color: "from-purple-400 to-violet-500",
  },
  { icon: Wind, nombre: "Aire Acond.", color: "from-teal-400 to-cyan-500" },
  { icon: Key, nombre: "Cerrajero", color: "from-slate-400 to-gray-600" },
  {
    icon: Wrench,
    nombre: "Más oficios...",
    color: "from-gray-400 to-slate-500",
  },
];

const PASOS = [
  {
    num: "01",
    titulo: "Describe tu problema",
    desc: "Cuéntanos qué necesitas arreglar o instalar. Solo toma un minuto.",
    color: "bg-orange-50 border-orange-200",
    numColor: "text-orange-500",
  },
  {
    num: "02",
    titulo: "Elige tu técnico",
    desc: "Revisa perfiles, calificaciones y tarifas. Filtra por ubicación en el mapa.",
    color: "bg-blue-50 border-blue-200",
    numColor: "text-blue-500",
  },
  {
    num: "03",
    titulo: "Recibe el servicio",
    desc: "El técnico llega a tu puerta. Chat integrado para coordinar sin salir de la app.",
    color: "bg-purple-50 border-purple-200",
    numColor: "text-purple-500",
  },
  {
    num: "04",
    titulo: "Paga seguro y califica",
    desc: "El pago se libera solo cuando confirmas que el trabajo está bien hecho.",
    color: "bg-green-50 border-green-200",
    numColor: "text-green-600",
  },
];

const TESTIMONIOS = [
  {
    nombre: "Rosa Flores",
    ciudad: "Ayacucho",
    texto:
      "Encontré un electricista en 10 minutos. El trabajo quedó perfecto y el pago fue seguro. ¡Increíble plataforma!",
    estrellas: 5,
    inicial: "R",
    color: "bg-rose-100 text-rose-600",
  },
  {
    nombre: "Carlos Mamani",
    ciudad: "Huanta",
    texto:
      "Como técnico, ChambaYA me consiguió 3 trabajos en la primera semana. El sistema de pagos es transparente.",
    estrellas: 5,
    inicial: "C",
    color: "bg-blue-100 text-blue-600",
  },
  {
    nombre: "Ana Quispe",
    ciudad: "Ayacucho",
    texto:
      "El mapa para encontrar técnicos cercanos es genial. Encontré uno a 2 km de mi casa con 4.9 estrellas.",
    estrellas: 5,
    inicial: "A",
    color: "bg-green-100 text-green-600",
  },
];

const STATS = [
  { valor: "500+", label: "Técnicos verificados" },
  { valor: "2,800+", label: "Servicios completados" },
  { valor: "4.8★", label: "Calificación promedio" },
  { valor: "15+", label: "Categorías de oficios" },
];

// ── Hook de animación al scroll ────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Componentes ────────────────────────────────────────────────
// Reemplaza la función Navbar en HomePage.jsx
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #f1f0eb",
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              background: "#f97316",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(249,115,22,0.35)",
            }}
          >
            <Wrench size={18} />
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 900,
              fontSize: "20px",
              color: "#111",
              letterSpacing: "-0.5px",
            }}
          >
            Chamba<span style={{ color: "#f97316" }}>YA</span>
          </span>
        </Link>

        {/* Links - ocultos en móvil via JS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            fontSize: "13px",
            fontWeight: 500,
          }}
          className="nav-desktop-links"
        >
          {[
            "#como-funciona:Cómo funciona",
            "#categorias:Categorías",
            "#tecnicos:Para técnicos",
          ].map((item) => {
            const [href, label] = item.split(":");
            return (
              <a
                key={href}
                href={href}
                style={{
                  color: "#555",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#f97316")}
                onMouseLeave={(e) => (e.target.style.color = "#555")}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            to="/login"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#333",
              textDecoration: "none",
              padding: "8px 14px",
              borderRadius: "10px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f4")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            style={{
              background: "#f97316",
              color: "white",
              fontSize: "13px",
              fontWeight: 700,
              padding: "9px 20px",
              borderRadius: "11px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
              transition: "all 0.15s",
            }}
          >
            Únete gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Reemplaza la función Hero en HomePage.jsx
function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "64px",
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(135deg, #fffbf5 0%, #ffffff 50%, #fffbeb 100%)",
      }}
    >
      {/* Fondo decorativo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at 15% 50%, rgba(251,146,60,0.15) 0%, transparent 50%),
                     radial-gradient(circle at 85% 20%, rgba(251,191,36,0.1) 0%, transparent 40%)`,
        }}
      />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "60px 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "48px",
          alignItems: "center",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Columna izquierda */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "#fff7ed",
              color: "#c2410c",
              border: "1px solid #fed7aa",
              padding: "7px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
              marginBottom: "20px",
              letterSpacing: "0.02em",
            }}
          >
            <Zap size={13} fill="currentColor" />
            La plataforma #1 de técnicos en Perú
          </div>

          {/* Título */}
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(36px, 5vw, 58px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#111",
              marginBottom: "20px",
              letterSpacing: "-1.5px",
            }}
          >
            Tu técnico
            <br />
            <span style={{ color: "#f97316", position: "relative" }}>
              de confianza
              <svg
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  left: 0,
                  width: "100%",
                }}
                viewBox="0 0 300 10"
                fill="none"
              >
                <path
                  d="M2 7 Q75 2 150 6 Q225 10 298 4"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
            </span>
            <br />a un clic
          </h1>

          {/* Subtítulo */}
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              lineHeight: 1.7,
              marginBottom: "28px",
              maxWidth: "440px",
            }}
          >
            Conectamos clientes con técnicos verificados. Electricistas,
            plomeros, carpinteros y más — rápido, seguro y transparente.
          </p>

          {/* Buscador */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "6px",
              display: "flex",
              gap: "6px",
              boxShadow: "0 8px 30px rgba(249,115,22,0.12)",
              border: "1px solid #fed7aa",
              maxWidth: "440px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 12px",
              }}
            >
              <Search size={15} style={{ color: "#aaa", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="¿Qué servicio necesitas?"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  color: "#333",
                  background: "transparent",
                }}
              />
            </div>
            <Link
              to="/registro"
              style={{
                background: "#f97316",
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                padding: "11px 20px",
                borderRadius: "11px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Buscar <ArrowRight size={14} />
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Avatares */}
            <div style={{ display: "flex", flexDirection: "row" }}>
              {[
                { ini: "JR", bg: "#fed7aa", c: "#c2410c" },
                { ini: "MC", bg: "#dbeafe", c: "#1e40af" },
                { ini: "PH", bg: "#d1fae5", c: "#065f46" },
                { ini: "AQ", bg: "#fce7f3", c: "#9d174d" },
                { ini: "LF", bg: "#ede9fe", c: "#6d28d9" },
              ].map(({ ini, bg, c }, i) => (
                <div
                  key={ini}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "2px solid white",
                    background: bg,
                    color: c,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    marginLeft: i === 0 ? 0 : "-8px",
                    zIndex: 5 - i,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  {ini}
                </div>
              ))}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  marginBottom: "2px",
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={13}
                    style={{ color: "#f59e0b" }}
                    fill="#f59e0b"
                  />
                ))}
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#111",
                    marginLeft: "4px",
                  }}
                >
                  4.8
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#888" }}>
                +2,800 servicios completados
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta técnico */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(249,115,22,0.12)",
              border: "1px solid #fed7aa",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "14px",
                    background: "#fff7ed",
                    color: "#ea580c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "18px",
                  }}
                >
                  J
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#111",
                      marginBottom: "3px",
                    }}
                  >
                    Juan Ríos Flores
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#4ade80",
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "#888" }}>
                      Disponible ahora
                    </span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  padding: "5px 10px",
                  borderRadius: "9px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#b45309",
                }}
              >
                <Crown size={11} fill="currentColor" /> Premium
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {[
                { ico: "⭐", val: "4.9", lbl: "Calificación" },
                { ico: "✅", val: "47", lbl: "Trabajos" },
                { ico: "💰", val: "S/35", lbl: "Por hora" },
              ].map(({ ico, val, lbl }) => (
                <div
                  key={lbl}
                  style={{
                    background: "#f9f9f7",
                    borderRadius: "12px",
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "15px", marginBottom: "4px" }}>{ico}</p>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#111",
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </p>
                  <p
                    style={{ fontSize: "9px", color: "#888", marginTop: "2px" }}
                  >
                    {lbl}
                  </p>
                </div>
              ))}
            </div>

            {/* Categorías */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {["Electricista", "Gasfitero", "Técnico PC"].map((c) => (
                <span
                  key={c}
                  style={{
                    padding: "4px 10px",
                    background: "#fff7ed",
                    color: "#c2410c",
                    border: "1px solid #fed7aa",
                    borderRadius: "8px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/registro"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                background: "#f97316",
                color: "white",
                padding: "12px",
                borderRadius: "14px",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(249,115,22,0.3)",
                transition: "all 0.15s",
              }}
            >
              <Zap size={14} fill="white" /> Solicitar servicio
            </Link>
          </div>

          {/* Badges flotantes */}
          {[
            {
              text: "📍 1.2 km de ti",
              style: { top: "-14px", right: "-14px" },
            },
            {
              text: "💬 Chat protegido",
              style: { bottom: "-14px", left: "-14px" },
            },
          ].map(({ text, style }) => (
            <div
              key={text}
              style={{
                position: "absolute",
                background: "white",
                borderRadius: "12px",
                padding: "8px 13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#111",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                border: "1px solid #f1f0eb",
                zIndex: 2,
                ...style,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="bg-orange-500 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ valor, label }, i) => (
            <div
              key={label}
              className="text-center transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <p
                className="text-4xl font-black text-white mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {valor}
              </p>
              <p className="text-orange-100 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categorias() {
  const [ref, visible] = useInView();
  return (
    <section id="categorias" ref={ref} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">
            Oficios disponibles
          </p>
          <h2
            className="text-4xl font-black text-gray-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Todo lo que necesitas,
            <br />
            en un solo lugar
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIAS.map(({ icon: Icon, nombre, color }, i) => (
            <Link
              to="/registro"
              key={nombre}
              className="group relative bg-gray-50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 cursor-pointer"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.5s ease ${i * 60}ms`,
              }}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <p className="font-bold text-gray-800 text-sm">{nombre}</p>
              <p className="text-xs text-gray-400 mt-1 group-hover:text-orange-500 transition-colors">
                Ver técnicos →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const [ref, visible] = useInView();
  return (
    <section id="como-funciona" ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">
            Proceso simple
          </p>
          <h2
            className="text-4xl font-black text-gray-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Funciona en 4 pasos
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PASOS.map(({ num, titulo, desc, color, numColor }, i) => (
            <div
              key={num}
              className={`relative rounded-2xl p-6 border ${color} transition-all duration-500`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(40px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* Flecha al siguiente (solo desktop) */}
              {i < 3 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              )}
              <p
                className={`text-5xl font-black mb-4 ${numColor}`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {num}
              </p>
              <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Garantias() {
  const [ref, visible] = useInView();
  const items = [
    {
      icon: Shield,
      titulo: "Técnicos verificados",
      desc: "Cada técnico pasa por un proceso de verificación antes de aparecer en la plataforma.",
      color: "text-blue-500 bg-blue-50",
    },
    {
      icon: CheckCircle,
      titulo: "Pago 100% seguro",
      desc: "Tu dinero se libera al técnico solo cuando confirmas que el trabajo está bien hecho.",
      color: "text-green-500 bg-green-50",
    },
    {
      icon: MessageCircle,
      titulo: "Chat protegido",
      desc: "Comunícate sin compartir datos personales. Bloqueamos automáticamente intentos de fuga.",
      color: "text-purple-500 bg-purple-50",
    },
    {
      icon: Star,
      titulo: "Sistema de reputación",
      desc: "Calificaciones reales de clientes reales. Elige siempre al mejor para tu trabajo.",
      color: "text-amber-500 bg-amber-50",
    },
  ];
  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">
            Por qué elegirnos
          </p>
          <h2
            className="text-4xl font-black text-gray-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Tu seguridad,
            <br />
            nuestra prioridad
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ icon: Icon, titulo, desc, color }, i) => (
            <div
              key={titulo}
              className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.5s ease ${i * 80}ms`,
              }}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}
              >
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonios() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-3">
            Testimonios
          </p>
          <h2
            className="text-4xl font-black text-gray-900"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Lo que dicen nuestros usuarios
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIOS.map(
            ({ nombre, ciudad, texto, estrellas, inicial, color }, i) => (
              <div
                key={nombre}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(30px)",
                  transition: `all 0.5s ease ${i * 100}ms`,
                }}
              >
                {/* Estrellas */}
                <div className="flex mb-4">
                  {Array.from({ length: estrellas }).map((_, n) => (
                    <Star
                      key={n}
                      size={16}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                  "{texto}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-bold text-sm flex-shrink-0`}
                  >
                    {inicial}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{nombre}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {ciudad}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ParaTecnicos() {
  const [ref, visible] = useInView();
  return (
    <section id="tecnicos" ref={ref} className="py-20 bg-gray-900 relative ">
      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, #f97316 0%, transparent 50%),
                            radial-gradient(circle at 70% 30%, #fbbf24 0%, transparent 40%)`,
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.6s ease",
            }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-orange-500/30">
              <Wrench size={14} /> Para técnicos profesionales
            </div>
            <h2
              className="text-4xl font-black text-white mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Genera más ingresos
              <br />
              con tu oficio
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Regístrate, completa tu perfil y empieza a recibir solicitudes de
              trabajo hoy mismo. Sin complicaciones, sin inversión inicial.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Crea tu perfil profesional gratis",
                "Recibe solicitudes directamente en tu celular",
                "Cobra el 90% del valor del servicio",
                "Construye tu reputación con reseñas verificadas",
                "Hazte Premium para aparecer primero en búsquedas",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <CheckCircle
                    size={16}
                    className="text-orange-400 flex-shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition shadow-xl shadow-orange-500/30 text-sm"
            >
              Registrarme como técnico <ArrowRight size={16} />
            </Link>
          </div>

          {/* Cards de beneficios */}
          <div
            className="grid grid-cols-2 gap-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(30px)",
              transition: "all 0.6s ease 0.2s",
            }}
          >
            {[
              {
                icon: "💰",
                titulo: "Gana más",
                desc: "Recibe hasta 3× más trabajo con perfil Premium",
                bg: "bg-orange-500/10 border-orange-500/20",
              },
              {
                icon: "📍",
                titulo: "Zona cercana",
                desc: "Solo trabajos en tu radio de acción preferido",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
              {
                icon: "💬",
                titulo: "Chat directo",
                desc: "Coordina con clientes sin dar tu número personal",
                bg: "bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: "⭐",
                titulo: "Reputación",
                desc: "Construye un perfil sólido con reseñas reales",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
            ].map(({ icon, titulo, desc, bg }) => (
              <div key={titulo} className={`rounded-2xl p-5 border ${bg}`}>
                <p className="text-3xl mb-3">{icon}</p>
                <p className="font-bold text-white text-sm mb-1">{titulo}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-12 border border-orange-100 shadow-xl shadow-orange-50">
          <p className="text-5xl mb-6">🔧</p>
          <h2
            className="text-4xl font-black text-gray-900 mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            ¿Listo para empezar?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Únete a miles de peruanos que ya usan ChambaYA para encontrar
            técnicos confiables.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-orange-200 text-sm flex items-center justify-center gap-2"
            >
              Soy cliente — Buscar técnico <ArrowRight size={16} />
            </Link>
            <Link
              to="/registro"
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-2xl transition text-sm flex items-center justify-center gap-2"
            >
              Soy técnico — Registrarme <Wrench size={16} />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Registro gratuito · Sin tarjeta de crédito · Disponible en todo Perú
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-orange-500 text-white p-2 rounded-xl">
                <Wrench size={18} />
              </div>
              <span
                className="text-xl font-black text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Chamba<span className="text-orange-500">YA</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              La plataforma que conecta clientes con técnicos verificados en
              todo el Perú.
            </p>
          </div>

          {/* Links */}
          {[
            {
              titulo: "Plataforma",
              links: [
                "Cómo funciona",
                "Categorías",
                "Para técnicos",
                "Precios Premium",
              ],
            },
            {
              titulo: "Empresa",
              links: [
                "Sobre nosotros",
                "Blog",
                "Trabaja con nosotros",
                "Prensa",
              ],
            },
            {
              titulo: "Legal",
              links: ["Términos de uso", "Privacidad", "Cookies", "Contacto"],
            },
          ].map(({ titulo, links }) => (
            <div key={titulo}>
              <h4 className="text-white font-bold text-sm mb-4">{titulo}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm hover:text-orange-400 transition"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © 2026 ChambaYA. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Shield size={12} className="text-green-400" />
            <span>
              Plataforma segura · Pagos protegidos · Técnicos verificados
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Página principal ───────────────────────────────────────────

export default function HomePage() {
  // Cargar fuente Syne para los títulos
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Categorias />
      <ComoFunciona />
      <Garantias />
      <Testimonios />
      <ParaTecnicos />
      <CTA />
      <Footer />
    </div>
  );
}
