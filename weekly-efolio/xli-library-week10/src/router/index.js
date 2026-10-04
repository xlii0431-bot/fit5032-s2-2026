import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import FirebaseSigninView from '../views/FirebaseSigninView.vue'
import FirebaseRegisterView from '../views/FirebaseRegisterView.vue'
import AddBookView from '../views/AddBookView.vue'
import GetBookCountView from '../views/GetBookCountView.vue'
import CountBookAPI from '../views/CountBookAPI.vue'
import GetAllBookAPI from '../views/GetAllBookAPI.vue'
import WeatherView from '../views/WeatherView.vue'
import { isAuthenticated } from '../auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/about',
      component: AboutView,
      meta: { requiresAuth: true },
    },
    {
      path: '/firesignin',
      name: 'FireSignin',
      component: FirebaseSigninView,
    },
    {
      path: '/fireregister',
      name: 'FireRegister',
      component: FirebaseRegisterView,
    },
    {
      path: '/addbook',
      name: 'addbook',
      component: AddBookView,
    },
    {
      path: '/get-book-count',
      name: 'getBookCount',
      component: GetBookCountView,
    },
    {
      path: '/CountBookAPI',
      name: 'CountBookAPI',
      component: CountBookAPI,
    },
    {
      path: '/GetAllBookAPI',
      name: 'GetAllBookAPI',
      component: GetAllBookAPI,
    },
    {
      path: '/WeatherCheck',
      name: 'GetWeather',
      component: WeatherView,
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return '/login'
  }
})

export default router
