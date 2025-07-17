<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ isEditing ? 'Edit Extra' : 'Create Extra' }}
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        {{ isEditing ? 'Update extra service information' : 'Add a new extra service' }}
      </p>
    </div>

    <!-- Loading State for Edit Mode -->
    <div v-if="isEditing && isLoadingData" class="card max-w-2xl">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading extra data...</p>
        </div>
      </div>
    </div>

    <!-- Form (hidden while loading in edit mode) -->
    <div v-else class="card max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="error" class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div>
          <label for="name" class="form-label">Service Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="Enter service name"
          />
        </div>

        <div>
          <label for="description" class="form-label">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            class="form-input"
            placeholder="Describe the service and what it includes"
          ></textarea>
        </div>

        <div>
          <label for="price" class="form-label">Price ($) *</label>
          <input
            id="price"
            v-model="form.price"
            type="number"
            step="0.01"
            min="0"
            required
            class="form-input"
            placeholder="0.00"
          />
        </div>

        <div class="flex items-center">
          <input
            id="is_active"
            v-model="form.is_active"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
          />
          <label for="is_active" class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            Service is active and available for booking
          </label>
        </div>

        <div class="flex space-x-4">
          <button
            type="submit"
            :disabled="extraStore.loading"
            class="btn btn-primary disabled:opacity-50"
          >
            <span v-if="extraStore.loading">
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Update Extra' : 'Create Extra' }}
            </span>
          </button>
          
          <router-link to="/extras" class="btn btn-secondary">
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExtraStore } from '@/stores/extraStore'

const route = useRoute()
const router = useRouter()
const extraStore = useExtraStore()

const isEditing = computed(() => !!route.params.id)
const isLoadingData = ref(false)
const error = ref('')

const form = ref({
  name: '',
  description: '',
  price: '',
  is_active: true
})

const handleSubmit = async () => {
  error.value = ''
  
  try {
    if (isEditing.value) {
      await extraStore.updateExtra(route.params.id, form.value)
    } else {
      await extraStore.createExtra(form.value)
    }
    
    router.push('/extras')
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred'
  }
}

onMounted(async () => {
  if (isEditing.value) {
    isLoadingData.value = true
    try {
      const extra = await extraStore.fetchExtra(route.params.id)
      form.value = {
        name: extra.name,
        description: extra.description,
        price: extra.price,
        is_active: extra.is_active
      }
    } catch (err) {
      error.value = 'Extra not found'
    } finally {
      isLoadingData.value = false
    }
  }
})
</script>