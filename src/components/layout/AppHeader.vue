<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            Rental Management System
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ userInitials }}
              </span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ authStore.user?.name }}</span>
          </div>
          
          <button
            @click="handleLogout"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>