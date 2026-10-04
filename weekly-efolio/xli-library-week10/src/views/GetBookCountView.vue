<script setup>
import { ref } from 'vue'
import axios from 'axios'

const count = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)

async function getBookCount() {
  if (isLoading.value) return

  count.value = null
  errorMessage.value = ''

  const functionUrl = import.meta.env.VITE_COUNT_BOOKS_URL?.trim()
  if (!functionUrl) {
    errorMessage.value =
      'Book count service URL is not configured. Set VITE_COUNT_BOOKS_URL and restart the app.'
    return
  }

  isLoading.value = true
  try {
    const response = await axios.get(functionUrl)

    if (typeof response.data?.count !== 'number') {
      throw new Error('The book count service returned an invalid response.')
    }

    count.value = response.data.count
  } catch (error) {
    console.error('Unable to get the book count:', error)
    errorMessage.value = 'Unable to get the book count. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4 text-center">
        <h1 class="mb-4">Book Counter</h1>

        <button type="button" class="btn btn-primary" :disabled="isLoading" @click="getBookCount">
          {{ isLoading ? 'Loading...' : 'Get Book Count' }}
        </button>

        <p v-if="count !== null" class="alert alert-success mt-4" role="status">
          Total number of books: {{ count }}
        </p>

        <p v-if="errorMessage" class="alert alert-danger mt-4" role="alert">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
