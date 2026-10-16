// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../src/utils/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ uid: 'navigation-test-user' }),
  getCurrentUserProfile: vi.fn().mockResolvedValue({ role: 'user' }),
  logoutUser: vi.fn(),
  observeAuthState: vi.fn((callback) => {
    callback({ uid: 'navigation-test-user', username: 'Navigation Test User', role: 'user' })
    return () => {}
  }),
}))

import AppNavbar from '../src/components/AppNavbar.vue'
import router from '../src/router'

const dropdownDestinations = [
  '/recycling-guide',
  '/locations',
  '/impact-calculator',
  '/resources',
  '/events',
  '/analytics',
  '/interactive-data',
  '/offline-guide',
  '/favourites',
  '/share-email',
]

let wrapper

beforeAll(() => {
  window.scrollTo = vi.fn()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('GreenLoop navigation destinations', () => {
  it('renders every feature dropdown link with a registered application route', async () => {
    await router.push('/')
    await router.isReady()
    wrapper = mount(AppNavbar, { global: { plugins: [router] } })

    const renderedDestinations = wrapper
      .findAll('.main-navigation-links .dropdown-item')
      .map((link) => link.attributes('href'))

    expect(renderedDestinations).toEqual(dropdownDestinations)

    for (const destination of renderedDestinations) {
      const resolvedRoute = router.resolve(destination)
      expect(resolvedRoute.matched, `${destination} should resolve to a view`).toHaveLength(1)
      expect(resolvedRoute.matched[0].components.default).toBeTruthy()
    }
  })

  it('navigates to every feature dropdown route without losing the matched view', async () => {
    for (const destination of dropdownDestinations) {
      await router.push(destination)
      expect(router.currentRoute.value.path).toBe(destination)
      expect(router.currentRoute.value.matched[0]?.components.default).toBeTruthy()
    }
  })

  it('keeps only one dropdown open when switching from Recycle to Discover', async () => {
    await router.push('/')
    await router.isReady()
    wrapper = mount(AppNavbar, { attachTo: document.body, global: { plugins: [router] } })

    const recycleToggle = wrapper.get('#recycleMenu')
    const discoverToggle = wrapper.get('#discoverMenu')

    await recycleToggle.trigger('click')
    expect(recycleToggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#recycleDropdown').classes()).toContain('show')
    expect(wrapper.findAll('.dropdown-menu.show')).toHaveLength(1)

    await discoverToggle.trigger('click')
    expect(recycleToggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('#recycleDropdown').classes()).not.toContain('show')
    expect(discoverToggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#discoverDropdown').classes()).toContain('show')
    expect(wrapper.findAll('.dropdown-menu.show')).toHaveLength(1)
  })

  it('keeps the first dropdown destination rendered when it is the active route', async () => {
    await router.push('/recycling-guide')
    await router.isReady()
    wrapper = mount(AppNavbar, { attachTo: document.body, global: { plugins: [router] } })

    await wrapper.get('#recycleMenu').trigger('click')
    const recyclingGuideLink = wrapper.get('#recycleDropdown a[href="/recycling-guide"]')
    expect(recyclingGuideLink.text()).toContain('Recycling Guide')
    expect(recyclingGuideLink.classes()).toContain('router-link-exact-active')

    await router.push('/favourites')
    await wrapper.get('#myGreenLoopMenu').trigger('click')
    const favouritesLink = wrapper.get('#myGreenLoopDropdown a[href="/favourites"]')
    expect(favouritesLink.text()).toContain('My Favourites')
    expect(favouritesLink.classes()).toContain('router-link-exact-active')
  })
})
