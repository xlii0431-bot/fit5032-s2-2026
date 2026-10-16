<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const isOnline = ref(true)

function updateStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  updateStatus()
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<template>
  <div
    class="network-status small"
    :class="isOnline ? 'network-status-online' : 'network-status-offline'"
    role="status"
    aria-live="polite"
  >
    <span aria-hidden="true">{{ isOnline ? '●' : '○' }}</span>
    {{ isOnline ? 'Online' : 'Offline — cached guidance remains available' }}
  </div>
</template>

<style scoped>
.network-status {
  padding: 0.35rem 0.75rem;
  text-align: center;
}

.network-status-online {
  color: #0b4f30;
  background: #dff3e6;
}

.network-status-offline {
  color: #5f3b00;
  background: #fff3cd;
}
</style>
