<script setup>
import { computed, onMounted, ref } from 'vue'
import { events } from '../data/events'
import { recyclingItems } from '../data/recyclingItems'
import { resources } from '../data/resources'
import { getAllUserProfiles } from '../utils/auth'

const registeredUsers = ref([])
const isLoading = ref(true)
const loadError = ref('')

const summaryCards = computed(() => [
  { label: 'Total Registered Users', value: registeredUsers.value.length },
  { label: 'Total Recycling Items', value: recyclingItems.length },
  { label: 'Total Resources', value: resources.length },
  { label: 'Total Events', value: events.length },
])

onMounted(async () => {
  try {
    registeredUsers.value = await getAllUserProfiles()
  } catch {
    loadError.value = 'Registered users could not be loaded. Check the Firestore rules and try again.'
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
            Review a simple overview of GreenLoop Melbourne's client-side application data.
          </p>
        </div>
      </div>

      <div class="row g-3 mt-1 mb-5">
        <div v-for="card in summaryCards" :key="card.label" class="col-12 col-sm-6 col-xl-3">
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
