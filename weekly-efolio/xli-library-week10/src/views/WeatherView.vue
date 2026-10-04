<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

const city = ref('')
const weather = ref(null)
const errorMessage = ref('')
const isLoading = ref(false)

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
const weatherIconUrl = computed(() => {
  const icon = weather.value?.weather?.[0]?.icon
  return icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
})

async function getWeather(params) {
  if (!apiKey) {
    errorMessage.value = 'Weather service is not configured.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        ...params,
        appid: apiKey,
        units: 'metric',
      },
    })
    weather.value = response.data
  } catch (error) {
    console.error('Unable to load weather:', error)
    weather.value = null
    errorMessage.value = 'Unable to load weather. Please check the location and try again.'
  } finally {
    isLoading.value = false
  }
}

function searchByCity() {
  const query = city.value.trim()
  if (!query) {
    errorMessage.value = 'Please enter a city.'
    return
  }

  getWeather({ q: query })
}

onMounted(() => {
  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by this browser.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => getWeather({ lat: coords.latitude, lon: coords.longitude }),
    (error) => {
      console.error('Unable to access current location:', error)
      console.error('Geolocation error code:', error.code)
      console.error('Geolocation error message:', error.message)
      errorMessage.value = `Unable to access your location (code ${error.code}: ${error.message}). Search for a city instead.`
    },
  )
})
</script>

<template>
  <main class="container">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <h1 class="mb-4 text-center">Weather Check</h1>

        <div class="input-group mb-4">
          <input
            v-model="city"
            type="text"
            class="form-control"
            placeholder="Enter a city, for example Clayton, AU"
            aria-label="City"
            @keyup.enter="searchByCity"
          />
          <button type="button" class="btn btn-primary" :disabled="isLoading" @click="searchByCity">
            {{ isLoading ? 'Loading...' : 'Search' }}
          </button>
        </div>

        <p v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </p>

        <article v-if="weather" class="card text-center">
          <div class="card-body">
            <h2 class="card-title">{{ weather.name }}, {{ weather.sys.country }}</h2>
            <img
              v-if="weatherIconUrl"
              :src="weatherIconUrl"
              :alt="weather.weather[0].description"
              width="100"
              height="100"
            />
            <p class="display-6 mb-2">{{ Math.round(weather.main.temp) }}°C</p>
            <p class="card-text text-capitalize">{{ weather.weather[0].description }}</p>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>
