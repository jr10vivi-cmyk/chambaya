import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Profile, Resena } from '../types'

interface ResenaConPerfil extends Pick<Resena, 'calificacion' | 'comentario' | 'creado_en'> {
  profiles?: Pick<Profile, 'nombre'> | null
}

interface SolicitudTecnico {
  id: string
  titulo: string
  estado: string | null
  creado_en: string | null
  precio_acordado: number | null
  ganancia_tecnico: number | null
  profiles?: Pick<Profile, 'nombre' | 'apellido'> | null
}

interface DiaGanancia {
  dia: string
  monto: number
}

interface TecnicoStats {
  pendientes: number | null
  enProceso: number | null
  completados: number | null
  totalGanado: number
  ultimos7: DiaGanancia[]
  resenas: ResenaConPerfil[]
}

export function useTecnicoData() {
    const { profile } = useAuth()
    const [stats, setStats] = useState<TecnicoStats | null>(null)
    const [solicitudes, setSolic] = useState<SolicitudTecnico[]>([])
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        if (!profile?.id) return
        setLoading(true)

        const [
            { count: pendientes },
            { count: enProceso },
            { count: completados },
            { data: ingresos },
            { data: ultimas },
            { data: resenas },
        ] = await Promise.all([
            supabase.from('solicitudes').select('*', { count: 'exact', head: true })
                .eq('tecnico_id', profile.id).eq('estado', 'pendiente'),
            supabase.from('solicitudes').select('*', { count: 'exact', head: true })
                .eq('tecnico_id', profile.id).eq('estado', 'en_proceso'),
            supabase.from('solicitudes').select('*', { count: 'exact', head: true })
                .eq('tecnico_id', profile.id).eq('estado', 'completado'),
            supabase.from('solicitudes')
                .select('ganancia_tecnico, fecha_completado')
                .eq('tecnico_id', profile.id)
                .eq('estado', 'completado')
                .not('ganancia_tecnico', 'is', null),
            supabase.from('solicitudes')
                .select('id, titulo, estado, creado_en, precio_acordado, ganancia_tecnico, profiles!cliente_id(nombre, apellido)')
                .eq('tecnico_id', profile.id)
                .order('creado_en', { ascending: false })
                .limit(6),
            supabase.from('resenas')
                .select('calificacion, comentario, creado_en, profiles!cliente_id(nombre)')
                .eq('tecnico_id', profile.id)
                .order('creado_en', { ascending: false })
                .limit(5),
        ])

        const ingresosArr = (ingresos as unknown as Array<{ ganancia_tecnico: number | null; fecha_completado: string | null }>) || []
        const totalGanado = ingresosArr.reduce((s, i) => s + Number(i.ganancia_tecnico || 0), 0)

        // Ganancias últimos 7 días
        const ultimos7: DiaGanancia[] = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i))
            const key = d.toISOString().split('T')[0]
            const monto = ingresosArr
                .filter(ing => ing.fecha_completado?.startsWith(key))
                .reduce((s, ing) => s + Number(ing.ganancia_tecnico || 0), 0)
            return { dia: d.toLocaleDateString('es-PE', { weekday: 'short' }), monto }
        })

        setStats({ pendientes, enProceso, completados, totalGanado, ultimos7, resenas: (resenas as unknown as ResenaConPerfil[]) || [] })
        setSolic((ultimas as unknown as SolicitudTecnico[]) || [])
        setLoading(false)
    }, [profile?.id])

    useEffect(() => { fetchStats() }, [fetchStats])

    return { stats, solicitudes, loading, refetch: fetchStats }
}
