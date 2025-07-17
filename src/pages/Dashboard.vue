<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-300">Welcome to your rental management system</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BuildingOfficeIcon class="h-8 w-8 text-primary-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.properties }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CalendarIcon class="h-8 w-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Bookings</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.activeBookings }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UsersIcon class="h-8 w-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Guests</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.guests }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CurrencyDollarIcon class="h-8 w-8 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.revenue }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Bookings -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white">Recent Bookings</h2>
        <router-link to="/bookings" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all
        </router-link>
      </div>
      
      <div v-if="bookingStore.loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
      
      <div v-else-if="recentBookings.length === 0" class="text-center py-8 text-gray-500">
        <span class="text-gray-500 dark:text-gray-400">No recent bookings</span>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Guest
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Property
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Check-in
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Check-out
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="booking in recentBookings" :key="booking.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ booking.guest?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ booking.property?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(booking.check_in_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(booking.check_out_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(booking.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ booking.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${{ booking.total_price }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBookingStore } from '@/stores/bookingStore'
import { usePropertyStore } from '@/stores/propertyStore'
import { useGuestStore } from '@/stores/guestStore'
import {
  BuildingOfficeIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

const bookingStore = useBookingStore()
const propertyStore = usePropertyStore()
const guestStore = useGuestStore()

const stats = ref({
  properties: 0,
  activeBookings: 0,
  guests: 0,
  revenue: 0
})

const recentBookings = computed(() => {
  return bookingStore.bookings.slice(0, 5)
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status) => {
  const classes = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

onMounted(async () => {
  try {
    // Fetch recent bookings
    await bookingStore.fetchBookings({ per_page: 5 })
    
    // Fetch stats (you can create dedicated endpoints for these)
    await propertyStore.fetchProperties({ per_page: 1 })
    await guestStore.fetchGuests({ per_page: 1 })
    
    // Calculate stats from pagination data
    stats.value = {
      properties: propertyStore.pagination.total || 0,
      activeBookings: bookingStore.bookings.filter(b => b.status === 'confirmed').length,
      guests: guestStore.pagination.total || 0,
      revenue: bookingStore.bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + parseFloat(booking.total_price), 0)
        .toFixed(0)
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>