<script setup>
import { onMounted, ref } from 'vue'
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import db from '../Firebase/init.js'

const books = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const editingId = ref(null)
const editIsbn = ref('')
const editName = ref('')
const isSaving = ref(false)
const actionError = ref('')
const successMessage = ref('')

async function fetchBooks() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const booksQuery = query(
      collection(db, 'books'),
      where('isbn', '>', 1000),
      orderBy('isbn', 'asc'),
      limit(5),
    )
    const snapshot = await getDocs(booksQuery)
    books.value = snapshot.docs.map((document) => ({
      ...document.data(),
      id: document.id,
    }))
  } catch (error) {
    console.error('Unable to load books:', error)
    errorMessage.value = 'Unable to load books. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

function startEdit(book) {
  if (isSaving.value) return
  editingId.value = book.id
  editIsbn.value = book.isbn
  editName.value = book.name
  actionError.value = ''
  successMessage.value = ''
}

function cancelEdit() {
  editingId.value = null
  editIsbn.value = ''
  editName.value = ''
}

async function updateBook() {
  if (isSaving.value || editingId.value === null) return
  actionError.value = ''
  successMessage.value = ''

  const numericIsbn = Number(editIsbn.value)
  if (String(editIsbn.value).trim() === '' || !Number.isFinite(numericIsbn) || !editName.value.trim()) {
    actionError.value = 'Please enter a valid ISBN number and book name.'
    return
  }

  isSaving.value = true
  try {
    await updateDoc(doc(db, 'books', editingId.value), {
      isbn: numericIsbn,
      name: editName.value.trim(),
    })
    cancelEdit()
    successMessage.value = 'Book updated successfully.'
    await fetchBooks()
  } catch (error) {
    console.error('Unable to update book:', error)
    actionError.value = 'Unable to update the book. Please try again.'
  } finally {
    isSaving.value = false
  }
}

async function deleteBook(book) {
  if (isSaving.value) return
  if (!window.confirm(`Delete "${book.name}"?`)) return

  actionError.value = ''
  successMessage.value = ''
  isSaving.value = true
  try {
    await deleteDoc(doc(db, 'books', book.id))
    if (editingId.value === book.id) cancelEdit()
    successMessage.value = 'Book deleted successfully.'
    await fetchBooks()
  } catch (error) {
    console.error('Unable to delete book:', error)
    actionError.value = 'Unable to delete the book. Please try again.'
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchBooks)
</script>

<template>
  <section class="mt-4">
    <h2 class="mb-3">Books</h2>

    <p v-if="successMessage" class="alert alert-success" role="status">
      {{ successMessage }}
    </p>
    <p v-if="actionError" class="alert alert-danger" role="alert">
      {{ actionError }}
    </p>

    <p v-if="isLoading" class="text-muted" role="status">Loading books...</p>
    <p v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </p>
    <p v-else-if="books.length === 0" class="text-muted">No books with ISBN greater than 1000.</p>
    <ul v-else class="list-group">
      <li v-for="book in books" :key="book.id" class="list-group-item">
        <strong>{{ book.name }}</strong>
        <div>ISBN: {{ book.isbn }}</div>

        <div class="d-flex gap-2 mt-2">
          <button type="button" class="btn btn-outline-primary" :disabled="isSaving" @click="startEdit(book)">
            Edit
          </button>
          <button type="button" class="btn btn-outline-danger" :disabled="isSaving" @click="deleteBook(book)">
            Delete
          </button>
        </div>

        <form v-if="editingId === book.id" class="mt-3" @submit.prevent="updateBook">
          <div class="mb-3">
            <label :for="`edit-isbn-${book.id}`" class="form-label">ISBN</label>
            <input
              :id="`edit-isbn-${book.id}`"
              v-model="editIsbn"
              type="number"
              class="form-control"
              :disabled="isSaving"
              required
            />
          </div>
          <div class="mb-3">
            <label :for="`edit-name-${book.id}`" class="form-label">Name</label>
            <input
              :id="`edit-name-${book.id}`"
              v-model="editName"
              type="text"
              class="form-control"
              :disabled="isSaving"
              required
            />
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="isSaving" @click="cancelEdit">
              Cancel
            </button>
          </div>
        </form>
      </li>
    </ul>
  </section>
</template>
