<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const jsonData = ref(null)
const errorMessage = ref('')
const isLoading = ref(true)

async function getBookCount() {
  const functionUrl = import.meta.env.VITE_COUNT_BOOKS_URL?.trim()

  if (!functionUrl) {
    errorMessage.value =
      'Book count service URL is not configured. Set VITE_COUNT_BOOKS_URL and restart the app.'
    isLoading.value = false
    return
  }

  try {
    const response = await axios.get(functionUrl)
    jsonData.value = response.data
  } catch (error) {
    console.error('Unable to get the book count:', error)
    errorMessage.value = 'Unable to get the book count. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

onMounted(getBookCount)
</script>

<template>
  <main class="container py-4">
    <h1>Count Book API</h1>

    <p v-if="isLoading" role="status">Loading book count...</p>

    <p v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </p>

    <pre v-else>{{ JSON.stringify(jsonData, null, 2) }}</pre>
  </main>
</template>
