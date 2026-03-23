import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Pago, SaldoTecnico, Profile, Solicitud } from '../types'

type Periodo = 'semana' | 'mes' | 'año' | 'todo'

interface PagoConRelaciones extends Pago {
  solicitudes?: Pick<Solicitud, 'titulo' | 'descripcion' | 'direccion'> | null
  profiles?: Pick<Profile, 'nombre' | 'apellido'> | null
}

interface DiaGanancia {
  dia: string
  monto: number
}

interface GananciasKpis {
  totalGanado: number
  totalComision: number
  totalFacturado: number
  promedio: number
  cantidadTrabajos: number
  variacion: string | null
  graficoDias: DiaGanancia[]
}

/**
 * Hook para el módulo de ganancias del técnico.
 * Obtiene pagos recibidos, KPIs y saldo disponible.
 */
export function useGanancias() {
  const { profile } = useAuth()
  const [pagos, setPagos] = useState<PagoConRelaciones[]>([])
  const [saldo, setSaldo] = useState<SaldoTecnico | null>(null)
  const [kpis, setKpis] = useState<GananciasKpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<Periodo>('mes')

  const fechaDesde = useCallback((): string | null => {
    const ahora = new Date()
    if (periodo === 'semana') {
      ahora.setDate(ahora.getDate() - 7)
    } else if (periodo === 'mes') {
      ahora.setDate(1) // primer día del mes actual
    } else if (periodo === 'año') {
      ahora.setMonth(0, 1) // 1 de enero
    } else {
      return null // todo
    }
    ahora.setHours(0, 0, 0, 0)
    return ahora.toISOString()
  }, [periodo])

  const fetchGanancias = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)

    const desde = fechaDesde()

    // 1. Pagos recibidos por el técnico
    let q = supabase
      .from('pagos')
      .select(`
        id, monto_total, comision, monto_tecnico,
        estado, metodo_pago, creado_en,
        solicitudes(titulo, descripcion, direccion),
        profiles!cliente_id(nombre, apellido)
      `)
      .eq('tecnico_id', profile.id)
      .eq('estado', 'completado')
      .order('creado_en', { ascending: false })

    if (desde) q = q.gte('creado_en', desde)

    const { data: pagosData } = await q
    const pagosArr = (pagosData as unknown as PagoConRelaciones[]) || []
    setPagos(pagosArr)

    // 2. Saldo disponible
    const { data: saldoData } = await supabase
      .from('saldo_tecnicos')
      .select('*')
      .eq('tecnico_id', profile.id)
      .single()
    setSaldo(saldoData)

    // 3. KPIs del período
    const totalGanado = pagosArr.reduce((s, p) => s + Number(p.monto_tecnico), 0)
    const totalComision = pagosArr.reduce((s, p) => s + Number(p.comision), 0)
    const totalFacturado = pagosArr.reduce((s, p) => s + Number(p.monto_total), 0)
    const promedio = pagosArr.length > 0 ? totalGanado / pagosArr.length : 0

    // KPIs del mes anterior para comparar
    const inicioMesAnterior = new Date()
    inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1, 1)
    inicioMesAnterior.setHours(0, 0, 0, 0)
    const finMesAnterior = new Date()
    finMesAnterior.setDate(1)
    finMesAnterior.setHours(0, 0, 0, 0)

    const { data: pagosAnterior } = await supabase
      .from('pagos')
      .select('monto_tecnico')
      .eq('tecnico_id', profile.id)
      .eq('estado', 'completado')
      .gte('creado_en', inicioMesAnterior.toISOString())
      .lt('creado_en', finMesAnterior.toISOString())

    const gananciaAnterior = (pagosAnterior || []).reduce(
      (s, p) => s + Number(p.monto_tecnico), 0
    )
    const variacion = gananciaAnterior > 0
      ? (((totalGanado - gananciaAnterior) / gananciaAnterior) * 100).toFixed(0)
      : null

    // Ganancias por día (últimos 7 días para el mini gráfico)
    const porDia: Record<string, number> = {}
    const hoy = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy)
      d.setDate(hoy.getDate() - i)
      const key = d.toISOString().split('T')[0]
      porDia[key] = 0
    }
    pagosArr.forEach(p => {
      const key = p.creado_en?.split('T')[0]
      if (key && key in porDia) porDia[key] += Number(p.monto_tecnico)
    })
    const graficoDias: DiaGanancia[] = Object.entries(porDia).map(([fecha, monto]) => ({
      dia: new Date(fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short' }),
      monto,
    }))

    setKpis({
      totalGanado,
      totalComision,
      totalFacturado,
      promedio,
      cantidadTrabajos: pagosArr.length,
      variacion,
      graficoDias,
    })

    setLoading(false)
  }, [profile?.id, fechaDesde])

  useEffect(() => { fetchGanancias() }, [fetchGanancias])

  return { pagos, saldo, kpis, loading, periodo, setPeriodo, refetch: fetchGanancias }
}
