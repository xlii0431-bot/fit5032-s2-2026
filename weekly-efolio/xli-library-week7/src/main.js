import { createApp } from 'vue'

import App from './App.vue'

import router from './router'

import PrimeVue from 'primevue/config'

import Aura from '@primevue/themes/aura'

import 'bootstrap/dist/css/bootstrap.min.css'

import './style.css'

// Firebase
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyALQ5vjWG9zDX_aKV54yb19Fhv87KujOxs",
  authDomain: "fit5032-f7514.firebaseapp.com",
  projectId: "fit5032-f7514",
  storageBucket: "fit5032-f7514.firebasestorage.app",
  messagingSenderId: "774406189397",
  appId: "1:774406189397:web:bd4dc85dceb6bf5a6c7fdc"
};

initializeApp(firebaseConfig)

const app = createApp(App)

app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

app.mount('#app')