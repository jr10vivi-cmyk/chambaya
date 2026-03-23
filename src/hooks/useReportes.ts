import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Tecnico } from '../types'

interface IngresoDia {
  fecha: string
  comision: number
  publicidad: number
  suscripcion: number
  total: number
  [key: string]: string | number
}

interface IngresoTotales {
  comision: number
  publicidad: number
  suscripcion: number
  total: number
}

interface PorEstado {
  pendiente: number
  aceptado: number
  en_proceso: number
  completado: number
  cancelado: number
  [key: string]: number
}

interface TecnicoTop extends Pick<Tecnico, 'id' | 'calificacion_promedio' | 'total_trabajos' | 'total_resenas' | 'es_premium'> {
  profiles?: Pick<Profile, 'nombre' | 'apellido' | 'ciudad'> | null
}

interface CategoriaPopular {
  nombre: string
  count: number
}

interface IngresoDetalle {
  monto: number
  tipo: string | null
  descripcion: string | null
  fecha: string | null
}

interface ReportesData {
  ingresoPorDia: IngresoDia[]
  totales: IngresoTotales
  porEstado: PorEstado
  totalSolicitudes: number
  tasaCompletacion: string | number
  promedioDiario: number
  tecnicosTop: TecnicoTop[]
  categoriasPopulares: CategoriaPopular[]
  ingresosDetalle: IngresoDetalle[]
  totalUsuarios: number
  totalTecnicos: number
}

export function useReportes() {
    const [data, setData] = useState<ReportesData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchReportes = useCallback(async (rango: number = 30) => {
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

        const ingresosArr = (ingresosTotales as unknown as Array<{ monto: number; tipo: string | null; fecha: string | null }>) || []

        // Procesar ingresos por día para el gráfico
        const diasMap: Record<string, IngresoDia> = {}
        const hoy = new Date()
        for (let i = rango - 1; i >= 0; i--) {
            const d = new Date(hoy)
            d.setDate(hoy.getDate() - i)
            const key = d.toISOString().split('T')[0]
            diasMap[key] = { fecha: key, comision: 0, publicidad: 0, suscripcion: 0, total: 0 }
        }
        ingresosArr.forEach(ing => {
            const key = ing.fecha?.split('T')[0]
            if (key && diasMap[key]) {
                const tipo = ing.tipo || 'comision'
                diasMap[key][tipo] = (Number(diasMap[key][tipo]) || 0) + Number(ing.monto)
                diasMap[key].total += Number(ing.monto)
            }
        })
        const ingresoPorDia = Object.values(diasMap)

        // Totales por tipo
        const totales: IngresoTotales = {
            comision: ingresosArr.filter(i => i.tipo === 'comision').reduce((s, i) => s + Number(i.monto), 0),
            publicidad: ingresosArr.filter(i => i.tipo === 'publicidad').reduce((s, i) => s + Number(i.monto), 0),
            suscripcion: ingresosArr.filter(i => i.tipo === 'suscripcion').reduce((s, i) => s + Number(i.monto), 0),
            total: 0,
        }
        totales.total = totales.comision + totales.publicidad + totales.suscripcion

        // Solicitudes por estado
        const solicitudesArr = (solicitudesStats as unknown as Array<{ estado: string | null; precio_acordado: number | null; comision_plataforma: number | null; creado_en: string | null }>) || []
        const porEstado: PorEstado = (['pendiente', 'aceptado', 'en_proceso', 'completado', 'cancelado'] as const).reduce((acc, e) => {
            acc[e] = solicitudesArr.filter(s => s.estado === e).length
            return acc
        }, {} as PorEstado)
        const totalSolicitudes = solicitudesArr.length
        const tasaCompletacion = totalSolicitudes > 0
            ? ((porEstado.completado / totalSolicitudes) * 100).toFixed(1)
            : 0

        // Ingresos promedio por día
        const diasConIngresos = ingresoPorDia.filter(d => d.total > 0).length
        const promedioDiario = diasConIngresos > 0
            ? totales.total / diasConIngresos
            : 0

        // Categorías más populares
        const catCount: Record<string, number> = {}
        const categoriaArr = (categoriaStats as unknown as Array<{ categoria_id: string | null; categorias: { nombre: string } | null }>) || []
        categoriaArr.forEach(tc => {
            const nombre = tc.categorias?.nombre
            if (nombre) catCount[nombre] = (catCount[nombre] || 0) + 1
        })
        const categoriasPopulares: CategoriaPopular[] = Object.entries(catCount)
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
            tecnicosTop: (tecnicosTop as unknown as TecnicoTop[]) || [],
            categoriasPopulares,
            ingresosDetalle: (ingresosDetalle as unknown as IngresoDetalle[]) || [],
            totalUsuarios: totalUsuarios || 0,
            totalTecnicos: totalTecnicos || 0,
        })
        setLoading(false)
    }, [])

    return { data, loading, fetchReportes }
}
