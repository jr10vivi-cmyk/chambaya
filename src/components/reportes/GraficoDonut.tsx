interface Segmento {
    valor: number
    color: string
    label?: string
}

interface GraficoDonutProps {
    segmentos: Segmento[]
    total: number
    label: string
}

// Donut SVG sin dependencias
export default function GraficoDonut({ segmentos, total, label }: GraficoDonutProps) {
    const radio = 60
    const grosor = 20
    const cx = 80, cy = 80

    let anguloActual = -90 // Empezar desde arriba

    const arcos = segmentos
        .filter(s => s.valor > 0)
        .map(s => {
            const fraccion = s.valor / Math.max(total, 1)
            const angGrados = fraccion * 360
            const angRad = (anguloActual * Math.PI) / 180
            const angFinRad = ((anguloActual + angGrados) * Math.PI) / 180
            const x1 = cx + radio * Math.cos(angRad)
            const y1 = cy + radio * Math.sin(angRad)
            const x2 = cx + radio * Math.cos(angFinRad)
            const y2 = cy + radio * Math.sin(angFinRad)
            const grande = angGrados > 180 ? 1 : 0
            const arco = `M ${x1} ${y1} A ${radio} ${radio} 0 ${grande} 1 ${x2} ${y2}`
            anguloActual += angGrados

            return { ...s, arco, fraccion }
        })

    return (
        <svg viewBox="0 0 160 160" className="w-full max-w-[160px]">
            {/* Circulo base */}
            <circle cx={cx} cy={cy} r={radio} fill="none"
                stroke="var(--color-border-tertiary)" strokeWidth={grosor} />

            {/* Arcos */}
            {arcos.map((a, i) => (
                <path key={i}
                    d={a.arco}
                    fill="none"
                    stroke={a.color}
                    strokeWidth={grosor}
                    strokeLinecap="butt"
                />
            ))}

            {/* Centro */}
            <circle cx={cx} cy={cy} r={radio - grosor} fill="var(--color-background-primary)" />
            <text x={cx} y={cy - 8} textAnchor="middle"
                style={{ fontSize: '14px', fontWeight: 700, fill: 'var(--color-text-primary)' }}>
                S/{Number(total).toFixed(0)}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle"
                style={{ fontSize: '9px', fill: 'var(--color-text-secondary)' }}>
                {label}
            </text>
        </svg>
    )
}
