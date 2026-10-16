import { jsPDF } from 'jspdf'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

export function createAnalyticsPdf({
  summary,
  selectedCategories,
  totalEntries,
  generatedAt = new Date(),
  chartImages = [],
  documentFactory = () => new jsPDF({ unit: 'mm', format: 'a4' }),
}) {
  const document = documentFactory()
  let y = MARGIN

  const ensureSpace = (height) => {
    if (y + height <= PAGE_HEIGHT - MARGIN) return
    document.addPage()
    y = MARGIN
  }
  const addWrappedText = (text, options = {}) => {
    const { size = 10, color = [36, 50, 41], gap = 3, style = 'normal' } = options
    document.setFont('helvetica', style)
    document.setFontSize(size)
    document.setTextColor(...color)
    const lines = document.splitTextToSize(String(text), CONTENT_WIDTH)
    ensureSpace(lines.length * 5 + gap)
    document.text(lines, MARGIN, y)
    y += lines.length * 5 + gap
  }
  const addHeading = (text, size = 14) => {
    ensureSpace(10)
    addWrappedText(text, { size, color: [11, 79, 48], gap: 4, style: 'bold' })
  }

  document.setFillColor(11, 79, 48)
  document.rect(0, 0, PAGE_WIDTH, 35, 'F')
  document.setTextColor(255, 255, 255)
  document.setFont('helvetica', 'bold')
  document.setFontSize(20)
  document.text('GreenLoop Recycling Analytics', MARGIN, 17)
  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.text(`Generated ${generatedAt.toLocaleString('en-AU')}`, MARGIN, 25)
  y = 45

  addWrappedText(
    `Selected categories: ${selectedCategories.length ? selectedCategories.join(', ') : 'All categories'}`,
    { style: 'bold' },
  )
  addWrappedText(`Showing ${summary.filteredItems.length} of ${totalEntries} GreenLoop guide entries.`)

  addHeading('Guide entries by category')
  const categoryEntries = Object.entries(summary.categoryCounts)
  if (categoryEntries.length) {
    categoryEntries.forEach(([category, count]) => addWrappedText(`${category}: ${count}`, { gap: 1 }))
  } else {
    addWrappedText('No entries match the selected categories.')
  }

  addHeading('Guidance pathway breakdown')
  addWrappedText(`Household recycling pathway: ${summary.recyclableCount}`)
  addWrappedText(`Special disposal pathway: ${summary.specialDisposalCount}`)
  addWrappedText(`Entries with example location information: ${summary.withLocationCount}`)

  addHeading('Accessible numerical summary')
  addWrappedText(
    `${summary.recyclableCount} filtered entries use a household recycling pathway and ${summary.specialDisposalCount} require special disposal.`,
  )

  chartImages.filter(Boolean).forEach(({ title, dataUrl, aspectRatio = 2 }) => {
    addHeading(title)
    const height = Math.min(88, CONTENT_WIDTH / aspectRatio)
    ensureSpace(height + 5)
    document.addImage(dataUrl, 'PNG', MARGIN, y, CONTENT_WIDTH, height, undefined, 'FAST')
    y += height + 6
  })

  addHeading('Dataset scope and limitations')
  addWrappedText(
    'This report describes GreenLoop’s local educational guide entries only. It does not represent Melbourne recycling volumes, participation rates, facility performance or measured environmental outcomes.',
  )

  return document
}

export function downloadAnalyticsPdf(options, filename = 'greenloop-recycling-analytics.pdf') {
  const document = createAnalyticsPdf(options)
  document.save(filename)
}
