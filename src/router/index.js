import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import HomeView from '../views/HomeView.vue'
import LocationFinderView from '../views/LocationFinderView.vue'
import EventsView from '../views/EventsView.vue'
import RecyclingGuideView from '../views/RecyclingGuideView.vue'
import ResourcesView from '../views/ResourcesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/recycling-guide',
      name: 'recycling-guide',
      component: RecyclingGuideView,
    },
    { path: '/resources', name: 'resources', component: ResourcesView },
    { path: '/events', name: 'events', component: EventsView },
    { path: '/locations', name: 'locations', component: LocationFinderView },
    { path: '/about', name: 'about', component: AboutView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
