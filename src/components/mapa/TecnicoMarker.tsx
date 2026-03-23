import { divIcon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { TecnicoConScore } from '../../types'

function crearIcono(tecnico: TecnicoConScore) {
    const inicial = tecnico.profiles?.nombre?.[0]?.toUpperCase() || '?'
    const esPremium = tecnico.es_premium

    return divIcon({
        html: `
      <div style="
        width:42px; height:42px; border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${esPremium ? '#f59e0b' : '#f97316'};
        border:3px solid white;
        box-shadow:0 3px 10px rgba(0,0,0,0.25);
        display:flex; align-items:center; justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          color:white; font-weight:700; font-size:14px;
          font-family:Inter,sans-serif;
        ">${inicial}</span>
      </div>
    `,
        className: '',
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -44],
    })
}

interface TecnicoMarkerProps {
    tecnico: TecnicoConScore
}

export default function TecnicoMarker({ tecnico }: TecnicoMarkerProps) {
    if (!tecnico.lat || !tecnico.lng) return null

    const nombre = `${tecnico.profiles?.nombre || ''} ${tecnico.profiles?.apellido || ''}`.trim()

    return (
        <Marker
            position={[tecnico.lat, tecnico.lng]}
            icon={crearIcono(tecnico)}
        >
            <Popup className="tecnico-popup" minWidth={220}>
                <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                    {tecnico.es_premium && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: '#fffbeb', color: '#b45309',
                            padding: '3px 8px', borderRadius: '6px',
                            fontSize: '10px', fontWeight: '600', marginBottom: '8px'
                        }}>
                            PREMIUM
                        </div>
                    )}
                    <p style={{ fontWeight: '700', fontSize: '14px', margin: '0 0 4px', color: '#111' }}>
                        {nombre}
                    </p>
                    <p style={{ fontSize: '11px', color: '#888', margin: '0 0 6px' }}>
                        {tecnico.profiles?.ciudad || 'Sin ciudad'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#f59e0b', fontSize: '12px' }}>
                            {'★'.repeat(Math.round(tecnico.calificacion_promedio || 0))}
                            {'☆'.repeat(5 - Math.round(tecnico.calificacion_promedio || 0))}
                        </span>
                        <span style={{ fontSize: '11px', color: '#555' }}>
                            {tecnico.calificacion_promedio?.toFixed(1) || 'Nuevo'}
                        </span>
                    </div>
                    {tecnico.tarifa_hora && (
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#f97316', marginBottom: '8px' }}>
                            S/{tecnico.tarifa_hora}/hora
                        </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                        {tecnico.tecnico_categorias?.slice(0, 3).map(tc => (
                            <span key={tc.categoria_id} style={{
                                background: '#fff7ed', color: '#c2410c',
                                padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '500'
                            }}>
                                {tc.categorias?.nombre}
                            </span>
                        ))}
                    </div>
                    <a href={`/cliente/tecnico/${tecnico.id}`}
                        style={{
                            display: 'block', textAlign: 'center',
                            background: '#f97316', color: 'white',
                            padding: '7px 12px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: '600',
                            textDecoration: 'none'
                        }}>
                        Ver perfil y contratar
                    </a>
                </div>
            </Popup>
        </Marker>
    )
}
