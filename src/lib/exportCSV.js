export function exportarCSV(datos, nombreArchivo) {
  if (!datos?.length) return

  const columnas = Object.keys(datos[0])
  const filas    = [
    columnas.join(','),
    ...datos.map(fila =>
      columnas.map(col => {
        const val = fila[col] ?? ''
        // Envolver en comillas si contiene coma o salto de línea
        return String(val).includes(',') || String(val).includes('\n')
          ? `"${String(val).replace(/"/g, '""')}"`
          : String(val)
      }).join(',')
    )
  ]

  const blob = new Blob(['\uFEFF' + filas.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}