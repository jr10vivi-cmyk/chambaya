import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface Cotizacion {
  id: string
  solicitud_id: string
  tecnico_id: string
  cliente_id: string
  monto: number
  descripcion: string | null
  incluye_visita: boolean
  costo_visita: number
  estado: 'propuesta' | 'aceptada' | 'rechazada' | 'contraoferta'
  monto_contraoferta: number | null
  nota_contraoferta: string | null
  creado_en: string
}

export function useCotizaciones(solicitudId: string | null) {
  const { profile } = useAuth()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCotizaciones = useCallback(async () => {
    if (!solicitudId) return
    setLoading(true)
    const { data } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('solicitud_id', solicitudId)
      .order('creado_en', { ascending: false })
    setCotizaciones((data as Cotizacion[]) || [])
    setLoading(false)
  }, [solicitudId])

  const enviarCotizacion = async (params: {
    monto: number
    descripcion: string
    incluye_visita: boolean
    costo_visita: number
    cliente_id: string
  }) => {
    if (!solicitudId || !profile?.id) return { error: 'Sin contexto' }
    const { error } = await supabase.from('cotizaciones').insert({
      solicitud_id: solicitudId,
      tecnico_id: profile.id,
      cliente_id: params.cliente_id,
      monto: params.monto,
      descripcion: params.descripcion || null,
      incluye_visita: params.incluye_visita,
      costo_visita: params.costo_visita,
      estado: 'propuesta',
    })
    if (error) return { error: error.message }
    await fetchCotizaciones()
    return { ok: true }
  }

  const aceptarCotizacion = async (cotizacionId: string) => {
    const { error } = await supabase.rpc('aceptar_cotizacion', { p_cotizacion_id: cotizacionId })
    if (error) return { error: error.message }
    await fetchCotizaciones()
    return { ok: true }
  }

  const rechazarCotizacion = async (cotizacionId: string) => {
    const { error } = await supabase
      .from('cotizaciones')
      .update({ estado: 'rechazada' })
      .eq('id', cotizacionId)
      .eq('cliente_id', profile?.id)
    if (error) return { error: error.message }
    await fetchCotizaciones()
    return { ok: true }
  }

  const contraproponer = async (cotizacionId: string, montoContra: number, nota: string) => {
    const { error } = await supabase
      .from('cotizaciones')
      .update({
        estado: 'contraoferta',
        monto_contraoferta: montoContra,
        nota_contraoferta: nota || null,
      })
      .eq('id', cotizacionId)
      .eq('cliente_id', profile?.id)
    if (error) return { error: error.message }
    await fetchCotizaciones()
    return { ok: true }
  }

  return {
    cotizaciones,
    loading,
    fetchCotizaciones,
    enviarCotizacion,
    aceptarCotizacion,
    rechazarCotizacion,
    contraproponer,
  }
}
