<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthPageLayout from '../components/AuthPageLayout.vue'
import GoogleAuthButton from '../components/GoogleAuthButton.vue'
import { loginUser, loginWithGoogle } from '../utils/auth'

const router = useRouter()
const route = useRoute()
const authenticationError = ref('')
const loginForm = ref(null)
const isPasswordLoading = ref(false)
const isGoogleLoading = ref(false)
const isBusy = computed(() => isPasswordLoading.value || isGoogleLoading.value)

const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const errors = reactive({ email: '', password: '' })

function validateEmail() {
  const email = form.email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) return 'Email address is required.'
  if (!emailPattern.test(email)) return 'Please enter a valid email address.'
  return ''
}

function validatePassword() {
  return form.password ? '' : 'Password is required.'
}

function validateField(fieldName) {
  errors[fieldName] = fieldName === 'email' ? validateEmail() : validatePassword()
  return !errors[fieldName]
}

function handleBlur(fieldName) {
  touched[fieldName] = true
  validateField(fieldName)
}

function handleInput(fieldName) {
  authenticationError.value = ''
  if (touched[fieldName]) validateField(fieldName)
}

function getLoginDestination() {
  const requestedRedirect = route.query.redirect

  if (
    typeof requestedRedirect === 'string' &&
    requestedRedirect.startsWith('/') &&
    !requestedRedirect.startsWith('//')
  ) {
    const resolvedRoute = router.resolve(requestedRedirect)
    const isProtectedRoute = resolvedRoute.matched.some(
      (matchedRoute) => matchedRoute.meta.requiresAuth,
    )

    if (isProtectedRoute) return requestedRedirect
  }

  return { name: 'home' }
}

function getGoogleErrorMessage(error) {
  const messages = {
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'The Google sign-in window was blocked. Allow pop-ups and try again.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled for this application.',
  }

  return messages[error.code] || 'Google sign-in could not be completed. Please try again.'
}

async function handleSubmit() {
  if (isBusy.value) return

  authenticationError.value = ''
  touched.email = true
  touched.password = true

  const emailIsValid = validateField('email')
  const passwordIsValid = validateField('password')
  if (!emailIsValid || !passwordIsValid) {
    await nextTick()
    loginForm.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }

  isPasswordLoading.value = true
  try {
    await loginUser(form.email, form.password)
    await router.push(getLoginDestination())
  } catch (error) {
    const invalidCredentialCodes = [
      'auth/invalid-credential',
      'auth/invalid-login-credentials',
      'auth/user-not-found',
      'auth/wrong-password',
    ]

    authenticationError.value = invalidCredentialCodes.includes(error.code)
      ? 'The email or password is incorrect.'
      : 'Login could not be completed. Please try again.'
  } finally {
    isPasswordLoading.value = false
  }
}

async function handleGoogleLogin() {
  if (isBusy.value) return

  authenticationError.value = ''
  isGoogleLoading.value = true
  try {
    await loginWithGoogle()
    await router.push(getLoginDestination())
  } catch (error) {
    authenticationError.value = getGoogleErrorMessage(error)
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<template>
  <AuthPageLayout
    title="Welcome Back"
    subtitle="Log in to your GreenLoop Melbourne account."
  >
    <div v-if="route.query.registered === 'true'" class="alert alert-success" role="status">
      Your account was created successfully. You can now log in.
    </div>

    <div v-if="authenticationError" class="alert alert-danger" role="alert">
      {{ authenticationError }}
    </div>

    <form ref="loginForm" novalidate :aria-busy="isPasswordLoading" @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label class="form-label fw-semibold" for="login-email">Email Address</label>
        <input
          id="login-email"
          v-model="form.email"
          class="form-control form-control-lg"
          :class="{ 'is-invalid': touched.email && errors.email }"
          type="email"
          autocomplete="email"
          required
          :disabled="isBusy"
          :aria-invalid="Boolean(touched.email && errors.email)"
          :aria-describedby="touched.email && errors.email ? 'login-email-error' : undefined"
          @blur="handleBlur('email')"
          @input="handleInput('email')"
        />
        <div
          v-if="touched.email && errors.email"
          id="login-email-error"
          class="invalid-feedback"
          role="alert"
        >
          {{ errors.email }}
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label fw-semibold" for="login-password">Password</label>
        <input
          id="login-password"
          v-model="form.password"
          class="form-control form-control-lg"
          :class="{ 'is-invalid': touched.password && errors.password }"
          type="password"
          autocomplete="current-password"
          required
          :disabled="isBusy"
          :aria-invalid="Boolean(touched.password && errors.password)"
          :aria-describedby="touched.password && errors.password ? 'login-password-error' : undefined"
          @blur="handleBlur('password')"
          @input="handleInput('password')"
        />
        <div
          v-if="touched.password && errors.password"
          id="login-password-error"
          class="invalid-feedback"
          role="alert"
        >
          {{ errors.password }}
        </div>
      </div>

      <button class="btn btn-success btn-lg w-100" type="submit" :disabled="isBusy">
        <span
          v-if="isPasswordLoading"
          class="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        ></span>
        {{ isPasswordLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <div class="auth-divider my-4" role="separator" aria-label="Or continue with social login">
      <span>OR</span>
    </div>

    <GoogleAuthButton
      :disabled="isBusy"
      :loading="isGoogleLoading"
      @activate="handleGoogleLogin"
    />

    <p class="text-center mt-4 mb-0">
      Don't have an account?
      <RouterLink class="text-success fw-semibold" to="/register">Create account</RouterLink>
    </p>
  </AuthPageLayout>
</template>

<style scoped>
.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.auth-divider::before,
.auth-divider::after {
  flex: 1;
  border-top: 1px solid #d9e2db;
  content: '';
}
</style>
