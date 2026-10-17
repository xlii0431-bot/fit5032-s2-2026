// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('../src/utils/auth', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('../src/utils/favourites', () => ({
  observeFavourites: vi.fn(),
  removeFavourite: vi.fn(),
  saveFavourite: vi.fn(),
}))

import RecyclingGuideView from '../src/views/RecyclingGuideView.vue'
import { getCurrentUser } from '../src/utils/auth'
import { observeFavourites, removeFavourite, saveFavourite } from '../src/utils/favourites'

let wrapper

function createTestRouter() {
  const EmptyView = { template: '<div></div>' }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/recycling-guide', name: 'recycling-guide', component: EmptyView },
      { path: '/login', name: 'login', component: EmptyView },
      { path: '/locations', name: 'locations', component: EmptyView },
    ],
  })
}

beforeEach(() => {
  getCurrentUser.mockResolvedValue({ uid: 'guide-user' })
  observeFavourites.mockImplementation((_uid, onChange) => {
    onChange([1])
    return vi.fn()
  })
  saveFavourite.mockResolvedValue()
  removeFavourite.mockResolvedValue()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.clearAllMocks()
})

describe('Recycling Guide favourites', () => {
  it('restores saved state and saves or removes deterministic item favourites', async () => {
    const router = createTestRouter()
    await router.push('/recycling-guide')
    await router.isReady()
    wrapper = mount(RecyclingGuideView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('.waste-sorting-illustration').exists()).toBe(true)

    const buttons = wrapper.findAll('.favourite-toggle')
    expect(buttons[0].text()).toBe('Remove Favourite')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].text()).toBe('Save to Favourites')

    await buttons[1].trigger('click')
    await flushPromises()
    expect(saveFavourite).toHaveBeenCalledWith('guide-user', 2)
    expect(wrapper.findAll('.favourite-toggle')[1].text()).toBe('Remove Favourite')

    await wrapper.findAll('.favourite-toggle')[0].trigger('click')
    await flushPromises()
    expect(removeFavourite).toHaveBeenCalledWith('guide-user', 1)
    expect(wrapper.findAll('.favourite-toggle')[0].text()).toBe('Save to Favourites')
  })

  it('sends an unauthenticated visitor to Login with the guide return destination', async () => {
    getCurrentUser.mockResolvedValueOnce(null)
    const router = createTestRouter()
    await router.push('/recycling-guide')
    await router.isReady()
    wrapper = mount(RecyclingGuideView, { global: { plugins: [router] } })
    await flushPromises()

    await wrapper.find('.favourite-toggle').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/recycling-guide')
    expect(observeFavourites).not.toHaveBeenCalled()
  })
})
