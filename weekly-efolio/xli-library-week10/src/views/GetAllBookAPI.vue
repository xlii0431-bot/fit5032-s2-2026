<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

const jsondata = ref(null)
const errorMessage = ref('')
const isLoading = ref(true)

async function getAllBooks() {
  const functionUrl = import.meta.env.VITE_GET_ALL_BOOKS_URL?.trim()

  if (!functionUrl) {
    errorMessage.value =
      'Get all books service URL is not configured. Set VITE_GET_ALL_BOOKS_URL and restart the app.'
    isLoading.value = false
    return
  }

  try {
    const response = await axios.get(functionUrl)
    jsondata.value = response.data
  } catch (error) {
    console.error('Unable to get all books:', error)
    errorMessage.value = 'Unable to get all books. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

onMounted(getAllBooks)
</script>

<template>
  <main class="container py-4">
    <h1>Get All Book API</h1>

    <p v-if="isLoading" role="status">Loading books...</p>

    <p v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </p>

    <pre v-else>{{ JSON.stringify(jsondata, null, 2) }}</pre>
  </main>
</template>
