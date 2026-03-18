import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useReportes() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchReportes = useCallback(async (rango = 30) => {
        setLoading(true)
        const desde = new Date()
        desde.setDate(desde.getDate() - rango)
        const desdeISO = desde.toISOString()

        const [
            { data: ingresosTotales },
            { data: solicitudesStats },
            { data: tecnicosTop },
            { data: categoriaStats },
            { data: ingresosDetalle },
            { count: totalUsuarios },
            { count: totalTecnicos },
        ] = await Promise.all([
            // Ingresos por día del período
            supabase.from('ingresos_plataforma')
                .select('monto, tipo, fecha')
                .gte('fecha', desdeISO)
                .order('fecha', { ascending: true }),

            // Estadísticas de solicitudes
            supabase.from('solicitudes')
                .select('estado, precio_acordado, comision_plataforma, creado_en')
                .gte('creado_en', desdeISO),

            // Top 10 técnicos por trabajo
            supabase.from('tecnicos')
                .select(`
          id, calificacion_promedio, total_trabajos, total_resenas, es_premium,
          profiles(nombre, apellido, ciudad)
        `)
                .eq('estado_verificacion', 'aprobado')
                .order('total_trabajos', { ascending: false })
                .limit(10),

            // Técnicos por categoría
            supabase.from('tecnico_categorias')
                .select('categoria_id, categorias(nombre)')
                .limit(200),

            // Detalle de ingresos recientes
            supabase.from('ingresos_plataforma')
                .select('monto, tipo, descripcion, fecha')
                .order('fecha', { ascending: false })
                .limit(50),

            // Total usuarios clientes
            supabase.from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'cliente'),

            // Total técnicos aprobados
            supabase.from('tecnicos')
                .select('*', { count: 'exact', head: true })
                .eq('estado_verificacion', 'aprobado'),
        ])

        // Procesar ingresos por día para el gráfico
        const diasMap = {}
        const hoy = new Date()
        for (let i = rango - 1; i >= 0; i--) {
            const d = new Date(hoy)
            d.setDate(hoy.getDate() - i)
            const key = d.toISOString().split('T')[0]
            diasMap[key] = { fecha: key, comision: 0, publicidad: 0, suscripcion: 0, total: 0 }
        }
        ingresosTotales?.forEach(ing => {
            const key = ing.fecha?.split('T')[0]
            if (diasMap[key]) {
                diasMap[key][ing.tipo] = (diasMap[key][ing.tipo] || 0) + Number(ing.monto)
                diasMap[key].total += Number(ing.monto)
            }
        })
        const ingresoPorDia = Object.values(diasMap)

        // Totales por tipo
        const totales = {
            comision: ingresosTotales?.filter(i => i.tipo === 'comision').reduce((s, i) => s + Number(i.monto), 0) || 0,
            publicidad: ingresosTotales?.filter(i => i.tipo === 'publicidad').reduce((s, i) => s + Number(i.monto), 0) || 0,
            suscripcion: ingresosTotales?.filter(i => i.tipo === 'suscripcion').reduce((s, i) => s + Number(i.monto), 0) || 0,
        }
        totales.total = totales.comision + totales.publicidad + totales.suscripcion

        // Solicitudes por estado
        const porEstado = ['pendiente', 'aceptado', 'en_proceso', 'completado', 'cancelado'].reduce((acc, e) => {
            acc[e] = solicitudesStats?.filter(s => s.estado === e).length || 0
            return acc
        }, {})
        const totalSolicitudes = solicitudesStats?.length || 0
        const tasaCompletacion = totalSolicitudes > 0
            ? ((porEstado.completado / totalSolicitudes) * 100).toFixed(1)
            : 0

        // Ingresos promedio por día
        const promedioDiario = ingresoPorDia.length > 0
            ? totales.total / ingresoPorDia.filter(d => d.total > 0).length || 0
            : 0

        // Categorías más populares
        const catCount = {}
        categoriaStats?.forEach(tc => {
            const nombre = tc.categorias?.nombre
            if (nombre) catCount[nombre] = (catCount[nombre] || 0) + 1
        })
        const categoriasPopulares = Object.entries(catCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([nombre, count]) => ({ nombre, count }))

        setData({
            ingresoPorDia,
            totales,
            porEstado,
            totalSolicitudes,
            tasaCompletacion,
            promedioDiario,
            tecnicosTop: tecnicosTop || [],
            categoriasPopulares,
            ingresosDetalle: ingresosDetalle || [],
            totalUsuarios: totalUsuarios || 0,
            totalTecnicos: totalTecnicos || 0,
        })
        setLoading(false)
    }, [])

    return { data, loading, fetchReportes }
}