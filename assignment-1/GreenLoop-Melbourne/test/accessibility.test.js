// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('../src/utils/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ uid: 'test-user' }),
  loginUser: vi.fn(),
  loginWithGoogle: vi.fn(),
  logoutUser: vi.fn(),
  observeAuthState: vi.fn((callback) => {
    callback({ uid: 'test-user', username: 'Test User', role: 'user' })
    return () => {}
  }),
  registerUser: vi.fn(),
}))

vi.mock('../src/utils/email', () => ({
  sendRecyclingEmail: vi.fn(),
}))

vi.mock('../src/utils/ratings', () => ({
  observeLocationRatings: vi.fn((_locationId, _userId, callback) => {
    callback({ average: 4, count: 1, userRating: 4 })
    return () => {}
  }),
  saveLocationRating: vi.fn(),
}))

import AppNavbar from '../src/components/AppNavbar.vue'
import InteractiveDataTable from '../src/components/InteractiveDataTable.vue'
import LocationFinderView from '../src/views/LocationFinderView.vue'
import LoginView from '../src/views/LoginView.vue'
import RegisterView from '../src/views/RegisterView.vue'
import ShareEmailView from '../src/views/ShareEmailView.vue'

const mountedWrappers = []

function makeRouter(path = '/') {
  const EmptyView = { template: '<div></div>' }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: EmptyView, meta: { requiresAuth: true } },
      { path: '/login', name: 'login', component: EmptyView },
      { path: '/register', name: 'register', component: EmptyView },
      { path: '/recycling-guide', component: EmptyView },
      { path: '/resources', component: EmptyView },
      { path: '/events', component: EmptyView },
      { path: '/locations', component: EmptyView },
      { path: '/interactive-data', component: EmptyView },
      { path: '/share-email', component: EmptyView },
      { path: '/about', component: EmptyView },
      { path: '/admin', component: EmptyView },
    ],
  })
  router.push(path)
  return router
}

async function mountForAxe(component, options = {}) {
  const wrapper = mount(component, { attachTo: document.body, ...options })
  mountedWrappers.push(wrapper)
  await wrapper.vm.$nextTick()
  return wrapper
}

async function expectNoAxeViolations(wrapper) {
  const results = await axe.run(wrapper.element, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: {
      // jsdom does not calculate layout or rendered colours reliably.
      'color-contrast': { enabled: false },
    },
  })
  expect(results.violations, results.violations.map(({ id, help }) => `${id}: ${help}`).join('\n')).toEqual([])
}

afterEach(() => {
  mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

describe('major GreenLoop interfaces', () => {
  it.each([
    ['login page', LoginView, '/login'],
    ['registration page', RegisterView, '/register'],
  ])('has no detectable WCAG A/AA axe violations in the %s', async (_name, component, path) => {
    const router = makeRouter(path)
    await router.isReady()
    const wrapper = await mountForAxe(component, { global: { plugins: [router] } })
    await expectNoAxeViolations(wrapper)
  })

  it('has no detectable WCAG A/AA axe violations in the interactive table', async () => {
    const wrapper = await mountForAxe(InteractiveDataTable, {
      props: {
        tableId: 'axe-table',
        title: 'Accessible recycling data',
        description: 'Search and sort recycling information.',
        rows: [
          { id: 1, name: 'Battery', category: 'Special disposal' },
          { id: 2, name: 'Cardboard', category: 'Recyclable' },
        ],
        columns: [
          { key: 'name', label: 'Item', searchable: true, sortable: true },
          { key: 'category', label: 'Category', searchable: true, sortable: true },
        ],
      },
    })
    await expectNoAxeViolations(wrapper)
  })

  it('has no detectable WCAG A/AA axe violations in the email sharing form', async () => {
    const wrapper = await mountForAxe(ShareEmailView)
    await expectNoAxeViolations(wrapper)
  })

  it('has no detectable WCAG A/AA axe violations in the navigation bar', async () => {
    const router = makeRouter('/')
    await router.isReady()
    const wrapper = await mountForAxe(AppNavbar, { global: { plugins: [router] } })
    await expectNoAxeViolations(wrapper)
  })

  it('has no detectable WCAG A/AA axe violations in the text alternative for the map page', async () => {
    const router = makeRouter('/locations')
    await router.isReady()
    const wrapper = await mountForAxe(LocationFinderView, {
      global: {
        plugins: [router],
        stubs: {
          LocationMap: {
            template:
              '<div role="region" aria-label="Interactive map of verified recycling locations"></div>',
          },
        },
      },
    })
    await expectNoAxeViolations(wrapper)
  })
})
