// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('../src/utils/interactiveDataPdf', () => ({
  downloadInteractiveDataPdf: vi.fn(),
}))

import InteractiveDataTable from '../src/components/InteractiveDataTable.vue'
import { downloadInteractiveDataPdf } from '../src/utils/interactiveDataPdf'

const rows = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
  category: index % 2 === 0 ? 'Paper' : 'Metal',
}))
const columns = [
  { key: 'name', label: 'Item', searchable: true, sortable: true },
  { key: 'category', label: 'Category', searchable: true, sortable: true },
]
let wrapper

function mountTable() {
  wrapper = mount(InteractiveDataTable, {
    props: {
      tableId: 'test-data',
      title: 'Test Data',
      description: 'Test records',
      rows,
      columns,
      limitations: 'Educational test dataset only.',
    },
  })
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.clearAllMocks()
})

describe('InteractiveDataTable', () => {
  it('paginates at ten rows while retaining all records in the result set', async () => {
    mountTable()
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.text()).toContain('12 records found')
    await wrapper.get('nav button:last-child').trigger('click')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('Page 2 of 2')
  })

  it('exports every filtered and sorted record rather than the visible page', async () => {
    mountTable()
    await wrapper.get('#test-data-global-search').setValue('Item 1')
    const itemSort = wrapper.findAll('.sort-button')[0]
    await itemSort.trigger('click')
    await itemSort.trigger('click')
    await wrapper.findAll('button').find((button) => button.text().includes('Export PDF')).trigger('click')
    await flushPromises()

    expect(downloadInteractiveDataPdf).toHaveBeenCalledOnce()
    const [options, filename] = downloadInteractiveDataPdf.mock.calls[0]
    expect(options.rows.map(({ name }) => name)).toEqual(['Item 12', 'Item 11', 'Item 10', 'Item 1'])
    expect(options.activeConditions).toEqual(['All columns contain “Item 1”'])
    expect(options.sortDescription).toBe('Item, descending')
    expect(options.totalAvailable).toBe(12)
    expect(filename).toBe('test-data.pdf')
  })

  it('exports an empty report gracefully when no records match', async () => {
    mountTable()
    await wrapper.get('#test-data-category-search').setValue('Unavailable category')
    expect(wrapper.text()).toContain('No records match the current searches.')
    const pdfButton = wrapper.findAll('button').find((button) => button.text().includes('Export PDF'))
    expect(pdfButton.attributes('disabled')).toBeUndefined()
    await pdfButton.trigger('click')
    await flushPromises()
    expect(downloadInteractiveDataPdf.mock.calls[0][0].rows).toEqual([])
  })
})
