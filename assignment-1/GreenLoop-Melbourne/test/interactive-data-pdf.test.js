import { describe, expect, it } from 'vitest'
import { createInteractiveDataPdf } from '../src/utils/interactiveDataPdf'

function fakeDocument() {
  const output = { text: [], pages: 1, rectangles: 0 }
  return {
    output,
    setFillColor() {},
    setTextColor() {},
    setFont() {},
    setFontSize() {},
    rect() { output.rectangles += 1 },
    splitTextToSize(value, width) {
      const text = String(value)
      const length = Math.max(8, Math.floor(width * 2))
      return text.match(new RegExp(`.{1,${length}}`, 'g')) || ['']
    },
    text(value) { output.text.push(Array.isArray(value) ? value.join(' ') : value) },
    addPage() { output.pages += 1 },
  }
}

describe('interactive data PDF renderer', () => {
  it('paginates long tables, repeats headers and includes report context', () => {
    const document = fakeDocument()
    const rows = Array.from({ length: 45 }, (_, index) => ({
      name: `Item ${index + 1}`,
      description: `A long educational description for entry ${index + 1} that must wrap safely within the table cell.`,
    }))
    const columns = [
      { key: 'name', label: 'Item name' },
      { key: 'description', label: 'Description' },
    ]

    const report = createInteractiveDataPdf({
      title: 'GreenLoop Test Table',
      columns,
      rows,
      getValue: (row, column) => row[column.key],
      activeConditions: ['Description contains “educational”'],
      sortDescription: 'Item name, ascending',
      totalAvailable: 50,
      limitations: 'Educational dataset only.',
      documentFactory: () => document,
    })

    const text = report.output.text.join(' ')
    expect(report.output.pages).toBeGreaterThan(1)
    expect(report.output.text.filter((value) => value === 'Item name').length).toBe(report.output.pages)
    expect(text).toContain('Matching records: 45 of 50')
    expect(text).toContain('Description contains “educational”')
    expect(text).toContain('Educational dataset only.')
  })
})
