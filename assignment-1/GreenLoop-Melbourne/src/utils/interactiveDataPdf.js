import { jsPDF } from 'jspdf'

const PAGE_WIDTH = 297
const PAGE_HEIGHT = 210
const MARGIN = 12
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const BOTTOM_MARGIN = 14
const LINE_HEIGHT = 4
const CELL_PADDING = 2

export function createInteractiveDataPdf({
  title,
  columns,
  rows,
  getValue,
  activeConditions = [],
  sortDescription = 'Original dataset order',
  totalAvailable,
  limitations,
  generatedAt = new Date(),
  documentFactory = () => new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' }),
}) {
  const document = documentFactory()
  const columnWidth = CONTENT_WIDTH / columns.length
  let y = MARGIN

  const addPage = () => {
    document.addPage()
    y = MARGIN
  }
  const ensureSpace = (height) => {
    if (y + height > PAGE_HEIGHT - BOTTOM_MARGIN) addPage()
  }
  const addParagraph = (text, options = {}) => {
    document.setFont('helvetica', options.bold ? 'bold' : 'normal')
    document.setFontSize(options.size || 9)
    document.setTextColor(...(options.color || [36, 50, 41]))
    const lines = document.splitTextToSize(String(text), CONTENT_WIDTH)
    ensureSpace(lines.length * 4.5 + 2)
    document.text(lines, MARGIN, y)
    y += lines.length * 4.5 + 2
  }
  const headerLines = columns.map((column) => document.splitTextToSize(column.label, columnWidth - CELL_PADDING * 2))
  const headerHeight = Math.max(9, Math.max(...headerLines.map((lines) => lines.length)) * LINE_HEIGHT + CELL_PADDING * 2)
  const drawHeader = () => {
    ensureSpace(headerHeight)
    document.setFillColor(231, 244, 235)
    columns.forEach((column, index) => {
      const x = MARGIN + index * columnWidth
      document.rect(x, y, columnWidth, headerHeight, 'FD')
      document.setFont('helvetica', 'bold')
      document.setFontSize(8)
      document.setTextColor(11, 79, 48)
      document.text(headerLines[index], x + CELL_PADDING, y + CELL_PADDING + 3)
    })
    y += headerHeight
  }

  document.setFillColor(11, 79, 48)
  document.rect(0, 0, PAGE_WIDTH, 29, 'F')
  document.setTextColor(255, 255, 255)
  document.setFont('helvetica', 'bold')
  document.setFontSize(18)
  document.text(title, MARGIN, 14)
  document.setFont('helvetica', 'normal')
  document.setFontSize(8)
  document.text(`Generated ${generatedAt.toLocaleString('en-AU')}`, MARGIN, 21)
  y = 37

  addParagraph(`Matching records: ${rows.length} of ${totalAvailable}`, { bold: true })
  addParagraph(`Active search and filters: ${activeConditions.length ? activeConditions.join('; ') : 'None'}`)
  addParagraph(`Sort order: ${sortDescription}`)
  y += 2

  drawHeader()
  if (!rows.length) {
    addParagraph('No records match the current search and filter conditions.', { bold: true })
  } else {
    rows.forEach((row, rowIndex) => {
      const cellLines = columns.map((column) =>
        document.splitTextToSize(String(getValue(row, column) ?? ''), columnWidth - CELL_PADDING * 2),
      )
      const rowHeight = Math.max(8, Math.max(...cellLines.map((lines) => lines.length)) * LINE_HEIGHT + CELL_PADDING * 2)
      if (y + rowHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
        addPage()
        drawHeader()
      }
      columns.forEach((column, columnIndex) => {
        const x = MARGIN + columnIndex * columnWidth
        if (rowIndex % 2 === 1) document.setFillColor(247, 250, 247)
        document.rect(x, y, columnWidth, rowHeight, rowIndex % 2 === 1 ? 'FD' : 'D')
        document.setFont('helvetica', 'normal')
        document.setFontSize(7.5)
        document.setTextColor(36, 50, 41)
        document.text(cellLines[columnIndex], x + CELL_PADDING, y + CELL_PADDING + 3)
      })
      y += rowHeight
    })
  }

  y += 6
  ensureSpace(18)
  addParagraph('Dataset scope and limitations', { bold: true, size: 11, color: [11, 79, 48] })
  addParagraph(limitations)

  return document
}

export function downloadInteractiveDataPdf(options, filename) {
  const document = createInteractiveDataPdf(options)
  document.save(filename)
}
