<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {{ isEditing ? 'Edit Booking' : 'Create Booking' }}
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        {{ isEditing ? 'Update booking information' : 'Create a new reservation' }}
      </p>
    </div>

    <!-- Loading State for Edit Mode -->
    <div v-if="isEditing && isLoadingData" class="card max-w-2xl">
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading booking data...</p>
        </div>
      </div>
    </div>

    <!-- Form (hidden while loading in edit mode) -->
    <div v-else class="card max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="error" class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="property_id" class="form-label">Property *</label>
            <select
              id="property_id"
              v-model="form.property_id"
              required
              class="form-input"
              @change="calculatePrice"
            >
              <option value="">Select a property</option>
              <option
                v-for="property in properties"
                :key="property.id"
                :value="property.id"
              >
                {{ property.name }} - ${{ property.price_per_night }}/night
              </option>
            </select>
          </div>

          <div>
            <label for="guest_id" class="form-label">Guest *</label>
            <select
              id="guest_id"
              v-model="form.guest_id"
              required
              class="form-input"
            >
              <option value="">Select a guest</option>
              <option
                v-for="guest in guests"
                :key="guest.id"
                :value="guest.id"
              >
                {{ guest.name }} ({{ guest.email }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="check_in_date" class="form-label">Check-in Date *</label>
            <input
              id="check_in_date"
              v-model="form.check_in_date"
              type="date"
              required
              class="form-input"
              :min="today"
              @change="calculatePrice"
            />
          </div>

          <div>
            <label for="check_out_date" class="form-label">Check-out Date *</label>
            <input
              id="check_out_date"
              v-model="form.check_out_date"
              type="date"
              required
              class="form-input"
              :min="form.check_in_date || today"
              @change="calculatePrice"
            />
          </div>
        </div>

        <div v-if="isEditing">
          <label for="status" class="form-label">Status</label>
          <select id="status" v-model="form.status" class="form-input">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label for="notes" class="form-label">Notes</label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            class="form-input"
            placeholder="Any special requests or notes"
          ></textarea>
        </div>

        <!-- Extras Section -->
        <div v-if="extras.length > 0">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Extras</h3>
          <div class="space-y-3">
            <div
              v-for="extra in extras"
              :key="extra.id"
              class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md"
            >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">{{ extra.name }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ extra.description }}</p>
                <p class="text-sm font-medium text-primary-600">${{ extra.price }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  :id="`extra-${extra.id}`"
                  v-model="selectedExtras[extra.id]"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
                  @change="calculatePrice"
                />
                <input
                  v-if="selectedExtras[extra.id]"
                  v-model="extraQuantities[extra.id]"
                  type="number"
                  min="1"
                  class="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm"
                  @change="calculatePrice"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Price Summary -->
        <div v-if="priceBreakdown.nights > 0" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">Price Summary</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{{ priceBreakdown.nights }} nights × ${{ priceBreakdown.pricePerNight }}</span>
              <span>${{ priceBreakdown.baseAmount }}</span>
            </div>
            <div v-if="priceBreakdown.extrasAmount > 0" class="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Extras</span>
              <span>${{ priceBreakdown.extrasAmount }}</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-600 pt-1 flex justify-between font-medium text-gray-900 dark:text-white">
              <span>Total</span>
              <span>${{ priceBreakdown.total }}</span>
            </div>
          </div>
        </div>

        <div class="flex space-x-4">
          <button
            type="submit"
            :disabled="bookingStore.loading"
            class="btn btn-primary disabled:opacity-50"
          >
            <span v-if="bookingStore.loading">
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Update Booking' : 'Create Booking' }}
            </span>
          </button>
          
          <router-link to="/bookings" class="btn btn-secondary">
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/bookingStore'
import { usePropertyStore } from '@/stores/propertyStore'
import { useGuestStore } from '@/stores/guestStore'
import { useExtraStore } from '@/stores/extraStore'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const propertyStore = usePropertyStore()
const guestStore = useGuestStore()
const extraStore = useExtraStore()

const isEditing = computed(() => !!route.params.id)
const isLoadingData = ref(false)
const error = ref('')

const form = ref({
  property_id: '',
  guest_id: '',
  check_in_date: '',
  check_out_date: '',
  status: 'confirmed',
  notes: ''
})

const properties = ref([])
const guests = ref([])
const extras = ref([])
const selectedExtras = ref({})
const extraQuantities = ref({})

const today = new Date().toISOString().split('T')[0]

const priceBreakdown = ref({
  nights: 0,
  pricePerNight: 0,
  baseAmount: 0,
  extrasAmount: 0,
  total: 0
})

const calculatePrice = () => {
  if (!form.value.property_id || !form.value.check_in_date || !form.value.check_out_date) {
    priceBreakdown.value = { nights: 0, pricePerNight: 0, baseAmount: 0, extrasAmount: 0, total: 0 }
    return
  }

  const property = properties.value.find(p => p.id == form.value.property_id)
  if (!property) return

  const checkIn = new Date(form.value.check_in_date)
  const checkOut = new Date(form.value.check_out_date)
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

  if (nights <= 0) {
    priceBreakdown.value = { nights: 0, pricePerNight: 0, baseAmount: 0, extrasAmount: 0, total: 0 }
    return
  }

  const baseAmount = nights * parseFloat(property.price_per_night)
  
  let extrasAmount = 0
  Object.keys(selectedExtras.value).forEach(extraId => {
    if (selectedExtras.value[extraId]) {
      const extra = extras.value.find(e => e.id == extraId)
      if (extra) {
        const quantity = extraQuantities.value[extraId] || 1
        extrasAmount += parseFloat(extra.price) * quantity
      }
    }
  })

  priceBreakdown.value = {
    nights,
    pricePerNight: parseFloat(property.price_per_night),
    baseAmount: baseAmount.toFixed(2),
    extrasAmount: extrasAmount.toFixed(2),
    total: (baseAmount + extrasAmount).toFixed(2)
  }
}

const handleSubmit = async () => {
  error.value = ''
  
  try {
    const bookingData = { ...form.value }
    
    // Add extras
    const extrasData = []
    Object.keys(selectedExtras.value).forEach(extraId => {
      if (selectedExtras.value[extraId]) {
        extrasData.push({
          extra_id: parseInt(extraId),
          quantity: extraQuantities.value[extraId] || 1
        })
      }
    })
    
    if (extrasData.length > 0) {
      bookingData.extras = extrasData
    }
    
    if (isEditing.value) {
      await bookingStore.updateBooking(route.params.id, bookingData)
    } else {
      await bookingStore.createBooking(bookingData)
    }
    
    router.push('/bookings')
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred'
  }
}

onMounted(async () => {
  // Start loading immediately if editing
  if (isEditing.value) {
    isLoadingData.value = true
  }
  
  try {
    // Load dropdown data and booking data in parallel
    const promises = [
      propertyStore.fetchProperties({ per_page: 100 }),
      guestStore.fetchGuests({ per_page: 100 }),
      extraStore.fetchExtras({ is_active: 1, per_page: 100 })
    ]
    
    // If editing, add booking fetch to parallel promises
    if (isEditing.value) {
      promises.push(bookingStore.fetchBooking(route.params.id))
    }
    
    // Wait for all data to load
    const results = await Promise.all(promises)
    
    properties.value = propertyStore.properties
    guests.value = guestStore.guests
    extras.value = extraStore.extras
    
    // Initialize extra quantities
    extras.value.forEach(extra => {
      extraQuantities.value[extra.id] = 1
    })
    
    if (isEditing.value) {
      // Booking data is already loaded from Promise.all above
      const booking = results[3] // Fourth promise result
      form.value = {
        property_id: booking.property_id,
        guest_id: booking.guest_id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        status: booking.status,
        notes: booking.notes || ''
      }
      
      // Set selected extras
      if (booking.extras) {
        booking.extras.forEach(extra => {
          selectedExtras.value[extra.id] = true
          extraQuantities.value[extra.id] = extra.quantity || 1
        })
      }
      
      calculatePrice()
    }
  } catch (err) {
    if (isEditing.value && err.response?.status === 404) {
      error.value = 'Booking not found'
    } else {
      error.value = 'Error loading data'
    }
  } finally {
    // Always stop loading spinner
    if (isEditing.value) {
      isLoadingData.value = false
    }
  }
})

// Watch for form changes to recalculate price
watch([
  () => form.value.property_id,
  () => form.value.check_in_date,
  () => form.value.check_out_date
], calculatePrice)
</script>