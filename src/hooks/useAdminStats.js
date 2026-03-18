import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminStats() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
        // Actualizar cada 60 segundos
        const interval = setInterval(fetchStats, 60000)
        return () => clearInterval(interval)
    }, [])

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
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tecnico'),
                supabase.from('tecnicos').select('*', { count: 'exact', head: true }).eq('estado_verificacion', 'pendiente'),
                supabase.from('solicitudes').select('*', { count: 'exact', head: true })
                    .gte('creado_en', new Date().toISOString().split('T')[0]),
                supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'completado'),
                supabase.from('ingresos_plataforma').select('monto, tipo, fecha').order('fecha', { ascending: false }).limit(100),
                supabase.from('tecnicos')
                    .select('id, calificacion_promedio, total_trabajos, profiles(nombre, apellido, avatar_url)')
                    .eq('estado_verificacion', 'aprobado')
                    .order('total_trabajos', { ascending: false })
                    .limit(5),
                supabase.from('solicitudes')
                    .select('id, estado, creado_en, precio_acordado, profiles!cliente_id(nombre), tecnicos(profiles(nombre))')
                    .order('creado_en', { ascending: false })
                    .limit(8),
            ])

            // Calcular ingresos totales y por tipo
            const ingresosTotal = ingresos?.reduce((s, i) => s + Number(i.monto), 0) || 0
            const ingresosPorTipo = {
                comision: ingresos?.filter(i => i.tipo === 'comision').reduce((s, i) => s + Number(i.monto), 0) || 0,
                publicidad: ingresos?.filter(i => i.tipo === 'publicidad').reduce((s, i) => s + Number(i.monto), 0) || 0,
                suscripcion: ingresos?.filter(i => i.tipo === 'suscripcion').reduce((s, i) => s + Number(i.monto), 0) || 0,
            }

            // Ingresos de los últimos 7 días para el gráfico
            const hoy = new Date()
            const ultimos7dias = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(hoy)
                d.setDate(hoy.getDate() - (6 - i))
                const key = d.toISOString().split('T')[0]
                const suma = ingresos?.filter(ing => ing.fecha?.startsWith(key))
                    .reduce((s, ing) => s + Number(ing.monto), 0) || 0
                return { dia: d.toLocaleDateString('es-PE', { weekday: 'short' }), monto: suma }
            })

            setStats({
                totalClientes,
                totalTecnicos,
                tecnicosPendientes,
                serviciosHoy,
                serviciosTotal,
                ingresosTotal,
                ingresosPorTipo,
                ultimos7dias,
                tecnicosActivos: tecnicosActivos || [],
                serviciosRecientes: serviciosRecientes || [],
            })
        } catch (err) {
            console.error('Error cargando stats:', err)
        } finally {
            setLoading(false)
        }
    }

    return { stats, loading, refetch: fetchStats }
}