<script setup>
import { ref } from 'vue'
import { addDoc, collection } from 'firebase/firestore'
import db from '../Firebase/init.js'
import BookList from '../components/BookList.vue'

const isbn = ref('')
const name = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleAddBook() {
  if (isSubmitting.value) return

  successMessage.value = ''
  errorMessage.value = ''

  const numericIsbn = Number(isbn.value)
  if (String(isbn.value).trim() === '' || !Number.isFinite(numericIsbn) || !name.value.trim()) {
    errorMessage.value = 'Please enter a valid ISBN number and book name.'
    return
  }

  isSubmitting.value = true
  try {
    await addDoc(collection(db, 'books'), {
      isbn: numericIsbn,
      name: name.value.trim(),
    })

    isbn.value = ''
    name.value = ''
    successMessage.value = 'Book added successfully.'
  } catch (error) {
    console.error('Unable to add book:', error)
    errorMessage.value = 'Unable to add the book. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <h1 class="mb-4">Add Book</h1>

        <form @submit.prevent="handleAddBook">
          <div class="mb-3">
            <label for="book-isbn" class="form-label">ISBN</label>
            <input
              id="book-isbn"
              v-model="isbn"
              name="isbn"
              type="number"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label for="book-name" class="form-label">Name</label>
            <input
              id="book-name"
              v-model="name"
              name="name"
              type="text"
              class="form-control"
              required
            />
          </div>

          <p v-if="successMessage" class="alert alert-success" role="status">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Adding...' : 'Add Book' }}
          </button>
        </form>

        <BookList />
      </div>
    </div>
  </div>
</template>
