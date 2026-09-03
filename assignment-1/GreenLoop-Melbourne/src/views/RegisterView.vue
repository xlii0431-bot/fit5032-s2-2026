<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registerUser } from '../utils/auth'

const router = useRouter()
const isDevelopment = import.meta.env.DEV
const registrationError = ref('')
const registrationErrorDetails = ref(null)

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
  if (!/[A-Z]/.test(form.password)) {
    return 'Password must contain at least one uppercase letter.'
  }
  if (!/[a-z]/.test(form.password)) {
    return 'Password must contain at least one lowercase letter.'
  }
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

async function handleSubmit() {
  registrationError.value = ''
  registrationErrorDetails.value = null

  Object.keys(touched).forEach((fieldName) => {
    touched[fieldName] = true
  })

  const validationResults = Object.keys(validators).map((fieldName) =>
    validateField(fieldName),
  )
  if (!validationResults.every(Boolean)) return

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
  }
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-9 col-lg-7 col-xl-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h1 class="h2">Create an Account</h1>
              <p class="text-secondary mb-4">Join GreenLoop Melbourne</p>

              <div v-if="registrationError" class="alert alert-danger" role="alert">
                {{ registrationError }}
                <small v-if="isDevelopment && registrationErrorDetails" class="d-block mt-2">
                  Development details: {{ registrationErrorDetails.stage }} —
                  {{ registrationErrorDetails.code }}
                </small>
              </div>

              <form novalidate @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label" for="register-username">Username</label>
                  <input
                    id="register-username"
                    v-model="form.username"
                    class="form-control"
                    :class="{ 'is-invalid': touched.username && errors.username }"
                    type="text"
                    autocomplete="username"
                    required
                    :aria-invalid="Boolean(touched.username && errors.username)"
                    aria-describedby="register-username-error"
                    @blur="handleBlur('username')"
                    @input="handleInput('username')"
                  />
                  <div
                    v-if="touched.username && errors.username"
                    id="register-username-error"
                    class="invalid-feedback"
                  >
                    {{ errors.username }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="register-email">Email Address</label>
                  <input
                    id="register-email"
                    v-model="form.email"
                    class="form-control"
                    :class="{ 'is-invalid': touched.email && errors.email }"
                    type="email"
                    autocomplete="email"
                    required
                    :aria-invalid="Boolean(touched.email && errors.email)"
                    aria-describedby="register-email-error"
                    @blur="handleBlur('email')"
                    @input="handleInput('email')"
                  />
                  <div
                    v-if="touched.email && errors.email"
                    id="register-email-error"
                    class="invalid-feedback"
                  >
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="register-password">Password</label>
                  <input
                    id="register-password"
                    v-model="form.password"
                    class="form-control"
                    :class="{ 'is-invalid': touched.password && errors.password }"
                    type="password"
                    autocomplete="new-password"
                    required
                    :aria-invalid="Boolean(touched.password && errors.password)"
                    aria-describedby="register-password-error register-password-help"
                    @blur="handleBlur('password')"
                    @input="handleInput('password')"
                  />
                  <div id="register-password-help" class="form-text">
                    Use at least 8 characters with uppercase, lowercase and a number.
                  </div>
                  <div
                    v-if="touched.password && errors.password"
                    id="register-password-error"
                    class="invalid-feedback"
                  >
                    {{ errors.password }}
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label" for="register-confirm-password">
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
                    :aria-invalid="Boolean(touched.confirmPassword && errors.confirmPassword)"
                    aria-describedby="register-confirm-password-error"
                    @blur="handleBlur('confirmPassword')"
                    @input="handleInput('confirmPassword')"
                  />
                  <div
                    v-if="touched.confirmPassword && errors.confirmPassword"
                    id="register-confirm-password-error"
                    class="invalid-feedback"
                  >
                    {{ errors.confirmPassword }}
                  </div>
                </div>

                <button class="btn btn-success w-100" type="submit">Register</button>
              </form>

              <p class="text-center mt-4 mb-0">
                Already have an account?
                <RouterLink class="text-success fw-semibold" to="/login">Login</RouterLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
