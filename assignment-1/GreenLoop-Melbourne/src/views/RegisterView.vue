<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthPageLayout from '../components/AuthPageLayout.vue'
import GoogleAuthButton from '../components/GoogleAuthButton.vue'
import { loginWithGoogle, registerUser } from '../utils/auth'

const router = useRouter()
const isDevelopment = import.meta.env.DEV
const registrationError = ref('')
const registrationForm = ref(null)
const registrationErrorDetails = ref(null)
const isRegistrationLoading = ref(false)
const isGoogleLoading = ref(false)
const isBusy = computed(() => isRegistrationLoading.value || isGoogleLoading.value)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const touched = reactive({
  username: false,
  email: false,
  password: false,
  confirmPassword: false,
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function validateUsername() {
  const username = form.username.trim()

  if (!username) return 'Username is required.'
  if (username.length < 3 || username.length > 20) {
    return 'Username must contain between 3 and 20 characters.'
  }
  return ''
}

function validateEmail() {
  const email = form.email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) return 'Email address is required.'
  if (!emailPattern.test(email)) return 'Please enter a valid email address.'
  return ''
}

function validatePassword() {
  if (!form.password) return 'Password is required.'
  if (form.password.length < 8) return 'Password must contain at least 8 characters.'
  if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.'
  if (!/[a-z]/.test(form.password)) return 'Password must contain at least one lowercase letter.'
  if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.'
  return ''
}

function validateConfirmPassword() {
  if (!form.confirmPassword) return 'Please confirm your password.'
  if (form.confirmPassword !== form.password) return 'Passwords do not match.'
  return ''
}

const validators = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
}

function validateField(fieldName) {
  errors[fieldName] = validators[fieldName]()
  return !errors[fieldName]
}

function handleBlur(fieldName) {
  touched[fieldName] = true
  validateField(fieldName)
}

function handleInput(fieldName) {
  registrationError.value = ''
  registrationErrorDetails.value = null
  if (touched[fieldName]) validateField(fieldName)

  if (fieldName === 'password' && touched.confirmPassword) {
    validateField('confirmPassword')
  }
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

  registrationError.value = ''
  registrationErrorDetails.value = null

  Object.keys(touched).forEach((fieldName) => {
    touched[fieldName] = true
  })

  const validationResults = Object.keys(validators).map((fieldName) => validateField(fieldName))
  if (!validationResults.every(Boolean)) {
    await nextTick()
    registrationForm.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }

  isRegistrationLoading.value = true
  try {
    await registerUser(form.username, form.email, form.password)
    await router.push({ name: 'login', query: { registered: 'true' } })
  } catch (error) {
    registrationErrorDetails.value = {
      stage: error.registrationStage || 'unknown',
      code: error.code || 'unknown',
    }

    if (import.meta.env.DEV) {
      console.error('Firebase registration failed', {
        stage: registrationErrorDetails.value.stage,
        code: registrationErrorDetails.value.code,
        message: error.message,
      })
    }

    if (error.code === 'auth/email-already-in-use') {
      errors.email = 'An account with this email already exists.'
      touched.email = true
    } else if (error.code === 'auth/invalid-email') {
      errors.email = 'Please enter a valid email address.'
      touched.email = true
    } else if (error.code === 'auth/weak-password') {
      errors.password = 'Firebase rejected this password because it is too weak.'
      touched.password = true
    }

    registrationError.value =
      error.code === 'auth/email-already-in-use' ||
      error.code === 'auth/invalid-email' ||
      error.code === 'auth/weak-password'
        ? 'Registration could not be completed. Please review the form.'
        : 'Registration could not be completed. Please try again.'
  } finally {
    isRegistrationLoading.value = false
  }
}

async function handleGoogleRegistration() {
  if (isBusy.value) return

  registrationError.value = ''
  registrationErrorDetails.value = null
  isGoogleLoading.value = true
  try {
    await loginWithGoogle()
    await router.push({ name: 'home' })
  } catch (error) {
    registrationError.value = getGoogleErrorMessage(error)
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<template>
  <AuthPageLayout title="Create an Account" subtitle="Join GreenLoop Melbourne.">
    <div v-if="registrationError" class="alert alert-danger" role="alert">
      {{ registrationError }}
      <small v-if="isDevelopment && registrationErrorDetails" class="d-block mt-2">
        Development details: {{ registrationErrorDetails.stage }} —
        {{ registrationErrorDetails.code }}
      </small>
    </div>

    <form
      ref="registrationForm"
      novalidate
      :aria-busy="isRegistrationLoading"
      @submit.prevent="handleSubmit"
    >
      <div class="mb-3">
        <label class="form-label fw-semibold" for="register-username">Username</label>
        <input
          id="register-username"
          v-model="form.username"
          class="form-control"
          :class="{ 'is-invalid': touched.username && errors.username }"
          type="text"
          autocomplete="username"
          required
          :disabled="isBusy"
          :aria-invalid="Boolean(touched.username && errors.username)"
          :aria-describedby="touched.username && errors.username ? 'register-username-error' : undefined"
          @blur="handleBlur('username')"
          @input="handleInput('username')"
        />
        <div
          v-if="touched.username && errors.username"
          id="register-username-error"
          class="invalid-feedback"
          role="alert"
        >
          {{ errors.username }}
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold" for="register-email">Email Address</label>
        <input
          id="register-email"
          v-model="form.email"
          class="form-control"
          :class="{ 'is-invalid': touched.email && errors.email }"
          type="email"
          autocomplete="email"
          required
          :disabled="isBusy"
          :aria-invalid="Boolean(touched.email && errors.email)"
          :aria-describedby="touched.email && errors.email ? 'register-email-error' : undefined"
          @blur="handleBlur('email')"
          @input="handleInput('email')"
        />
        <div
          v-if="touched.email && errors.email"
          id="register-email-error"
          class="invalid-feedback"
          role="alert"
        >
          {{ errors.email }}
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold" for="register-password">Password</label>
        <input
          id="register-password"
          v-model="form.password"
          class="form-control"
          :class="{ 'is-invalid': touched.password && errors.password }"
          type="password"
          autocomplete="new-password"
          required
          :disabled="isBusy"
          :aria-invalid="Boolean(touched.password && errors.password)"
          :aria-describedby="touched.password && errors.password
            ? 'register-password-help register-password-error'
            : 'register-password-help'"
          @blur="handleBlur('password')"
          @input="handleInput('password')"
        />
        <div id="register-password-help" class="form-text">
          Use at least 8 characters with uppercase, lowercase and a number.
        </div>
        <div
          v-if="touched.password && errors.password"
          id="register-password-error"
          class="invalid-feedback d-block"
          role="alert"
        >
          {{ errors.password }}
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label fw-semibold" for="register-confirm-password">
          Confirm Password
        </label>
        <input
          id="register-confirm-password"
          v-model="form.confirmPassword"
          class="form-control"
          :class="{ 'is-invalid': touched.confirmPassword && errors.confirmPassword }"
          type="password"
          autocomplete="new-password"
          required
          :disabled="isBusy"
          :aria-invalid="Boolean(touched.confirmPassword && errors.confirmPassword)"
          :aria-describedby="touched.confirmPassword && errors.confirmPassword
            ? 'register-confirm-password-error'
            : undefined"
          @blur="handleBlur('confirmPassword')"
          @input="handleInput('confirmPassword')"
        />
        <div
          v-if="touched.confirmPassword && errors.confirmPassword"
          id="register-confirm-password-error"
          class="invalid-feedback"
          role="alert"
        >
          {{ errors.confirmPassword }}
        </div>
      </div>

      <button class="btn btn-success w-100" type="submit" :disabled="isBusy">
        <span
          v-if="isRegistrationLoading"
          class="spinner-border spinner-border-sm me-2"
          aria-hidden="true"
        ></span>
        {{ isRegistrationLoading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>

    <div class="auth-divider my-4" role="separator" aria-label="Or continue with social login">
      <span>OR</span>
    </div>

    <GoogleAuthButton
      :disabled="isBusy"
      :loading="isGoogleLoading"
      @activate="handleGoogleRegistration"
    />

    <p class="text-center mt-4 mb-0">
      Already have an account?
      <RouterLink class="text-success fw-semibold" to="/login">Login</RouterLink>
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
