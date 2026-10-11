export function escapeCsvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export function createCsvContent(columns, rows, getValue) {
  const headerRow = columns.map((column) => escapeCsvValue(column.label)).join(',')
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeCsvValue(getValue(row, column))).join(','),
  )

  return `\uFEFF${[headerRow, ...dataRows].join('\r\n')}`
}

export function downloadCsv(filename, content) {
  const csvBlob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(csvBlob)
  const downloadLink = document.createElement('a')

  downloadLink.href = downloadUrl
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()
  URL.revokeObjectURL(downloadUrl)
}
