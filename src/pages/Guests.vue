<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Guests</h1>
        <p class="text-gray-600">Manage your guest profiles</p>
      </div>
      <router-link to="/guests/create" class="btn btn-primary">
        Add Guest
      </router-link>
    </div>

    <!-- Search -->
    <div class="card">
      <div class="max-w-md">
        <label class="form-label">Search Guests</label>
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Search by name, email, or phone..."
          @input="debouncedSearch"
        />
      </div>
    </div>

    <!-- Guests Table -->
    <div class="card">
      <div v-if="guestStore.loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="guestStore.guests.length === 0" class="text-center py-12">
        <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">No guests</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding a new guest.</p>
        <div class="mt-6">
          <router-link to="/guests/create" class="btn btn-primary">
            Add Guest
          </router-link>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Bookings
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="guest in guestStore.guests" :key="guest.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700">
                        {{ getInitials(guest.name) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ guest.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ guest.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ guest.phone || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ guest.total_bookings || 0 }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(guest.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <router-link
                  :to="`/guests/${guest.id}/edit`"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Edit
                </router-link>
                <button
                  @click="viewBookingHistory(guest)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  History
                </button>
                <button
                  @click="confirmDelete(guest)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="guestStore.pagination.last_page > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ ((guestStore.pagination.current_page - 1) * guestStore.pagination.per_page) + 1 }}
        to {{ Math.min(guestStore.pagination.current_page * guestStore.pagination.per_page, guestStore.pagination.total) }}
        of {{ guestStore.pagination.total }} results
      </div>
      <div class="flex space-x-2">
        <button
          @click="changePage(guestStore.pagination.current_page - 1)"
          :disabled="guestStore.pagination.current_page === 1"
          class="btn btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="changePage(guestStore.pagination.current_page + 1)"
          :disabled="guestStore.pagination.current_page === guestStore.pagination.last_page"
          class="btn btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Delete Guest</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete "{{ guestToDelete?.name }}"? This action cannot be undone.
            </p>
          </div>
          <div class="flex space-x-4 px-4 py-3">
            <button @click="showDeleteModal = false" class="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button @click="deleteGuest" class="flex-1 btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking History Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Booking History - {{ selectedGuest?.name }}
          </h3>
          <button @click="showHistoryModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="sr-only">Close</span>
            ✕
          </button>
        </div>
        
        <div v-if="bookingHistory.length === 0" class="text-center py-8 text-gray-500">
          No booking history found
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="booking in bookingHistory" :key="booking.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ booking.property?.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(booking.check_in_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(booking.check_out_date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(booking.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ booking.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ booking.total_price }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGuestStore } from '@/stores/guestStore'
import { UsersIcon } from '@heroicons/vue/24/outline'

const guestStore = useGuestStore()

const searchQuery = ref('')
const showDeleteModal = ref(false)
const guestToDelete = ref(null)
const showHistoryModal = ref(false)
const selectedGuest = ref(null)
const bookingHistory = ref([])

let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchGuests()
  }, 500)
}

const fetchGuests = async () => {
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  
  await guestStore.fetchGuests(params)
}

const changePage = (page) => {
  const params = { page }
  if (searchQuery.value) params.search = searchQuery.value
  
  guestStore.fetchGuests(params)
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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

const confirmDelete = (guest) => {
  guestToDelete.value = guest
  showDeleteModal.value = true
}

const deleteGuest = async () => {
  try {
    await guestStore.deleteGuest(guestToDelete.value.id)
    showDeleteModal.value = false
    guestToDelete.value = null
  } catch (error) {
    console.error('Error deleting guest:', error)
    alert('Error deleting guest. Please try again.')
  }
}

const viewBookingHistory = async (guest) => {
  selectedGuest.value = guest
  try {
    bookingHistory.value = await guestStore.fetchGuestBookingHistory(guest.id)
    showHistoryModal.value = true
  } catch (error) {
    console.error('Error fetching booking history:', error)
    alert('Error loading booking history.')
  }
}

onMounted(() => {
  fetchGuests()
})
</script>