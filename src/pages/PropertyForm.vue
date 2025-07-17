<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEditing ? 'Edit Property' : 'Create Property' }}
      </h1>
      <p class="text-gray-600">
        {{ isEditing ? 'Update property information' : 'Add a new rental property' }}
      </p>
    </div>

    <!-- Loading State for Edit Mode -->
    <div v-if="isEditing && isLoadingData" class="card max-w-2xl">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading property data...</p>
        </div>
      </div>
    </div>

    <!-- Form (hidden while loading in edit mode) -->
    <div v-else class="card max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div>
          <label for="name" class="form-label">Property Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="Enter property name"
          />
        </div>

        <div>
          <label for="address" class="form-label">Address *</label>
          <textarea
            id="address"
            v-model="form.address"
            required
            rows="3"
            class="form-input"
            placeholder="Enter full address"
          ></textarea>
        </div>

        <div>
          <label for="description" class="form-label">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            class="form-input"
            placeholder="Describe the property, amenities, and features"
          ></textarea>
        </div>

        <div>
          <label for="price_per_night" class="form-label">Price per Night ($) *</label>
          <input
            id="price_per_night"
            v-model="form.price_per_night"
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
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="is_active" class="ml-2 block text-sm text-gray-900">
            Property is active and available for booking
          </label>
        </div>

        <div class="flex space-x-4">
          <button
            type="submit"
            :disabled="propertyStore.loading"
            class="btn btn-primary disabled:opacity-50"
          >
            <span v-if="propertyStore.loading">
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Update Property' : 'Create Property' }}
            </span>
          </button>
          
          <router-link to="/properties" class="btn btn-secondary">
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
import { usePropertyStore } from '@/stores/propertyStore'

const route = useRoute()
const router = useRouter()
const propertyStore = usePropertyStore()

const isEditing = computed(() => !!route.params.id)
const isLoadingData = ref(false)
const error = ref('')

const form = ref({
  name: '',
  address: '',
  description: '',
  price_per_night: '',
  is_active: true
})

const handleSubmit = async () => {
  error.value = ''
  
  try {
    if (isEditing.value) {
      await propertyStore.updateProperty(route.params.id, form.value)
    } else {
      await propertyStore.createProperty(form.value)
    }
    
    router.push('/properties')
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred'
  }
}

onMounted(async () => {
  if (isEditing.value) {
    isLoadingData.value = true
    try {
      const property = await propertyStore.fetchProperty(route.params.id)
      form.value = {
        name: property.name,
        address: property.address,
        description: property.description,
        price_per_night: property.price_per_night,
        is_active: property.is_active
      }
    } catch (err) {
      error.value = 'Property not found'
    } finally {
      isLoadingData.value = false
    }
  }
})
</script>