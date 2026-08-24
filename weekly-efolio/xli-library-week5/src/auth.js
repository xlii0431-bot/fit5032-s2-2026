import { ref } from 'vue'

export const isAuthenticated = ref(false)

export function login(username, password) {
  const credentialsAreValid = username === 'admin' && password === 'password123'

  isAuthenticated.value = credentialsAreValid
  return credentialsAreValid
}

export function logout() {
  isAuthenticated.value = false
}
