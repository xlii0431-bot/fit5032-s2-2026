<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  BarChart3,
  BookOpen,
  Calculator,
  CalendarDays,
  Database,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPinned,
  Recycle,
  Share2,
  UserRound,
  UserPlus,
  WifiOff,
} from '@lucide/vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { logoutUser, observeAuthState } from '../utils/auth'
import AccessibilityPreferences from './AccessibilityPreferences.vue'

const route = useRoute()
const router = useRouter()
const currentUser = ref(null)
const authIsReady = ref(false)
const navbar = ref(null)
const openMenu = ref(null)

const recycleRoutes = ['recycling-guide', 'locations', 'impact-calculator']
const discoverRoutes = ['resources', 'events', 'analytics', 'interactive-data', 'offline-guide']
const myGreenLoopRoutes = ['favourites', 'share-email']

const isRecycleActive = computed(() => recycleRoutes.includes(route.name))
const isDiscoverActive = computed(() => discoverRoutes.includes(route.name))
const isMyGreenLoopActive = computed(() => myGreenLoopRoutes.includes(route.name))
const isAccountActive = computed(() => ['login', 'register', 'admin'].includes(route.name))
const accountLabel = computed(() => currentUser.value?.username || 'Account')

const stopObservingAuth = observeAuthState((user) => {
  currentUser.value = user
  authIsReady.value = true
})

async function handleLogout() {
  closeMenus()
  await logoutUser()
  closeExpandedNavigation()
  await router.push({ name: 'login' })
}

function closeMenus(menuToFocus = null) {
  openMenu.value = null
  if (menuToFocus) nextTick(() => document.getElementById(`${menuToFocus}Menu`)?.focus())
}

function toggleMenu(menuName) {
  openMenu.value = openMenu.value === menuName ? null : menuName
}

async function openMenuAndFocusItem(menuName, focusLast = false) {
  openMenu.value = menuName
  await nextTick()
  const items = document.querySelectorAll(`#${menuName}Dropdown .dropdown-item`)
  const target = focusLast ? items[items.length - 1] : items[0]
  target?.focus()
}

function handleToggleKeydown(event, menuName) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  openMenuAndFocusItem(menuName, event.key === 'ArrowUp')
}

function handleMenuKeydown(event, menuName) {
  const items = [...event.currentTarget.querySelectorAll('.dropdown-item')]
  if (items.length === 0) return
  const currentIndex = items.indexOf(document.activeElement)
  let nextIndex = currentIndex

  if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length
  else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = items.length - 1
  else return

  event.preventDefault()
  items[nextIndex]?.focus()
}

function handleDocumentPointerdown(event) {
  if (openMenu.value && !navbar.value?.contains(event.target)) closeMenus()
}

function handleDocumentKeydown(event) {
  if (event.key !== 'Escape' || !openMenu.value) return
  event.preventDefault()
  closeMenus(openMenu.value)
}

function closeExpandedNavigation() {
  const navigation = document.getElementById('mainNavigation')
  if (!navigation?.classList.contains('show')) return
  document.querySelector('[aria-controls="mainNavigation"]')?.click()
}

function closeMobileNavigation(event) {
  if (!event.target.closest('a')) return
  closeMenus()
  closeExpandedNavigation()
}

watch(
  () => route.fullPath,
  () => closeMenus(),
)

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerdown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  stopObservingAuth()
  document.removeEventListener('pointerdown', handleDocumentPointerdown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <nav ref="navbar" class="navbar greenloop-navbar navbar-expand-xxl navbar-dark" aria-label="Main navigation">
    <div class="container">
      <RouterLink class="navbar-brand fw-semibold" to="/">
        <span class="brand-mark" aria-hidden="true"><Recycle :size="18" /></span>
        <span>GreenLoop Melbourne</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavigation"
        aria-controls="mainNavigation"
        aria-expanded="false"
        aria-label="Toggle main navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNavigation" class="collapse navbar-collapse" @click="closeMobileNavigation">
        <ul class="navbar-nav main-navigation-links ms-xxl-4 me-xxl-auto mb-2 mb-xxl-0">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>

          <li class="nav-item dropdown">
            <button
              id="recycleMenu"
              class="nav-link dropdown-toggle"
              :class="{ active: isRecycleActive }"
              type="button"
              aria-controls="recycleDropdown"
              :aria-expanded="openMenu === 'recycle'"
              @click="toggleMenu('recycle')"
              @keydown="handleToggleKeydown($event, 'recycle')"
            >
              Recycle
              <span v-if="isRecycleActive" class="visually-hidden">(current section)</span>
            </button>
            <ul
              id="recycleDropdown"
              v-show="openMenu === 'recycle'"
              class="dropdown-menu nav-panel"
              :class="{ show: openMenu === 'recycle' }"
              aria-labelledby="recycleMenu"
              @keydown="handleMenuKeydown($event, 'recycle')"
            >
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/recycling-guide">
                  <span class="nav-panel-icon" aria-hidden="true"><Recycle :size="19" /></span>
                  <span><strong>Recycling Guide</strong><small>How to recycle common items</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/locations">
                  <span class="nav-panel-icon" aria-hidden="true"><MapPinned :size="19" /></span>
                  <span><strong>Find Recycling Centres</strong><small>Map, nearby facilities and routes</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/impact-calculator">
                  <span class="nav-panel-icon" aria-hidden="true"><Calculator :size="19" /></span>
                  <span><strong>Environmental Impact Calculator</strong><small>Educational recycling and landfill estimates</small></span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <button
              id="discoverMenu"
              class="nav-link dropdown-toggle"
              :class="{ active: isDiscoverActive }"
              type="button"
              aria-controls="discoverDropdown"
              :aria-expanded="openMenu === 'discover'"
              @click="toggleMenu('discover')"
              @keydown="handleToggleKeydown($event, 'discover')"
            >
              Discover
              <span v-if="isDiscoverActive" class="visually-hidden">(current section)</span>
            </button>
            <ul
              id="discoverDropdown"
              v-show="openMenu === 'discover'"
              class="dropdown-menu nav-panel nav-panel-wide"
              :class="{ show: openMenu === 'discover' }"
              aria-labelledby="discoverMenu"
              @keydown="handleMenuKeydown($event, 'discover')"
            >
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/resources">
                  <span class="nav-panel-icon" aria-hidden="true"><BookOpen :size="19" /></span>
                  <span><strong>Resources</strong><small>Waste-reduction guides and tips</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/events">
                  <span class="nav-panel-icon" aria-hidden="true"><CalendarDays :size="19" /></span>
                  <span><strong>Community Events</strong><small>Local sustainability activities</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/analytics">
                  <span class="nav-panel-icon" aria-hidden="true"><BarChart3 :size="19" /></span>
                  <span><strong>Recycling Analytics</strong><small>Charts and category insights</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/interactive-data">
                  <span class="nav-panel-icon" aria-hidden="true"><Database :size="19" /></span>
                  <span><strong>Interactive Data</strong><small>Search, sort and export datasets</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/offline-guide">
                  <span class="nav-panel-icon" aria-hidden="true"><WifiOff :size="19" /></span>
                  <span><strong>Offline Recycling Guide</strong><small>Cached guidance for offline access</small></span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <button
              id="myGreenLoopMenu"
              class="nav-link dropdown-toggle"
              :class="{ active: isMyGreenLoopActive }"
              type="button"
              aria-controls="myGreenLoopDropdown"
              :aria-expanded="openMenu === 'myGreenLoop'"
              @click="toggleMenu('myGreenLoop')"
              @keydown="handleToggleKeydown($event, 'myGreenLoop')"
            >
              My GreenLoop
              <span v-if="isMyGreenLoopActive" class="visually-hidden">(current section)</span>
            </button>
            <ul
              id="myGreenLoopDropdown"
              v-show="openMenu === 'myGreenLoop'"
              class="dropdown-menu nav-panel"
              :class="{ show: openMenu === 'myGreenLoop' }"
              aria-labelledby="myGreenLoopMenu"
              @keydown="handleMenuKeydown($event, 'myGreenLoop')"
            >
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/favourites">
                  <span class="nav-panel-icon" aria-hidden="true"><Heart :size="19" /></span>
                  <span><strong>My Favourites</strong><small>Your saved recycling guidance</small></span>
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item nav-panel-link" to="/share-email">
                  <span class="nav-panel-icon" aria-hidden="true"><Share2 :size="19" /></span>
                  <span><strong>Share Recycling Information</strong><small>Email selected guidance securely</small></span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
        </ul>

        <ul class="navbar-nav account-navigation mb-2 mb-xxl-0">
          <li class="nav-item dropdown">
            <button
              id="accountMenu"
              class="nav-link dropdown-toggle account-menu-toggle"
              :class="{ active: isAccountActive }"
              type="button"
              aria-controls="accountDropdown"
              :aria-expanded="openMenu === 'account'"
              @click="toggleMenu('account')"
              @keydown="handleToggleKeydown($event, 'account')"
            >
              <span class="account-label">{{ authIsReady ? accountLabel : 'Account' }}</span>
              <span v-if="currentUser" class="badge rounded-pill account-role-badge ms-1">
                {{ currentUser.role === 'admin' ? 'Admin' : 'User' }}
              </span>
            </button>

            <ul
              id="accountDropdown"
              v-show="openMenu === 'account'"
              class="dropdown-menu dropdown-menu-xl-end"
              :class="{ show: openMenu === 'account' }"
              aria-labelledby="accountMenu"
              @keydown="handleMenuKeydown($event, 'account')"
            >
              <template v-if="authIsReady && !currentUser">
                <li>
                  <RouterLink class="dropdown-item account-action" to="/login">
                    <LogIn :size="18" aria-hidden="true" />
                    Login
                  </RouterLink>
                </li>
                <li>
                  <RouterLink class="dropdown-item account-action" to="/register">
                    <UserPlus :size="18" aria-hidden="true" />
                    Create Account
                  </RouterLink>
                </li>
              </template>

              <template v-else-if="currentUser">
                <li class="account-summary">
                  <span class="account-avatar" aria-hidden="true"><UserRound :size="19" /></span>
                  <span class="account-identity">
                    <span class="small text-body-secondary">Signed in as</span>
                    <span class="fw-semibold text-truncate">{{ currentUser.username }}</span>
                  </span>
                  <span class="visually-hidden">
                    {{ currentUser.role === 'admin' ? 'Administrator' : 'GreenLoop member' }}
                  </span>
                  <span class="badge rounded-pill account-summary-role" aria-hidden="true">
                    {{ currentUser.role === 'admin' ? 'Admin' : 'User' }}
                  </span>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <RouterLink class="dropdown-item account-action" to="/favourites">
                    <Heart :size="18" aria-hidden="true" />
                    My Favourites
                  </RouterLink>
                </li>
                <li v-if="currentUser.role === 'admin'">
                  <RouterLink class="dropdown-item account-action" to="/admin">
                    <LayoutDashboard :size="18" aria-hidden="true" />
                    Admin Dashboard
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item account-action account-logout" type="button" @click="handleLogout">
                    <LogOut :size="18" aria-hidden="true" />
                    Logout
                  </button>
                </li>
              </template>

              <li v-else><span class="dropdown-item-text">Loading account…</span></li>
              <AccessibilityPreferences />
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
