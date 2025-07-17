<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Properties</h1>
        <p class="text-gray-600 dark:text-gray-300">Manage your rental properties</p>
      </div>
      <router-link to="/properties/create" class="btn btn-primary">
        Add Property
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
            placeholder="Search properties..."
            @input="debouncedSearch"
          />
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="filters.is_active" class="form-input" @change="fetchProperties">
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

    <!-- Properties Grid -->
    <div v-if="propertyStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="propertyStore.properties.length === 0" class="text-center py-12">
      <BuildingOfficeIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No properties</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new property.</p>
      <div class="mt-6">
        <router-link to="/properties/create" class="btn btn-primary">
          Add Property
        </router-link>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="property in propertyStore.properties"
        :key="property.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {{ property.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">{{ property.address }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
              {{ property.description }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold text-primary-600">
                ${{ property.price_per_night }}/night
              </span>
              <span
                :class="property.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                class="px-2 py-1 text-xs font-medium rounded-full dark:bg-opacity-20"
              >
                {{ property.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex space-x-2">
          <router-link
            :to="`/properties/${property.id}/edit`"
            class="flex-1 btn btn-secondary text-center"
          >
            Edit
          </router-link>
          <button
            @click="confirmDelete(property)"
            class="flex-1 btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="propertyStore.pagination.last_page > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {{ ((propertyStore.pagination.current_page - 1) * propertyStore.pagination.per_page) + 1 }}
        to {{ Math.min(propertyStore.pagination.current_page * propertyStore.pagination.per_page, propertyStore.pagination.total) }}
        of {{ propertyStore.pagination.total }} results
      </div>
      <div class="flex space-x-2">
        <button
          @click="changePage(propertyStore.pagination.current_page - 1)"
          :disabled="propertyStore.pagination.current_page === 1"
          class="btn btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          @click="changePage(propertyStore.pagination.current_page + 1)"
          :disabled="propertyStore.pagination.current_page === propertyStore.pagination.last_page"
          class="btn btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Delete Property</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete "{{ propertyToDelete?.name }}"? This action cannot be undone.
            </p>
          </div>
          <div class="flex space-x-4 px-4 py-3">
            <button @click="showDeleteModal = false" class="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button @click="deleteProperty" class="flex-1 btn btn-danger">
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
import { usePropertyStore } from '@/stores/propertyStore'
import { BuildingOfficeIcon } from '@heroicons/vue/24/outline'

const propertyStore = usePropertyStore()

const filters = ref({
  search: '',
  is_active: ''
})

const showDeleteModal = ref(false)
const propertyToDelete = ref(null)

let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProperties()
  }, 500)
}

const fetchProperties = async () => {
  const params = {}
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.is_active !== '') params.is_active = filters.value.is_active
  
  await propertyStore.fetchProperties(params)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    is_active: ''
  }
  fetchProperties()
}

const changePage = (page) => {
  const params = { page }
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.is_active !== '') params.is_active = filters.value.is_active
  
  propertyStore.fetchProperties(params)
}

const confirmDelete = (property) => {
  propertyToDelete.value = property
  showDeleteModal.value = true
}

const deleteProperty = async () => {
  try {
    await propertyStore.deleteProperty(propertyToDelete.value.id)
    showDeleteModal.value = false
    propertyToDelete.value = null
  } catch (error) {
    console.error('Error deleting property:', error)
    alert('Error deleting property. Please try again.')
  }
}

onMounted(() => {
  fetchProperties()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>