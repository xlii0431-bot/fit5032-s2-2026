import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import HomeView from '../views/HomeView.vue'
import InteractiveDataView from '../views/InteractiveDataView.vue'
import LocationFinderView from '../views/LocationFinderView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import EventsView from '../views/EventsView.vue'
import RecyclingGuideView from '../views/RecyclingGuideView.vue'
import ResourcesView from '../views/ResourcesView.vue'
import ShareEmailView from '../views/ShareEmailView.vue'
import { getCurrentUser, getCurrentUserProfile } from '../utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    {
      path: '/recycling-guide',
      name: 'recycling-guide',
      component: RecyclingGuideView,
      meta: { requiresAuth: true },
    },
    {
      path: '/resources',
      name: 'resources',
      component: ResourcesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/locations',
      name: 'locations',
      component: LocationFinderView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/interactive-data',
      name: 'interactive-data',
      component: InteractiveDataView,
      meta: { requiresAuth: true },
    },
    {
      path: '/share-email',
      name: 'share-email',
      component: ShareEmailView,
      meta: { requiresAuth: true },
    },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const currentUser = await getCurrentUser()

  if (to.meta.guestOnly && currentUser) return { name: 'home' }

  if (to.meta.requiresAuth && !currentUser) {
    if (to.name === 'home') return { name: 'login' }
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin) {
    try {
      const profile = await getCurrentUserProfile()
      if (profile?.role !== 'admin') return { name: 'home' }
    } catch {
      return { name: 'home' }
    }
  }

  return true
})

export default router
