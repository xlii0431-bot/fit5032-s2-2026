// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('../src/utils/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ uid: 'favourites-user' }),
}))

vi.mock('../src/utils/favourites', () => ({
  observeFavourites: vi.fn(),
  removeFavourite: vi.fn(),
}))

import FavouritesView from '../src/views/FavouritesView.vue'
import { observeFavourites, removeFavourite } from '../src/utils/favourites'

let wrapper

function createTestRouter() {
  const EmptyView = { template: '<div></div>' }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/favourites', component: EmptyView },
      { path: '/recycling-guide', component: EmptyView },
    ],
  })
}

async function mountView(savedIds) {
  observeFavourites.mockImplementation((_uid, onChange) => {
    onChange(savedIds)
    return vi.fn()
  })
  const router = createTestRouter()
  await router.push('/favourites')
  await router.isReady()
  wrapper = mount(FavouritesView, { global: { plugins: [router] } })
  await flushPromises()
}

beforeEach(() => {
  removeFavourite.mockResolvedValue()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.clearAllMocks()
})

describe('My Favourites view', () => {
  it('renders only recycling items saved by the authenticated user', async () => {
    await mountView([1, 3])

    expect(wrapper.text()).toContain('2 favourites saved.')
    expect(wrapper.text()).toContain('Battery')
    expect(wrapper.text()).toContain('Cardboard')
    expect(wrapper.text()).not.toContain('Glass Bottle')
    expect(wrapper.findAll('.remove-favourite')).toHaveLength(2)
  })

  it('removes an item immediately and displays the empty state', async () => {
    await mountView([1])

    await wrapper.get('.remove-favourite').trigger('click')
    await flushPromises()

    expect(removeFavourite).toHaveBeenCalledWith('favourites-user', 1)
    expect(wrapper.text()).not.toContain('Common single-use and rechargeable household batteries')
    expect(wrapper.text()).toContain('0 favourites saved.')
    const browseLink = wrapper.get('a[href="/recycling-guide"]')
    expect(browseLink.text()).toBe('Browse Recycling Guide')
  })

  it('shows the browse-guide empty state when no favourites are saved', async () => {
    await mountView([])

    expect(wrapper.findAll('.remove-favourite')).toHaveLength(0)
    expect(wrapper.text()).toContain('No favourites saved yet')
    expect(wrapper.get('a[href="/recycling-guide"]').exists()).toBe(true)
  })
})
