<template>
  <div id="app">
    <div v-if="!authStore.isAuthenticated" class="min-h-screen">
      <router-view />
    </div>
    
    <div v-else class="min-h-screen bg-gray-50">
      <AppHeader />
      <div class="flex">
        <AppSidebar />
        <main class="flex-1 p-6">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>