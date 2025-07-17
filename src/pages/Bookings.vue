<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bookings</h1>
        <p class="text-gray-600">Manage property reservations</p>
      </div>
      <router-link to="/bookings/create" class="btn btn-primary">
        New Booking
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">Status</label>
          <select v-model="filters.status" class="form-input" @change="fetchBookings">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label class="form-label">From Date</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="form-input"
            @change="fetchBookings"
          />
        </div>
        <div>
          <label class="form-label">To Date</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="form-input"
            @change="fetchBookings"
          />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="card">
      <div v-if="bookingStore.loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="bookingStore.bookings.length === 0" class="text-center py-12">
        <CalendarIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
        <div class="mt-6">
          <router-link to="/bookings/create" class="btn btn-primary">
            New Booking
          </router-link>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-out
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nights
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="booking in bookingStore.bookings" :key="booking.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ booking.guest?.name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ booking.guest?.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ booking.property?.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(booking.check_in_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(booking.check_out_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ booking.nights }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(booking.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ booking.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ booking.total_price }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <router-link
                  :to="`/bookings/${booking.id}/edit`"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Edit
                </router-link>
                <button
                  @click="confirmCancel(booking)"
                  :disabled="booking.status === 'cancelled'"
                  class="text-red-600 hover:text-red-900 disabled:text-gray-400"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="bookingStore.pagination.last_page > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ ((bookingStore.pagination.current_page - 1) * bookingStore.pagination.per_page) + 1 }}
        to {{ Math.min(bookingStore.pagination.current_page * bookingStore.pagination.per_page, bookingStore.pagination.total) }}
        of {{ bookingStore.pagination.total }} results
      </div>
      <div class="flex space-x-2">
        <button
          @click="changePage(bookingStore.pagination.current_page - 1)"
          :disabled="bookingStore.pagination.current_page === 1"
          class="btn btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="changePage(bookingStore.pagination.current_page + 1)"
          :disabled="bookingStore.pagination.current_page === bookingStore.pagination.last_page"
          class="btn btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Cancel Booking</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
          </div>
          <div class="flex space-x-4 px-4 py-3">
            <button @click="showCancelModal = false" class="flex-1 btn btn-secondary">
              Keep Booking
            </button>
            <button @click="cancelBooking" class="flex-1 btn btn-danger">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookingStore } from '@/stores/bookingStore'
import { CalendarIcon } from '@heroicons/vue/24/outline'

const bookingStore = useBookingStore()

const filters = ref({
  status: '',
  date_from: '',
  date_to: ''
})

const showCancelModal = ref(false)
const bookingToCancel = ref(null)

const fetchBookings = async () => {
  const params = {}
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to
  
  await bookingStore.fetchBookings(params)
}

const clearFilters = () => {
  filters.value = {
    status: '',
    date_from: '',
    date_to: ''
  }
  fetchBookings()
}

const changePage = (page) => {
  const params = { page }
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to
  
  bookingStore.fetchBookings(params)
}

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

const confirmCancel = (booking) => {
  bookingToCancel.value = booking
  showCancelModal.value = true
}

const cancelBooking = async () => {
  try {
    await bookingStore.updateBooking(bookingToCancel.value.id, { status: 'cancelled' })
    showCancelModal.value = false
    bookingToCancel.value = null
  } catch (error) {
    console.error('Error cancelling booking:', error)
    alert('Error cancelling booking. Please try again.')
  }
}

onMounted(() => {
  fetchBookings()
})
</script>