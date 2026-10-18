// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const pwaState = vi.hoisted(() => ({
  availability: { productionMode: true, serviceWorkerSupported: true, serviceWorkerActive: true, contentCached: false, savedAt: null },
}))
vi.mock('../src/utils/pwa', () => ({
  checkOfflineAvailability: vi.fn(async () => pwaState.availability),
  prepareOfflineContent: vi.fn(async () => ({ ...pwaState.availability, contentCached: true, savedAt: '2026-10-18T02:00:00.000Z' })),
}))

import OfflineGuideView from '../src/views/OfflineGuideView.vue'
import OfflineRecyclingGuideView from '../src/views/OfflineRecyclingGuideView.vue'
import { recyclingItems } from '../src/data/recyclingItems'
import { prepareOfflineContent } from '../src/utils/pwa'

let wrapper
async function mountView() {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/offline-guide', component: OfflineGuideView },
    { path: '/offline-recycling-guide', component: OfflineRecyclingGuideView },
  ] })
  await router.push('/offline-guide'); await router.isReady()
  wrapper = mount(OfflineGuideView, { global: { plugins: [router] } })
  await vi.waitFor(() => expect(wrapper.text()).not.toContain('Checking saved guide'))
}

afterEach(() => {
  wrapper?.unmount(); wrapper = undefined
  pwaState.availability = { productionMode: true, serviceWorkerSupported: true, serviceWorkerActive: true, contentCached: false, savedAt: null }
  vi.clearAllMocks()
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
})

describe('user-facing offline recycling guide', () => {
  it('offers one clear save action and a public static guide', async () => {
    await mountView()
    expect(wrapper.get('h1').text()).toBe('Your Offline Recycling Guide')
    expect(wrapper.get('button').text()).toContain('Save for offline use')
    expect(wrapper.get('a[href="/offline-recycling-guide"]').text()).toContain('Open recycling guide')
    expect(wrapper.text()).not.toMatch(/Vite|Service Worker|Workbox|Firebase|Firestore|Production build/)
  })

  it('saves, verifies and displays a reliable saved time', async () => {
    await mountView()
    await wrapper.get('button').trigger('click')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Ready to use offline'))
    expect(wrapper.text()).toContain('Last saved')
    expect(wrapper.get('button').text()).toContain('Update saved guide')
    expect(wrapper.get('button').classes()).toContain('btn-outline-success')
    expect(wrapper.get('a[href="/offline-recycling-guide"]').classes()).toContain('btn-success')
    expect(wrapper.find('.alert-success').exists()).toBe(false)
  })

  it('preserves a verified saved guide when an update fails', async () => {
    pwaState.availability = { productionMode: true, serviceWorkerSupported: true, serviceWorkerActive: true, contentCached: true, savedAt: '2026-10-18T01:00:00.000Z' }
    prepareOfflineContent.mockRejectedValueOnce(new Error('network'))
    await mountView()
    await wrapper.get('button').trigger('click')
    await vi.waitFor(() => expect(wrapper.get('[role="alert"]').text()).toContain('previously saved guide is still available'))
    expect(wrapper.text()).toContain('Ready to use offline')
  })

  it('requires internet for saving but keeps the saved guide link available', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    await mountView()
    expect(wrapper.text()).toContain('Internet connection needed to save the guide')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('a[href="/offline-recycling-guide"]').exists()).toBe(true)
  })

  it('renders bundled recycling guidance without private or online controls', () => {
    wrapper = mount(OfflineRecyclingGuideView)
    expect(wrapper.findAll('article').length).toBeGreaterThan(5)
    expect(wrapper.text()).toContain('How to dispose of it')
    expect(wrapper.text()).not.toMatch(/\b(favourite|rating|route|email)\b/i)
  })

  it('keeps every bundled item and its educational guidance available offline', () => {
    wrapper = mount(OfflineRecyclingGuideView)
    const cards = wrapper.findAll('article')

    expect(recyclingItems).toHaveLength(8)
    expect(cards).toHaveLength(recyclingItems.length)

    recyclingItems.forEach((item) => {
      expect(item.name.trim()).not.toBe('')
      expect(item.category.trim()).not.toBe('')
      expect(item.description.trim()).not.toBe('')
      expect(item.whyItMatters.trim().split(/\s+/).length).toBeGreaterThanOrEqual(35)
      expect(item.whyItMatters.trim().split(/\s+/).length).toBeLessThanOrEqual(60)
      expect(item.disposal.trim()).not.toBe('')

      const card = cards.find((candidate) => candidate.text().includes(item.name))
      expect(card, `${item.name} should have an offline card`).toBeDefined()
      expect(card.text()).toContain(item.category)
      expect(card.text()).toContain(item.description)
      expect(card.text()).toContain(item.whyItMatters)
      expect(card.text()).toContain(item.disposal)
    })
  })

  it('describes only content included in the bundled public guide', async () => {
    await mountView()
    expect(wrapper.findAll('.included-card')).toHaveLength(3)
    expect(wrapper.text()).toContain('Common household items')
    expect(wrapper.text()).toContain('Disposal instructions')
    expect(wrapper.text()).toContain('Educational descriptions')
  })
})
