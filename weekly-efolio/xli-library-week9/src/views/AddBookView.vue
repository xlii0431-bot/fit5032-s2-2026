<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { addDoc, collection, onSnapshot } from 'firebase/firestore'
import db from '../Firebase/init.js'
import BookList from '../components/BookList.vue'

const isbn = ref('')
const name = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const submittedBook = ref(null)
const savedBook = ref(null)
const isWatchingSavedBook = ref(false)
const hasObservedCapitalisedResult = ref(false)

let unsubscribeSavedBook = null

const expectedCapitalisedName = computed(() => submittedBook.value?.name.toUpperCase() ?? '')

function stopSavedBookListener() {
  if (unsubscribeSavedBook) {
    unsubscribeSavedBook()
    unsubscribeSavedBook = null
  }
  isWatchingSavedBook.value = false
}

function watchSavedBook(bookReference) {
  isWatchingSavedBook.value = true
  unsubscribeSavedBook = onSnapshot(
    bookReference,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (!snapshot.exists()) {
        stopSavedBookListener()
        errorMessage.value = 'The newly saved book is no longer available.'
        return
      }

      savedBook.value = {
        id: snapshot.id,
        ...snapshot.data(),
      }

      const observedExpectedName =
        !snapshot.metadata.hasPendingWrites && savedBook.value.name === expectedCapitalisedName.value

      if (observedExpectedName) {
        hasObservedCapitalisedResult.value = true
        successMessage.value = 'Book saved and uppercase result observed in Firestore.'
        stopSavedBookListener()
      }
    },
    (error) => {
      console.error('Unable to observe the saved book:', error)
      stopSavedBookListener()
      errorMessage.value = 'Book saved, but the saved result could not be observed.'
    },
  )
}

async function handleAddBook() {
  if (isSubmitting.value) return

  successMessage.value = ''
  errorMessage.value = ''
  submittedBook.value = null
  savedBook.value = null
  hasObservedCapitalisedResult.value = false
  stopSavedBookListener()

  const numericIsbn = Number(isbn.value)
  if (String(isbn.value).trim() === '' || !Number.isFinite(numericIsbn) || !name.value.trim()) {
    errorMessage.value = 'Please enter a valid ISBN number and book name.'
    return
  }

  isSubmitting.value = true
  try {
    const originalBook = {
      isbn: numericIsbn,
      name: name.value.trim(),
    }
    const bookReference = await addDoc(collection(db, 'books'), originalBook)

    submittedBook.value = originalBook
    successMessage.value = 'Book saved. Waiting to observe the uppercase result in Firestore.'
    watchSavedBook(bookReference)

    isbn.value = ''
    name.value = ''
  } catch (error) {
    console.error('Unable to add book:', error)
    errorMessage.value = 'Unable to add the book. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(stopSavedBookListener)
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

          <div v-if="submittedBook" class="card mb-3">
            <div class="card-body">
              <h2 class="h5 card-title">Submitted input</h2>
              <p class="mb-1"><strong>Name:</strong> {{ submittedBook.name }}</p>
              <p class="mb-0"><strong>ISBN:</strong> {{ submittedBook.isbn }}</p>
            </div>
          </div>

          <div v-if="savedBook" class="card mb-3">
            <div class="card-body">
              <h2 class="h5 card-title">Firestore saved result</h2>
              <p class="mb-1"><strong>Name:</strong> {{ savedBook.name }}</p>
              <p class="mb-0"><strong>ISBN:</strong> {{ savedBook.isbn }}</p>
            </div>
          </div>

          <p v-if="isWatchingSavedBook" class="alert alert-info" role="status">
            Book saved. Waiting for the Cloud Function to update the name...
          </p>

          <p v-if="hasObservedCapitalisedResult" class="alert alert-success" role="status">
            Uppercase result observed in Firestore.
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
