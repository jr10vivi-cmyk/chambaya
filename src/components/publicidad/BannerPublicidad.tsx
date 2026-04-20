import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ExternalLink, X } from "lucide-react";

interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  url_destino: string | null;
  tipo: string;
}

interface BannerPublicidadProps {
  posicion?: "inicio" | "buscar" | "lateral";
  tipo?: "banner" | "destacado" | "popup";
  className?: string;
}

/**
 * BannerPublicidad
 * Muestra anuncios activos filtrados por posicion ('inicio' | 'buscar' | 'lateral').
 * Registra impresiones automaticamente y clicks cuando el usuario interactua.
 */
export default function BannerPublicidad({
  posicion = "inicio",
  tipo,
  className = "",
}: BannerPublicidadProps) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [cerrados, setCerrados] = useState<Set<string>>(new Set());
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    let q = supabase
      .from("publicidades")
      .select("id, titulo, descripcion, imagen_url, url_destino, tipo")
      .eq("activo", true)
      .eq("posicion", posicion)
      .or(`fecha_inicio.is.null,fecha_inicio.lte.${new Date().toISOString()}`)
      .or(`fecha_fin.is.null,fecha_fin.gte.${new Date().toISOString()}`);

    if (tipo) q = q.eq("tipo", tipo);

    q.limit(5).then(({ data }) => {
      const lista = (data as Anuncio[] | null) || [];
      setAnuncios(lista);
      // Registrar impresiones en background
      lista.forEach((a) => {
        supabase
          .rpc("registrar_impresion", { p_anuncio_id: a.id })
          .then(() => {});
      });
    });
  }, [posicion, tipo]);

  // Rotar banners cada 6 segundos
  useEffect(() => {
    if (anuncios.length <= 1) return;
    const t = setInterval(
      () => setIndice((i) => (i + 1) % anuncios.length),
      6000,
    );
    return () => clearInterval(t);
  }, [anuncios.length]);

  const handleClick = (anuncio: Anuncio) => {
    supabase
      .rpc("registrar_click", { p_anuncio_id: anuncio.id })
      .then(() => {});
    if (anuncio.url_destino)
      window.open(anuncio.url_destino, "_blank", "noopener");
  };

  const visibles = anuncios.filter((a) => !cerrados.has(a.id));
  if (visibles.length === 0) return null;

  const anuncio = visibles[indice % visibles.length];

  return (
    <div className={`relative rounded-2xl ${className}`}>
      {/* Fondo gradiente animado */}
      <div
        className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 p-4 cursor-pointer group"
        onClick={() => handleClick(anuncio)}
      >
        {/* Decoracion de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-full" />
        </div>

        {/* Etiqueta "Publicidad" */}
        <span className="absolute top-2 left-3 text-[10px] font-medium text-white/60 uppercase tracking-wider">
          Publicidad
        </span>

        {/* Boton cerrar */}
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            setCerrados((s) => new Set([...s, anuncio.id]));
          }}
          className="absolute top-2 right-2 p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
        >
          <X size={12} />
        </button>

        {/* Contenido */}
        <div className="mt-4 flex items-center gap-4">
          {anuncio.imagen_url && (
            <img
              src={anuncio.imagen_url}
              alt={anuncio.titulo}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2 border-white/30"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">
              {anuncio.titulo}
            </p>
            {anuncio.descripcion && (
              <p className="text-white/80 text-xs mt-0.5 line-clamp-1">
                {anuncio.descripcion}
              </p>
            )}
            {anuncio.url_destino && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[11px] text-white/70">Ver mas</span>
                <ExternalLink size={10} className="text-white/70" />
              </div>
            )}
          </div>
          <div className="flex-shrink-0 bg-white/20 group-hover:bg-white/30 transition rounded-xl px-3 py-2">
            <ExternalLink size={16} className="text-white" />
          </div>
        </div>

        {/* Indicadores de paginacion (si hay mas de 1) */}
        {visibles.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {visibles.map((_, i) => (
              <button
                key={i}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setIndice(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all
                  ${i === indice % visibles.length ? "bg-white w-4" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
