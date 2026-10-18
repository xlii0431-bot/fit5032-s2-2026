<script setup>
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { computed, onMounted, ref } from 'vue'
import { events } from '../data/events'
import { recyclingItems } from '../data/recyclingItems'
import { resources } from '../data/resources'
import { getAllUserProfiles } from '../utils/auth'
import { useAccessibilityPreferences } from '../utils/accessibilityPreferences'
import { chartSurfacePlugin, getChartFontSize } from '../utils/chartPreferences'
import { summarizeUserRoles } from '../utils/adminAnalytics'

ChartJS.register(ArcElement, Legend, Tooltip, chartSurfacePlugin)

const registeredUsers = ref([])
const isLoading = ref(true)
const loadError = ref('')
const roleCounts = computed(() => summarizeUserRoles(registeredUsers.value))
const { preferences, effectiveReduceMotion, effectiveColorScheme } = useAccessibilityPreferences()
const roleChartData = computed(() => ({ labels: ['Administrators', 'Standard users'], datasets: [{ data: [roleCounts.value.admin, roleCounts.value.user], backgroundColor: ['#0b4f30', '#58a96f'], borderColor: '#ffffff', borderWidth: 2 }] }))
const roleChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: effectiveReduceMotion.value ? false : undefined,
  plugins: {
    greenloopSurface: { color: effectiveColorScheme.value === 'dark' ? '#19231d' : '#ffffff' },
    legend: { position: 'bottom', labels: { color: effectiveColorScheme.value === 'dark' ? '#edf5ef' : '#243229', font: { size: getChartFontSize(preferences.textSize) } } },
  },
}))

const userSummaryCards = computed(() => [
  { label: 'Total Registered Users', value: roleCounts.value.total },
  { label: 'Administrators', value: roleCounts.value.admin },
  { label: 'Standard Users', value: roleCounts.value.user },
])
const contentSummaryCards = computed(() => [
  { label: 'Total Recycling Items', value: recyclingItems.length },
  { label: 'Total Resources', value: resources.length },
  { label: 'Total Events', value: events.length },
])

onMounted(async () => {
  try {
    registeredUsers.value = await getAllUserProfiles()
  } catch (error) {
    loadError.value = error?.code === 'permission-denied'
      ? 'Permission denied. Only an authorised administrator can load user summaries.'
      : 'Registered users could not be loaded. Check your connection and try again.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1>Admin Dashboard</h1>
          <p class="lead">
            Review authorised Firestore user profiles, role totals and a summary of GreenLoop’s bundled application content.
          </p>
        </div>
      </div>

      <div v-if="!isLoading && !loadError" class="row g-3 mt-1 mb-4" aria-label="User account totals">
        <div v-for="card in userSummaryCards" :key="card.label" class="col-12 col-sm-4">
          <div class="card h-100 border-0 shadow-sm"><div class="card-body p-4"><p class="text-secondary mb-2">{{ card.label }}</p><p class="display-6 fw-semibold text-success mb-0">{{ card.value }}</p></div></div>
        </div>
      </div>

      <section v-if="!isLoading && !loadError && registeredUsers.length" class="card border-0 shadow-sm mb-4" aria-labelledby="role-distribution-heading">
        <div class="card-body p-4">
          <h2 id="role-distribution-heading" class="h4">User role distribution</h2>
          <p class="text-secondary">Aggregate Firestore profile counts; this chart does not expose account details.</p>
          <div class="row g-4 align-items-center">
            <div class="col-12 col-lg-6"><div class="admin-role-chart mx-auto" role="img" :aria-label="`${roleCounts.admin} administrators and ${roleCounts.user} standard users`"><Doughnut :data="roleChartData" :options="roleChartOptions" aria-hidden="true" /></div></div>
            <div class="col-12 col-lg-6">
              <table class="table table-sm mb-0">
                <caption>Accessible user role totals</caption>
                <thead><tr><th scope="col">Role</th><th scope="col">Profiles</th></tr></thead>
                <tbody><tr><th scope="row">Administrator</th><td>{{ roleCounts.admin }}</td></tr><tr><th scope="row">Standard user</th><td>{{ roleCounts.user }}</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div class="row g-3 mt-1 mb-5" aria-label="Application content totals">
        <div v-for="card in contentSummaryCards" :key="card.label" class="col-12 col-sm-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body p-4">
              <p class="text-secondary mb-2">{{ card.label }}</p>
              <p class="display-6 fw-semibold text-success mb-0">{{ card.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h2 class="h4">Registered Users</h2>
          <p class="text-secondary">Account passwords are never displayed in this dashboard.</p>

          <div v-if="isLoading" class="text-secondary" role="status">Loading registered users...</div>
          <div v-else-if="loadError" class="alert alert-danger mb-0" role="alert">
            {{ loadError }}
          </div>
          <div v-else-if="registeredUsers.length === 0" class="alert alert-info mb-0" role="status">
            No Firestore user profiles are available yet.
          </div>
          <div v-else class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in registeredUsers" :key="user.email">
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['badge', user.role === 'admin' ? 'text-bg-success' : 'text-bg-secondary']">
                      {{ user.role }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-role-chart { width: min(100%, 14rem); height: 14rem; }
</style>
