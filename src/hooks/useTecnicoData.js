import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTecnicoData() {
    const { profile, tecnico: tecnicoAuth, refreshProfile } = useAuth()
    const [stats, setStats] = useState(null)
    const [solicitudes, setSolic] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        if (!profile?.id) return
        setLoading(true)

        const hoy = new Date().toISOString().split('T')[0]

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

        const totalGanado = ingresos?.reduce((s, i) => s + Number(i.ganancia_tecnico || 0), 0) || 0

        // Ganancias últimos 7 días
        const ultimos7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i))
            const key = d.toISOString().split('T')[0]
            const monto = ingresos
                ?.filter(ing => ing.fecha_completado?.startsWith(key))
                .reduce((s, ing) => s + Number(ing.ganancia_tecnico || 0), 0) || 0
            return { dia: d.toLocaleDateString('es-PE', { weekday: 'short' }), monto }
        })

        setStats({ pendientes, enProceso, completados, totalGanado, ultimos7, resenas: resenas || [] })
        setSolic(ultimas || [])
        setLoading(false)
    }, [profile?.id])

    useEffect(() => { fetchStats() }, [fetchStats])

    return { stats, solicitudes, loading, refetch: fetchStats }
}