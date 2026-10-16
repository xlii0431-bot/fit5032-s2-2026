import { describe, expect, it } from 'vitest'
import { createAnalyticsPdf } from '../src/utils/analyticsPdf'

function createFakeDocument() {
  const output = { text: [], images: [], pages: 1 }
  return {
    output,
    setFillColor() {},
    rect() {},
    setTextColor() {},
    setFont() {},
    setFontSize() {},
    splitTextToSize(text) { return [text] },
    text(value) { output.text.push(Array.isArray(value) ? value.join(' ') : value) },
    addPage() { output.pages += 1 },
    addImage(dataUrl) { output.images.push(dataUrl) },
  }
}

const summary = {
  filteredItems: [{ name: 'Cardboard' }, { name: 'Battery' }],
  categoryCounts: { Paper: 1, 'E-Waste': 1 },
  recyclableCount: 1,
  specialDisposalCount: 1,
  withLocationCount: 2,
}

describe('analytics PDF report', () => {
  it('documents all-category scope, numerical summaries and limitations', () => {
    const fakeDocument = createFakeDocument()
    const report = createAnalyticsPdf({
      summary,
      selectedCategories: [],
      totalEntries: 8,
      generatedAt: new Date('2026-10-17T10:00:00+11:00'),
      documentFactory: () => fakeDocument,
    })

    expect(report.output.text.join(' ')).toContain('Selected categories: All categories')
    expect(report.output.text.join(' ')).toContain('Showing 2 of 8 GreenLoop guide entries')
    expect(report.output.text.join(' ')).toContain('does not represent Melbourne recycling volumes')
  })

  it('includes selected filters and chart images in a filtered report', () => {
    const fakeDocument = createFakeDocument()
    const report = createAnalyticsPdf({
      summary: { ...summary, filteredItems: [{ name: 'Cardboard' }], categoryCounts: { Paper: 1 } },
      selectedCategories: ['Paper'],
      totalEntries: 8,
      chartImages: [{ title: 'Guide entries chart', dataUrl: 'data:image/png;base64,chart', aspectRatio: 2 }],
      documentFactory: () => fakeDocument,
    })

    expect(report.output.text.join(' ')).toContain('Selected categories: Paper')
    expect(report.output.images).toEqual(['data:image/png;base64,chart'])
  })
})
