<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { loginUser } from '../utils/auth'

const router = useRouter()
const authenticationError = ref('')

const form = reactive({
  email: '',
  password: '',
})

const touched = reactive({
  email: false,
  password: false,
})

const errors = reactive({
  email: '',
  password: '',
})

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

async function handleSubmit() {
  authenticationError.value = ''
  touched.email = true
  touched.password = true

  const emailIsValid = validateField('email')
  const passwordIsValid = validateField('password')
  if (!emailIsValid || !passwordIsValid) return

  const user = loginUser(form.email, form.password)
  if (!user) {
    authenticationError.value = 'The email or password is incorrect.'
    return
  }

  await router.push({ name: 'home' })
}
</script>

<template>
  <section class="page-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h1 class="h2">Welcome Back</h1>
              <p class="text-secondary mb-4">Log in to your GreenLoop Melbourne account.</p>

              <div v-if="authenticationError" class="alert alert-danger" role="alert">
                {{ authenticationError }}
              </div>

              <form novalidate @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label class="form-label" for="login-email">Email Address</label>
                  <input
                    id="login-email"
                    v-model="form.email"
                    class="form-control"
                    :class="{ 'is-invalid': touched.email && errors.email }"
                    type="email"
                    autocomplete="email"
                    required
                    :aria-invalid="Boolean(touched.email && errors.email)"
                    aria-describedby="login-email-error"
                    @blur="handleBlur('email')"
                    @input="handleInput('email')"
                  />
                  <div
                    v-if="touched.email && errors.email"
                    id="login-email-error"
                    class="invalid-feedback"
                  >
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label" for="login-password">Password</label>
                  <input
                    id="login-password"
                    v-model="form.password"
                    class="form-control"
                    :class="{ 'is-invalid': touched.password && errors.password }"
                    type="password"
                    autocomplete="current-password"
                    required
                    :aria-invalid="Boolean(touched.password && errors.password)"
                    aria-describedby="login-password-error"
                    @blur="handleBlur('password')"
                    @input="handleInput('password')"
                  />
                  <div
                    v-if="touched.password && errors.password"
                    id="login-password-error"
                    class="invalid-feedback"
                  >
                    {{ errors.password }}
                  </div>
                </div>

                <button class="btn btn-success w-100" type="submit">Login</button>
              </form>

              <p class="text-center mt-4 mb-0">
                Don't have an account?
                <RouterLink class="text-success fw-semibold" to="/register">Register</RouterLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
