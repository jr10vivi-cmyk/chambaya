import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Conversacion, Mensaje, Profile, Solicitud } from "../types";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Detectar si un mensaje intenta compartir contacto (10 digitos, correos, redes)
const PATRON_CONTACTO =
  /(\+?51[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}|\b\d{9,10}\b|wa\.me|whatsapp|facebook|instagram|@[a-z0-9]+|mi (número|celular|tel[eé]fono)|te llamo|llámame|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|correo|gmail|hotmail|outlook)/i;

// ── Tipos para los joins de conversaciones ──
interface ConversacionConRelaciones extends Conversacion {
  solicitudes?: Pick<Solicitud, "titulo" | "estado"> | null;
  profiles?: Pick<Profile, "nombre" | "apellido" | "avatar_url"> | null;
  tecnicos?: {
    profiles?: Pick<Profile, "nombre" | "apellido" | "avatar_url"> | null;
  } | null;
}

interface ConversacionDetalle extends Conversacion {
  solicitudes?: Pick<
    Solicitud,
    "id" | "titulo" | "estado" | "precio_acordado"
  > | null;
  profiles?: Pick<Profile, "nombre" | "apellido" | "avatar_url"> | null;
  tecnicos?: {
    profiles?: Pick<Profile, "nombre" | "apellido" | "avatar_url"> | null;
  } | null;
}

interface MensajeConPerfil extends Mensaje {
  profiles?: Pick<Profile, "nombre" | "apellido" | "avatar_url"> | null;
}

export function useConversaciones() {
  const { profile } = useAuth();
  const [convs, setConvs] = useState<ConversacionConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConvs = useCallback(async () => {
    if (!profile?.id) return;
    const campo = profile.role === "cliente" ? "cliente_id" : "tecnico_id";

    const { data } = await supabase
      .from("conversaciones")
      .select(
        `
        id, ultimo_mensaje, ultimo_mensaje_en,
        solicitudes(titulo, estado),
        profiles!cliente_id(nombre, apellido, avatar_url),
        tecnicos(profiles(nombre, apellido, avatar_url))
      `,
      )
      .eq(campo, profile.id)
      .order("ultimo_mensaje_en", { ascending: false });

    setConvs((data as unknown as ConversacionConRelaciones[]) || []);
    setLoading(false);
  }, [profile?.id, profile?.role]);

  useEffect(() => {
    fetchConvs();

    // Suscripción Realtime: actualizar lista cuando llega un mensaje nuevo
    const channel = supabase
      .channel("conversaciones-list")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversaciones",
        },
        () => fetchConvs(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConvs]);

  return { convs, loading, refetch: fetchConvs };
}

export function useChat(conversacionId: string | null) {
  const { profile } = useAuth();
  const [mensajes, setMensajes] = useState<MensajeConPerfil[]>([]);
  const [conv, setConv] = useState<ConversacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Cargar conversación + mensajes
  const fetchData = useCallback(async () => {
    if (!conversacionId) return;
    setLoading(true);

    const [{ data: convData }, { data: msgs }] = await Promise.all([
      supabase
        .from("conversaciones")
        .select(
          `
          id, cliente_id, tecnico_id,
          solicitudes(id, titulo, estado, precio_acordado),
          profiles!cliente_id(nombre, apellido, avatar_url),
          tecnicos(profiles(nombre, apellido, avatar_url))
        `,
        )
        .eq("id", conversacionId)
        .single(),
      supabase
        .from("mensajes")
        .select("*, profiles!emisor_id(nombre, apellido, avatar_url)")
        .eq("conversacion_id", conversacionId)
        .order("creado_en", { ascending: true }),
    ]);

    setConv(convData as unknown as ConversacionDetalle);
    setMensajes((msgs as unknown as MensajeConPerfil[]) || []);
    setLoading(false);

    // Marcar mensajes como leídos
    if (msgs?.length && profile?.id) {
      await supabase
        .from("mensajes")
        .update({ leido: true })
        .eq("conversacion_id", conversacionId)
        .neq("emisor_id", profile.id)
        .eq("leido", false);
    }
  }, [conversacionId, profile?.id]);

  useEffect(() => {
    fetchData();

    if (!conversacionId) return;

    // Canal Realtime para mensajes nuevos
    channelRef.current = supabase
      .channel(`chat-${conversacionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `conversacion_id=eq.${conversacionId}`,
        },
        async (payload) => {
          // Obtener datos completos del mensaje nuevo
          const { data } = await supabase
            .from("mensajes")
            .select("*, profiles!emisor_id(nombre, apellido, avatar_url)")
            .eq("id", (payload.new as Record<string, unknown>).id as string)
            .single();

          if (data) {
            const msg = data as unknown as MensajeConPerfil;
            setMensajes((prev) => {
              // Evitar duplicados
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            // Marcar como leído si no es mío
            if (msg.emisor_id !== profile?.id) {
              await supabase
                .from("mensajes")
                .update({ leido: true })
                .eq("id", msg.id);
            }
          }
        },
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [conversacionId, fetchData, profile?.id]);

  // Enviar mensaje
  const enviar = async (contenido: string): Promise<boolean | undefined> => {
    if (!contenido.trim() || !conv || enviando) return;

    // ── ANTI-FUGA: Detectar intento de compartir contacto ──
    if (PATRON_CONTACTO.test(contenido)) {
      setBloqueado(true);
      setTimeout(() => setBloqueado(false), 4000);

      // Registrar intento bloqueado
      await supabase.from("mensajes").insert({
        conversacion_id: conversacionId,
        emisor_id: profile!.id,
        contenido:
          "[Mensaje bloqueado: intento de compartir información de contacto]",
        tiene_contacto: true,
        bloqueado: true,
      });
      return false;
    }

    setEnviando(true);
    try {
      const { error } = await supabase
        .from("mensajes")
        .insert({
          conversacion_id: conversacionId,
          emisor_id: profile!.id,
          contenido: contenido.trim(),
        })
        .select("*, profiles!emisor_id(nombre, apellido, avatar_url)")
        .single();

      if (error) throw error;

      // Actualizar último mensaje en conversación
      await supabase
        .from("conversaciones")
        .update({
          ultimo_mensaje: contenido.trim().substring(0, 100),
          ultimo_mensaje_en: new Date().toISOString(),
        })
        .eq("id", conversacionId!);

      return true;
    } catch (err) {
      console.error("Error enviando:", err);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  // Contar no leídos
  const noLeidos = mensajes.filter(
    (m) => !m.leido && m.emisor_id !== profile?.id,
  ).length;

  return {
    conv,
    mensajes,
    loading,
    enviando,
    bloqueado,
    noLeidos,
    enviar,
    refetch: fetchData,
  };
}

// Hook para contar mensajes no leídos globales (para el badge del sidebar)
export function useNoLeidos(): number {
  const { profile } = useAuth();
  const [total, setTotal] = useState<number>(0);

  const fetchNoLeidos = useCallback(async () => {
    if (!profile?.id) return;
    const { count } = await supabase
      .from("mensajes")
      .select("*", { count: "exact", head: true })
      .neq("emisor_id", profile.id)
      .eq("leido", false);
    setTotal(count || 0);
  }, [profile?.id]);

  useEffect(() => {
    fetchNoLeidos();
    const channel = supabase
      .channel("no-leidos")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
        },
        fetchNoLeidos,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mensajes",
        },
        fetchNoLeidos,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNoLeidos]);

  return total;
}
