<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-sm-8 offset-sm-2">
        <h1 class="text-center">User Information Form</h1>

        <form @submit.prevent="submitForm">

          <!-- Username + Password -->
          <div class="row mb-3">

            <!-- Username -->
            <div class="col-sm-6">
              <label for="username" class="form-label">
                Username
              </label>

              <input
                type="text"
                class="form-control"
                id="username"
                v-model="formData.username"
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
              >

              <div
                v-if="errors.username"
                class="text-danger"
              >
                {{ errors.username }}
              </div>
            </div>

            <!-- Password -->
            <div class="col-sm-6">
              <label for="password" class="form-label">
                Password
              </label>

              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
              >

              <div
                v-if="errors.password"
                class="text-danger"
              >
                {{ errors.password }}
              </div>
            </div>

          </div>

          <!-- Confirm Password -->
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label
                for="confirm-password"
                class="form-label"
              >
                Confirm password
              </label>

              <input
                type="password"
                class="form-control"
                id="confirm-password"
                v-model="formData.confirmPassword"
                @blur="validateConfirmPassword"
              >

              <div
                v-if="errors.confirmPassword"
                class="text-danger"
              >
                {{ errors.confirmPassword }}
              </div>
            </div>
          </div>

          <!-- Resident + Gender -->
          <div class="row mb-3">

            <!-- Australian Resident -->
            <div class="col-sm-6">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="isAustralian"
                  v-model="formData.isAustralian"
                  @blur="() => validateResident(true)"
                  @change="() => validateResident(false)"
                >

                <label
                  class="form-check-label"
                  for="isAustralian"
                >
                  Australian Resident?
                </label>
              </div>

              <div
                v-if="errors.resident"
                class="text-danger"
              >
                {{ errors.resident }}
              </div>
            </div>

            <!-- Gender -->
            <div class="col-sm-6">
              <label for="gender" class="form-label">
                Gender
              </label>

              <select
                class="form-select"
                id="gender"
                v-model="formData.gender"
                @blur="() => validateGender(true)"
                @change="() => validateGender(false)"
              >
                <option value="">
                  Please select
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>
              </select>

              <div
                v-if="errors.gender"
                class="text-danger"
              >
                {{ errors.gender }}
              </div>
            </div>

          </div>

          <!-- Reason for joining -->
          <div class="mb-3">
            <label for="reason" class="form-label">
              Reason for joining
            </label>

            <textarea
              class="form-control"
              id="reason"
              rows="3"
              v-model="formData.reason"
              @blur="() => validateReason(true)"
              @input="() => validateReason(false)"
            ></textarea>

            <div
              v-if="errors.reason"
              class="text-danger"
            >
              {{ errors.reason }}
            </div>

            <div
              v-if="friendMessage"
              class="text-success mt-1"
            >
              {{ friendMessage }}
            </div>
          </div>

          <!-- Suburb -->
          <div class="mb-3">
            <label for="suburb" class="form-label">
              Suburb
            </label>

          <input
            type="text"
            class="form-control"
            id="suburb"
            v-bind:value="formData.suburb"
          >
          </div>

          <!-- Buttons -->
          <div class="text-center">
            <button
              type="submit"
              class="btn btn-primary me-2"
            >
              Submit
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="clearForm"
            >
              Clear
            </button>
          </div>

        </form>

        <!-- Submitted User Information Table -->
        <div
          class="mt-5"
          v-if="submittedCards.length"
        >
          <DataTable :value="submittedCards">

            <Column
              field="username"
              header="Username"
            />

            <Column header="Australian Resident">
              <template #body="slotProps">
                {{ slotProps.data.isAustralian ? 'Yes' : 'No' }}
              </template>
            </Column>

            <Column
              field="gender"
              header="Gender"
            />

            <Column
              field="reason"
              header="Reason for Joining"
            />

          </DataTable>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

/* -------------------------
   Form Data
------------------------- */

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  gender: '',
  suburb: 'Clayton'
})

/* -------------------------
   Validation Errors
------------------------- */

const errors = ref({
  username: null,
  password: null,
  confirmPassword: null,
  resident: null,
  gender: null,
  reason: null
})

/* -------------------------
   Friend Message
------------------------- */

const friendMessage = ref('')

/* -------------------------
   Submitted Cards
------------------------- */

const submittedCards = ref([])

/* -------------------------
   Username Validation
------------------------- */

const validateName = (blur) => {
  const username = formData.value.username
  const lettersOnly = /^[A-Za-z]+$/

  if (username.length < 3) {
    if (blur) {
      errors.value.username =
        'Name must be at least 3 characters'
    }
  } else if (!lettersOnly.test(username)) {
    if (blur) {
      errors.value.username =
        'Username can only contain letters.'
    }
  } else {
    errors.value.username = null
  }
}

/* -------------------------
   Password Validation
------------------------- */

const validatePassword = (blur) => {
  const password = formData.value.password

  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar =
    /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {

    if (blur) {
      errors.value.password =
        `Password must be at least ${minLength} characters long.`
    }

  } else if (!hasUppercase) {

    if (blur) {
      errors.value.password =
        'Password must contain at least one uppercase letter.'
    }

  } else if (!hasLowercase) {

    if (blur) {
      errors.value.password =
        'Password must contain at least one lowercase letter.'
    }

  } else if (!hasNumber) {

    if (blur) {
      errors.value.password =
        'Password must contain at least one number.'
    }

  } else if (!hasSpecialChar) {

    if (blur) {
      errors.value.password =
        'Password must contain at least one special character.'
    }

  } else {
    errors.value.password = null
  }
}

/* -------------------------
   Confirm Password Validation
------------------------- */

const validateConfirmPassword = () => {

  if (!formData.value.confirmPassword) {

    errors.value.confirmPassword =
      'Please confirm your password.'

  } else if (
    formData.value.confirmPassword !==
    formData.value.password
  ) {

    errors.value.confirmPassword =
      'Passwords do not match.'

  } else {

    errors.value.confirmPassword = null

  }
}

/* -------------------------
   Australian Resident
   Validation
------------------------- */

const validateResident = (blur) => {

  if (!formData.value.isAustralian) {

    if (blur) {
      errors.value.resident =
        'Please confirm that you are an Australian resident.'
    }

  } else {

    errors.value.resident = null

  }
}

/* -------------------------
   Gender Validation
------------------------- */

const validateGender = (blur) => {

  if (!formData.value.gender) {

    if (blur) {
      errors.value.gender =
        'Please select your gender.'
    }

  } else {

    errors.value.gender = null

  }
}

/* -------------------------
   Reason Validation
------------------------- */

const validateReason = (blur) => {

  const reason = formData.value.reason

  // Activity 5.3.2
  if (reason.toLowerCase().includes('friend')) {
    friendMessage.value =
      'Great to have a friend'
  } else {
    friendMessage.value = ''
  }

  // Keep previous Week 4 validation
  if (reason.trim().length < 10) {

    if (blur) {
      errors.value.reason =
        'Reason must be at least 10 characters.'
    }

  } else {

    errors.value.reason = null

  }
}

/* -------------------------
   Submit Form
------------------------- */

const submitForm = () => {

  validateName(true)
  validatePassword(true)
  validateConfirmPassword()
  validateResident(true)
  validateGender(true)
  validateReason(true)

  if (
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.resident &&
    !errors.value.gender &&
    !errors.value.reason
  ) {

    submittedCards.value.push({
      ...formData.value
    })

    clearForm()
  }
}

/* -------------------------
   Clear Form
------------------------- */

const clearForm = () => {

  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    isAustralian: false,
    reason: '',
    gender: '',
    suburb: 'Clayton'
  }

  errors.value = {
    username: null,
    password: null,
    confirmPassword: null,
    resident: null,
    gender: null,
    reason: null
  }

  friendMessage.value = ''
}
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #275FDA;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}

.list-group-item {
  padding: 10px;
}

.text-danger {
  margin-top: 5px;
  font-size: 0.9rem;
}

.text-success {
  font-size: 0.9rem;
  font-weight: 500;
}
</style>