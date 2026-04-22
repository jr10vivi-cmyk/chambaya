import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { SolicitudConRelaciones, EstadoSolicitud, UserRole } from '../types'

const TRANSICIONES: Record<string, Record<string, EstadoSolicitud[]>> = {
  tecnico: {
    pendiente: ['aceptado', 'cancelado'],
    en_custodia: ['en_proceso', 'cancelado'],
    en_proceso: ['completado'],
  },
  cliente: {
    pendiente: ['cancelado'],
    aceptado: ['en_custodia', 'cancelado'],
    completado: ['completado'],
  }
}

export function useSolicitudes(filtroEstado: EstadoSolicitud | null = null) {
  const { profile } = useAuth()
  const [solicitudes, setSolic] = useState<SolicitudConRelaciones[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSolicitudes = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)

    const esTecnico = profile.role === 'tecnico'
    const campo = esTecnico ? 'tecnico_id' : 'cliente_id'

    let query = supabase
      .from('solicitudes')
      .select(`
        id, titulo, descripcion, direccion,
        estado, presupuesto_cliente, precio_acordado,
        comision_plataforma, ganancia_tecnico,
        confirmado_cliente, pago_liberado,
        fecha_solicitud, fecha_aceptado, fecha_inicio,
        fecha_completado, notas_tecnico, creado_en,
        profiles!cliente_id(nombre, apellido, avatar_url, telefono),
        tecnicos(
          tarifa_hora,
          profiles(nombre, apellido, avatar_url)
        ),
        categorias(nombre, icono),
        resenas(id, calificacion, comentario)
      `)
      .eq(campo, profile.id)
      .order('creado_en', { ascending: false })

    if (filtroEstado) query = query.eq('estado', filtroEstado)

    const { data, error } = await query
    if (!error) setSolic((data as unknown as SolicitudConRelaciones[]) || [])
    setLoading(false)
  }, [profile?.id, profile?.role, filtroEstado])

  const cambiarEstado = async (solicitudId: string, nuevoEstado: EstadoSolicitud, extras: Record<string, unknown> = {}) => {
    const solicitud = solicitudes.find(s => s.id === solicitudId)
    if (!solicitud) return { error: 'Solicitud no encontrada' }

    const rol = profile?.role as UserRole
    const permitidos = TRANSICIONES[rol]?.[solicitud.estado] || []
    if (!permitidos.includes(nuevoEstado)) {
      return { error: `No puedes cambiar de "${solicitud.estado}" a "${nuevoEstado}"` }
    }

    const ahora = new Date().toISOString()
    const updates: Record<string, unknown> = { estado: nuevoEstado, ...extras }

    if (nuevoEstado === 'aceptado') updates.fecha_aceptado = ahora
    if (nuevoEstado === 'en_proceso') updates.fecha_inicio = ahora
    if (nuevoEstado === 'completado') updates.fecha_completado = ahora
    if (nuevoEstado === 'cancelado') updates.fecha_cancelado = ahora

    const { error } = await supabase
      .from('solicitudes')
      .update(updates)
      .eq('id', solicitudId)

    if (error) return { error: error.message }

    const esCliente = profile?.role === 'cliente'
    const destinoId = esCliente
      ? (solicitud.tecnicos as Record<string, unknown>)?.id as string | undefined
      : (solicitud.profiles as Record<string, unknown>)?.id as string | undefined

    const mensajeNotif: Record<string, string> = {
      aceptado: '¡Tu solicitud fue aceptada! El técnico está en camino.',
      en_proceso: 'El técnico ha iniciado el trabajo.',
      completado: 'El trabajo fue marcado como completado. Por favor confírmalo.',
      cancelado: 'Una solicitud fue cancelada.',
    }

    if (destinoId && mensajeNotif[nuevoEstado]) {
      await supabase.from('notificaciones').insert({
        usuario_id: destinoId,
        tipo: `solicitud_${nuevoEstado}`,
        titulo: mensajeNotif[nuevoEstado],
        datos: { solicitud_id: solicitudId },
      })
    }

    setSolic(prev => prev.map(s =>
      s.id === solicitudId ? { ...s, ...updates } as SolicitudConRelaciones : s
    ))

    return { ok: true }
  }

  const confirmarServicio = async (solicitudId: string, precioFinal: number) => {
    const { error } = await supabase
      .from('solicitudes')
      .update({
        confirmado_cliente: true,
        pago_liberado: true,
        precio_acordado: precioFinal,
      })
      .eq('id', solicitudId)
      .eq('estado', 'completado')

    if (error) return { error: error.message }

    const sol = solicitudes.find(s => s.id === solicitudId)
    const comision = precioFinal * 0.10
    const ganancia = precioFinal * 0.90

    const { data: pagoData } = await supabase.from('pagos').insert({
      solicitud_id: solicitudId,
      cliente_id: (sol?.profiles as Record<string, unknown>)?.id as string || profile!.id,
      tecnico_id: (sol?.tecnicos as Record<string, unknown>)?.id as string,
      monto_total: precioFinal,
      comision,
      monto_tecnico: ganancia,
      estado: 'completado',
    }).select('id').single()

    if (pagoData?.id) {
      await supabase.from('ingresos_plataforma').insert({
        tipo: 'comision',
        monto: comision,
        descripcion: `Comisión 10% — servicio: ${sol?.titulo || solicitudId}`,
        referencia_id: pagoData.id,
      }).then(({ error: ingError }) => {
        if (ingError && !ingError.message?.includes('duplicate')) {
          console.warn('ingresos_plataforma:', ingError.message)
        }
      })
    }

    setSolic(prev => prev.map(s =>
      s.id === solicitudId
        ? { ...s, confirmado_cliente: true, pago_liberado: true, precio_acordado: precioFinal }
        : s
    ))

    return { ok: true }
  }

  const enviarResena = async (solicitudId: string, { calificacion, comentario }: { calificacion: number; comentario?: string }) => {
    const sol = solicitudes.find(s => s.id === solicitudId)
    if (!sol) return { error: 'Solicitud no encontrada' }

    // Evitar duplicados: comprobar si ya existe reseña del mismo cliente para la solicitud
    const { data: existingData, error: selectError } = await supabase
      .from('resenas')
      .select('id')
      .eq('solicitud_id', solicitudId)
      .eq('cliente_id', profile!.id)
      .limit(1)

    if (selectError) return { error: selectError.message }
    if (existingData && (existingData as any).length > 0) {
      return { error: 'Ya calificaste esta solicitud' }
    }

    const { data, error } = await supabase.from('resenas').insert({
      solicitud_id: solicitudId,
      cliente_id: profile!.id,
      tecnico_id: (sol.tecnicos as Record<string, unknown>)?.id as string || sol.tecnico_id,
      calificacion,
      comentario: comentario ?? null,
    }).select('id, calificacion, comentario')

    if (error) {
      // manejar posible violación unique por carrera de condiciones
      if (error.message?.toLowerCase().includes('duplicate') || (error.details && String(error.details).toLowerCase().includes('unique'))) {
        return { error: 'Ya calificaste esta solicitud' }
      }
      return { error: error.message }
    }

    setSolic(prev => prev.map(s =>
      s.id === solicitudId
        ? { ...s, resenas: [{ id: (data as any)?.[0]?.id || '', calificacion: (data as any)?.[0]?.calificacion, comentario: (data as any)?.[0]?.comentario ?? null }] }
        : s
    ))

    return { ok: true }
  }

  return {
    solicitudes, loading,
    refetch: fetchSolicitudes,
    cambiarEstado,
    confirmarServicio,
    enviarResena,
    fetchSolicitudes,
  }
}
