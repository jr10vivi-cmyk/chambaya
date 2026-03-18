import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Transiciones válidas por rol
const TRANSICIONES = {
    tecnico: {
        pendiente: ['aceptado', 'cancelado'],
        aceptado: ['en_proceso', 'cancelado'],
        en_proceso: ['completado'],
    },
    cliente: {
        pendiente: ['cancelado'],
        completado: ['completado'], // confirmar + calificar
    }
}

export function useSolicitudes(filtroEstado = null) {
    const { profile } = useAuth()
    const [solicitudes, setSolic] = useState([])
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
        if (!error) setSolic(data || [])
        setLoading(false)
    }, [profile?.id, profile?.role, filtroEstado])

    // Cambiar estado de una solicitud con validación
    const cambiarEstado = async (solicitudId, nuevoEstado, extras = {}) => {
        const solicitud = solicitudes.find(s => s.id === solicitudId)
        if (!solicitud) return { error: 'Solicitud no encontrada' }

        const permitidos = TRANSICIONES[profile.role]?.[solicitud.estado] || []
        if (!permitidos.includes(nuevoEstado)) {
            return { error: `No puedes cambiar de "${solicitud.estado}" a "${nuevoEstado}"` }
        }

        const ahora = new Date().toISOString()
        const updates = { estado: nuevoEstado, ...extras }

        // Fechas automáticas según estado
        if (nuevoEstado === 'aceptado') updates.fecha_aceptado = ahora
        if (nuevoEstado === 'en_proceso') updates.fecha_inicio = ahora
        if (nuevoEstado === 'completado') updates.fecha_completado = ahora
        if (nuevoEstado === 'cancelado') updates.fecha_cancelado = ahora

        const { error } = await supabase
            .from('solicitudes')
            .update(updates)
            .eq('id', solicitudId)

        if (error) return { error: error.message }

        // Notificar al otro participante
        const esCliente = profile.role === 'cliente'
        const destinoId = esCliente ? solicitud.tecnicos?.id : solicitud.profiles?.id
        const mensajeNotif = {
            aceptado: '¡Tu solicitud fue aceptada! El técnico está en camino.',
            en_proceso: 'El técnico ha iniciado el trabajo.',
            completado: 'El trabajo fue marcado como completado. Por favor confírmalo.',
            cancelado: 'Una solicitud fue cancelada.',
        }[nuevoEstado]

        if (destinoId && mensajeNotif) {
            await supabase.from('notificaciones').insert({
                usuario_id: destinoId,
                tipo: `solicitud_${nuevoEstado}`,
                titulo: mensajeNotif,
                datos: { solicitud_id: solicitudId },
            })
        }

        // Actualizar estado local
        setSolic(prev => prev.map(s =>
            s.id === solicitudId ? { ...s, ...updates } : s
        ))

        return { ok: true }
    }

    // Confirmar recepción del servicio (cliente)
    const confirmarServicio = async (solicitudId, precioFinal) => {
        const { error } = await supabase
            .from('solicitudes')
            .update({
                confirmado_cliente: true,
                pago_liberado: true,
                precio_acordado: precioFinal,
                // El trigger SQL calcula la comisión automáticamente
            })
            .eq('id', solicitudId)
            .eq('estado', 'completado')

        if (error) return { error: error.message }

        // Registrar pago
        const sol = solicitudes.find(s => s.id === solicitudId)
        await supabase.from('pagos').insert({
            solicitud_id: solicitudId,
            cliente_id: sol?.profiles?.id || profile.id,
            tecnico_id: sol?.tecnicos?.id,
            monto_total: precioFinal,
            comision: precioFinal * 0.10,
            monto_tecnico: precioFinal * 0.90,
            estado: 'completado',
        })

        setSolic(prev => prev.map(s =>
            s.id === solicitudId
                ? { ...s, confirmado_cliente: true, pago_liberado: true, precio_acordado: precioFinal }
                : s
        ))

        return { ok: true }
    }

    // Enviar reseña (cliente)
    const enviarResena = async (solicitudId, { calificacion, comentario }) => {
        const sol = solicitudes.find(s => s.id === solicitudId)

        const { error } = await supabase.from('resenas').insert({
            solicitud_id: solicitudId,
            cliente_id: profile.id,
            tecnico_id: sol?.tecnicos?.id || sol?.tecnico_id,
            calificacion,
            comentario,
        })

        if (error) return { error: error.message }

        setSolic(prev => prev.map(s =>
            s.id === solicitudId
                ? { ...s, resenas: [{ calificacion, comentario }] }
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
