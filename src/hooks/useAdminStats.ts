import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { IngresoPlataforma, Profile, Tecnico, Solicitud } from "../types";

interface TecnicoActivo extends Pick<
  Tecnico,
  "id" | "calificacion_promedio" | "total_trabajos"
> {
  profiles?: Pick<Profile, "nombre" | "apellido" | "avatar_url"> | null;
}

interface ServicioReciente extends Pick<
  Solicitud,
  "id" | "estado" | "creado_en" | "precio_acordado"
> {
  profiles?: Pick<Profile, "nombre"> | null;
  tecnicos?: {
    profiles?: Pick<Profile, "nombre"> | null;
  } | null;
}

interface IngresosPorTipo {
  comision: number;
  publicidad: number;
  suscripcion: number;
}

interface DiaIngreso {
  dia: string;
  monto: number;
}

interface AdminStatsData {
  totalClientes: number | null;
  totalTecnicos: number | null;
  tecnicosPendientes: number | null;
  serviciosHoy: number | null;
  serviciosTotal: number | null;
  ingresosTotal: number;
  ingresosPorTipo: IngresosPorTipo;
  ultimos7dias: DiaIngreso[];
  tecnicosActivos: TecnicoActivo[];
  serviciosRecientes: ServicioReciente[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Actualizar cada 60 segundos
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Ejecutar todas las queries en paralelo
      const [
        { count: totalClientes },
        { count: totalTecnicos },
        { count: tecnicosPendientes },
        { count: serviciosHoy },
        { count: serviciosTotal },
        { data: ingresos },
        { data: tecnicosActivos },
        { data: serviciosRecientes },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "cliente"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "tecnico"),
        supabase
          .from("tecnicos")
          .select("*", { count: "exact", head: true })
          .eq("estado_verificacion", "pendiente"),
        supabase
          .from("solicitudes")
          .select("*", { count: "exact", head: true })
          .gte("creado_en", new Date().toISOString().split("T")[0]),
        supabase
          .from("solicitudes")
          .select("*", { count: "exact", head: true })
          .eq("estado", "completado"),
        supabase
          .from("ingresos_plataforma")
          .select("monto, tipo, fecha")
          .order("fecha", { ascending: false })
          .limit(100),
        supabase
          .from("tecnicos")
          .select(
            "id, calificacion_promedio, total_trabajos, profiles(nombre, apellido, avatar_url)",
          )
          .eq("estado_verificacion", "aprobado")
          .order("total_trabajos", { ascending: false })
          .limit(5),
        supabase
          .from("solicitudes")
          .select(
            "id, estado, creado_en, precio_acordado, profiles!cliente_id(nombre), tecnicos(profiles(nombre))",
          )
          .order("creado_en", { ascending: false })
          .limit(8),
      ]);

      const ingresosArr =
        (ingresos as unknown as Pick<
          IngresoPlataforma,
          "monto" | "tipo" | "fecha"
        >[]) || [];

      // Calcular ingresos totales y por tipo
      const ingresosTotal = ingresosArr.reduce(
        (s, i) => s + Number(i.monto),
        0,
      );
      const ingresosPorTipo: IngresosPorTipo = {
        comision: ingresosArr
          .filter((i) => i.tipo === "comision")
          .reduce((s, i) => s + Number(i.monto), 0),
        publicidad: ingresosArr
          .filter((i) => i.tipo === "publicidad")
          .reduce((s, i) => s + Number(i.monto), 0),
        suscripcion: ingresosArr
          .filter((i) => i.tipo === "suscripcion")
          .reduce((s, i) => s + Number(i.monto), 0),
      };

      // Ingresos de los últimos 7 días para el gráfico
      const hoy = new Date();
      const ultimos7dias: DiaIngreso[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() - (6 - i));
        const key = d.toISOString().split("T")[0];
        const suma = ingresosArr
          .filter((ing) => ing.fecha?.startsWith(key))
          .reduce((s, ing) => s + Number(ing.monto), 0);
        return {
          dia: d.toLocaleDateString("es-PE", { weekday: "short" }),
          monto: suma,
        };
      });

      setStats({
        totalClientes,
        totalTecnicos,
        tecnicosPendientes,
        serviciosHoy,
        serviciosTotal,
        ingresosTotal,
        ingresosPorTipo,
        ultimos7dias,
        tecnicosActivos: (tecnicosActivos as unknown as TecnicoActivo[]) || [],
        serviciosRecientes:
          (serviciosRecientes as unknown as ServicioReciente[]) || [],
      });
    } catch (err) {
      console.error("Error cargando stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
