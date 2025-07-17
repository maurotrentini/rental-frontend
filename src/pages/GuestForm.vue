<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEditing ? 'Edit Guest' : 'Add Guest' }}
      </h1>
      <p class="text-gray-600">
        {{ isEditing ? 'Update guest information' : 'Create a new guest profile' }}
      </p>
    </div>

    <!-- Loading State for Edit Mode -->
    <div v-if="isEditing && isLoadingData" class="card max-w-2xl">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading guest data...</p>
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
          <label for="name" class="form-label">Full Name *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="Enter guest's full name"
          />
        </div>

        <div>
          <label for="email" class="form-label">Email Address *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label for="phone" class="form-label">Phone Number</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="form-input"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label for="notes" class="form-label">Notes</label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="4"
            class="form-input"
            placeholder="Any special notes or preferences"
          ></textarea>
        </div>

        <div class="flex space-x-4">
          <button
            type="submit"
            :disabled="guestStore.loading"
            class="btn btn-primary disabled:opacity-50"
          >
            <span v-if="guestStore.loading">
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Update Guest' : 'Create Guest' }}
            </span>
          </button>
          
          <router-link to="/guests" class="btn btn-secondary">
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
import { useGuestStore } from '@/stores/guestStore'

const route = useRoute()
const router = useRouter()
const guestStore = useGuestStore()

const isEditing = computed(() => !!route.params.id)
const isLoadingData = ref(false)
const error = ref('')

const form = ref({
  name: '',
  email: '',
  phone: '',
  notes: ''
})

const handleSubmit = async () => {
  error.value = ''
  
  try {
    if (isEditing.value) {
      await guestStore.updateGuest(route.params.id, form.value)
    } else {
      await guestStore.createGuest(form.value)
    }
    
    router.push('/guests')
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred'
  }
}

onMounted(async () => {
  if (isEditing.value) {
    isLoadingData.value = true
    try {
      const guest = await guestStore.fetchGuest(route.params.id)
      form.value = {
        name: guest.name,
        email: guest.email,
        phone: guest.phone || '',
        notes: guest.notes || ''
      }
    } catch (err) {
      error.value = 'Guest not found'
    } finally {
      isLoadingData.value = false
    }
  }
})
</script>