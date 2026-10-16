// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const authState = vi.hoisted(() => ({ user: null }))

vi.mock('../src/utils/auth', () => ({
  logoutUser: vi.fn(),
  observeAuthState: vi.fn((callback) => {
    callback(authState.user)
    return () => {}
  }),
}))

import AppNavbar from '../src/components/AppNavbar.vue'
import HomeView from '../src/views/HomeView.vue'

const EmptyView = { template: '<div></div>' }
const applicationPaths = [
  '/', '/recycling-guide', '/locations', '/resources', '/events', '/offline-guide',
  '/favourites', '/share-email', '/analytics', '/interactive-data', '/impact-calculator',
  '/about', '/login', '/register', '/admin',
]
let wrapper

function createTestRouter(path = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: applicationPaths.map((routePath, index) => ({
      path: routePath,
      name: `route-${index}`,
      component: EmptyView,
    })),
  })
  router.push(path)
  return router
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  authState.user = null
  document.body.innerHTML = ''
})

describe('homepage feature navigation', () => {
  it('presents the primary workflow in journey order and links every card to a registered route', async () => {
    const router = createTestRouter()
    await router.isReady()
    wrapper = mount(HomeView, { global: { plugins: [router] } })

    const expectedWorkflow = ['/recycling-guide', '/locations', '/impact-calculator']
    const expectedSupportingFeatures = [
      '/resources', '/events', '/analytics', '/interactive-data', '/offline-guide',
      '/favourites', '/share-email',
    ]
    const workflowLinks = wrapper.findAll('.workflow-card a').map((link) => link.attributes('href'))
    const supportingLinks = wrapper.findAll('.home-feature-card a').map((link) => link.attributes('href'))

    expect(workflowLinks).toEqual(expectedWorkflow)
    expect(supportingLinks).toEqual(expectedSupportingFeatures)
    ;[...workflowLinks, ...supportingLinks].forEach((path) =>
      expect(router.resolve(path).matched).toHaveLength(1),
    )
    expect(wrapper.get('.hero-primary').attributes('href')).toBe('/recycling-guide')
  })
})

describe('account dropdown', () => {
  async function mountNavbar(user) {
    authState.user = user
    const router = createTestRouter()
    await router.isReady()
    wrapper = mount(AppNavbar, { attachTo: document.body, global: { plugins: [router] } })
    await wrapper.get('#accountMenu').trigger('click')
  }

  it('shows login and account creation to signed-out visitors', async () => {
    await mountNavbar(null)
    expect(wrapper.get('#accountDropdown').text()).toContain('Login')
    expect(wrapper.get('#accountDropdown').text()).toContain('Create Account')
  })

  it('shows identity and favourites but not admin tools to a normal user', async () => {
    await mountNavbar({ uid: 'user-1', username: 'GreenLoop User', role: 'user' })
    const menuText = wrapper.get('#accountDropdown').text()
    expect(menuText).toContain('GreenLoop User')
    expect(menuText).toContain('GreenLoop member')
    expect(menuText).toContain('My Favourites')
    expect(menuText).toContain('Logout')
    expect(menuText).not.toContain('Admin Dashboard')
  })

  it('shows the Admin Dashboard only for an administrator', async () => {
    await mountNavbar({ uid: 'admin-1', username: 'GreenLoop Admin', role: 'admin' })
    expect(wrapper.get('#accountDropdown').text()).toContain('Administrator')
    expect(wrapper.get('#accountDropdown a[href="/admin"]').text()).toContain('Admin Dashboard')
  })
})
