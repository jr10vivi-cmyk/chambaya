import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Calcular distancia entre dos coordenadas (fórmula Haversine)
export function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371 // radio Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useTecnicos(filtros = {}) {
  const [tecnicos, setTecnicos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [categorias, setCategorias] = useState([])

  // Cargar categorías una sola vez
  useEffect(() => {
    supabase.from('categorias').select('*').eq('activo', true).order('nombre')
      .then(({ data }) => setCategorias(data || []))
  }, [])

  const fetchTecnicos = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('tecnicos')
      .select(`
        id,
        descripcion,
        tarifa_hora,
        tarifa_minima,
        lat,
        lng,
        radio_servicio_km,
        calificacion_promedio,
        total_trabajos,
        total_resenas,
        es_premium,
        disponible,
        tecnico_categorias(categoria_id, categorias(id, nombre, icono)),
        profiles(nombre, apellido, avatar_url, ciudad)
      `)
      .eq('estado_verificacion', 'aprobado')
      .eq('disponible', true)

    if (filtros.categoriaId) {
      // Filtrar por categoría usando subquery
      const { data: ids } = await supabase
        .from('tecnico_categorias')
        .select('tecnico_id')
        .eq('categoria_id', filtros.categoriaId)
      if (ids?.length) {
        query = query.in('id', ids.map(i => i.tecnico_id))
      } else {
        setTecnicos([])
        setLoading(false)
        return
      }
    }

    // Premium primero, luego por calificación
    query = query
      .order('es_premium', { ascending: false })
      .order('calificacion_promedio', { ascending: false })

    const { data, error } = await query
    if (error) { console.error(error); setLoading(false); return }

    let resultado = data || []

    // Filtrar por distancia si hay ubicación del usuario
    if (filtros.userLat && filtros.userLng && filtros.radioKm) {
      resultado = resultado.filter(t => {
        if (!t.lat || !t.lng) return false
        const dist = calcularDistancia(filtros.userLat, filtros.userLng, t.lat, t.lng)
        return dist <= filtros.radioKm
      }).map(t => ({
        ...t,
        distancia: calcularDistancia(filtros.userLat, filtros.userLng, t.lat, t.lng)
      }))
    }

    // Filtro de búsqueda por texto
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(t =>
        `${t.profiles?.nombre} ${t.profiles?.apellido} ${t.descripcion || ''}`
          .toLowerCase().includes(q)
      )
    }

    // Filtro calificación mínima
    if (filtros.calificacionMin) {
      resultado = resultado.filter(t =>
        (t.calificacion_promedio || 0) >= filtros.calificacionMin
      )
    }

    // ── ALGORITMO DE RECOMENDACIÓN INTELIGENTE ──
    // Fórmula que combina: Calificación (Max 50pts) + Premium (30pts fijos) + Cercanía (Max 20pts)
    resultado = resultado.map(t => {
      let score = 0
      
      // 1. Calificación (cada estrella = 10 puntos, max 50)
      score += (t.calificacion_promedio || 0) * 10
      
      // 2. Estado Premium (+30 puntos fijos)
      if (t.es_premium) score += 30
      
      // 3. Cercanía (max 20 puntos). Solo si tenemos ubicación del usuario
      if (filtros.userLat && filtros.userLng && t.lat && t.lng) {
        // Aprovechamos la distancia ya calculada si existe, sino la calculamos
        const dist = t.distancia ?? calcularDistancia(filtros.userLat, filtros.userLng, t.lat, t.lng)
        t.distancia = dist
        // Da 20pts si la distancia es 0km, y va bajando hasta 0pts si está a >=20km
        const distScore = Math.max(0, 20 - dist)
        score += distScore
      }

      return { ...t, scoreRecomendacion: score }
    })

    // Ordenar por el score final descendente
    resultado.sort((a, b) => b.scoreRecomendacion - a.scoreRecomendacion)

    setTecnicos(resultado)
    setLoading(false)
  }, [JSON.stringify(filtros)])

  useEffect(() => { fetchTecnicos() }, [fetchTecnicos])

  return { tecnicos, loading, categorias, refetch: fetchTecnicos }
}