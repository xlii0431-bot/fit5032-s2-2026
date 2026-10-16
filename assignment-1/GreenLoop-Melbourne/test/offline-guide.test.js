// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const pwaState = vi.hoisted(() => ({
  installed: false,
  prompt: null,
  availability: {
    serviceWorkerSupported: true,
    serviceWorkerActive: true,
    contentCached: true,
  },
}))

vi.mock('../src/utils/pwa', () => ({
  appIsInstalled: ref(pwaState.installed),
  installPrompt: ref(pwaState.prompt),
  checkOfflineAvailability: vi.fn(async () => pwaState.availability),
  requestAppInstallation: vi.fn(async () => ({ outcome: 'accepted' })),
}))

import OfflineGuideView from '../src/views/OfflineGuideView.vue'

let wrapper

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/offline-guide', component: OfflineGuideView },
      { path: '/recycling-guide', component: { template: '<div>Guide</div>' } },
    ],
  })
  await router.push('/offline-guide')
  await router.isReady()
  wrapper = mount(OfflineGuideView, { global: { plugins: [router] } })
  await vi.waitFor(() => expect(wrapper.text()).toContain('Static guide content is ready offline'))
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Offline Recycling Guide', () => {
  it('links to the guide and reports independently checked cache readiness', async () => {
    await mountView()
    expect(wrapper.get('a[href="/recycling-guide"]').text()).toContain('Open Recycling Guide')
    expect(wrapper.text()).toContain('Application installation')
    expect(wrapper.text()).toContain('Cached static content')
    expect(wrapper.text()).toContain('Internet connection')
  })

  it('does not render an install action without a browser installation prompt', async () => {
    await mountView()
    expect(wrapper.findAll('button').some((button) => button.text().includes('Install GreenLoop'))).toBe(false)
  })
})
