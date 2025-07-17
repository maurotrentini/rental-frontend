<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Extras</h1>
        <p class="text-gray-600">Manage additional services and add-ons</p>
      </div>
      <router-link to="/extras/create" class="btn btn-primary">
        Add Extra
      </router-link>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="form-label">Search</label>
          <input
            v-model="filters.search"
            type="text"
            class="form-input"
            placeholder="Search extras..."
            @input="debouncedSearch"
          />
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="filters.is_active" class="form-input" @change="fetchExtras">
            <option value="">All</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Extras Grid -->
    <div v-if="extraStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="extraStore.extras.length === 0" class="text-center py-12">
      <PlusCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No extras</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new extra service.</p>
      <div class="mt-6">
        <router-link to="/extras/create" class="btn btn-primary">
          Add Extra
        </router-link>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="extra in extraStore.extras"
        :key="extra.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ extra.name }}
            </h3>
            <p class="text-sm text-gray-600 mb-3">
              {{ extra.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xl font-semibold text-primary-600">
                ${{ extra.price }}
              </span>
              <span
                :class="extra.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ extra.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <router-link
            :to="`/extras/${extra.id}/edit`"
            class="flex-1 btn btn-secondary text-center"
          >
            Edit
          </router-link>
          <button
            @click="confirmDelete(extra)"
            class="flex-1 btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="extraStore.pagination.last_page > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ ((extraStore.pagination.current_page - 1) * extraStore.pagination.per_page) + 1 }}
        to {{ Math.min(extraStore.pagination.current_page * extraStore.pagination.per_page, extraStore.pagination.total) }}
        of {{ extraStore.pagination.total }} results
      </div>
      <div class="flex space-x-2">
        <button
          @click="changePage(extraStore.pagination.current_page - 1)"
          :disabled="extraStore.pagination.current_page === 1"
          class="btn btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="changePage(extraStore.pagination.current_page + 1)"
          :disabled="extraStore.pagination.current_page === extraStore.pagination.last_page"
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
          <h3 class="text-lg font-medium text-gray-900">Delete Extra</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete "{{ extraToDelete?.name }}"? This action cannot be undone.
            </p>
          </div>
          <div class="flex space-x-4 px-4 py-3">
            <button @click="showDeleteModal = false" class="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button @click="deleteExtra" class="flex-1 btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useExtraStore } from '@/stores/extraStore'
import { PlusCircleIcon } from '@heroicons/vue/24/outline'

const extraStore = useExtraStore()

const filters = ref({
  search: '',
  is_active: ''
})

const showDeleteModal = ref(false)
const extraToDelete = ref(null)

let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchExtras()
  }, 500)
}

const fetchExtras = async () => {
  const params = {}
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.is_active !== '') params.is_active = filters.value.is_active
  
  await extraStore.fetchExtras(params)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    is_active: ''
  }
  fetchExtras()
}

const changePage = (page) => {
  const params = { page }
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.is_active !== '') params.is_active = filters.value.is_active
  
  extraStore.fetchExtras(params)
}

const confirmDelete = (extra) => {
  extraToDelete.value = extra
  showDeleteModal.value = true
}

const deleteExtra = async () => {
  try {
    await extraStore.deleteExtra(extraToDelete.value.id)
    showDeleteModal.value = false
    extraToDelete.value = null
  } catch (error) {
    console.error('Error deleting extra:', error)
    alert('Error deleting extra. Please try again.')
  }
}

onMounted(() => {
  fetchExtras()
})
</script>