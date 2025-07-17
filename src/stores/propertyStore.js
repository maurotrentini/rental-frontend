import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const usePropertyStore = defineStore('property', () => {
  const properties = ref([])
  const property = ref(null)
  const loading = ref(false)
  const pagination = ref({})

  const fetchProperties = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/properties', { params })
      properties.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchProperty = async (id) => {
    loading.value = true
    try {
      const response = await api.get(`/properties/${id}`)
      property.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error fetching property:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createProperty = async (propertyData) => {
    loading.value = true
    try {
      const response = await api.post('/properties', propertyData)
      properties.value.unshift(response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error creating property:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateProperty = async (id, propertyData) => {
    loading.value = true
    try {
      const response = await api.put(`/properties/${id}`, propertyData)
      const index = properties.value.findIndex(p => p.id === id)
      if (index !== -1) {
        properties.value[index] = response.data.data
      }
      property.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error updating property:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteProperty = async (id) => {
    loading.value = true
    try {
      await api.delete(`/properties/${id}`)
      properties.value = properties.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Error deleting property:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const checkAvailability = async (propertyId, checkIn, checkOut) => {
    try {
      const response = await api.get(`/properties/${propertyId}/availability`, {
        params: { check_in: checkIn, check_out: checkOut }
      })
      return response.data
    } catch (error) {
      console.error('Error checking availability:', error)
      throw error
    }
  }

  return {
    properties,
    property,
    loading,
    pagination,
    fetchProperties,
    fetchProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    checkAvailability
  }
})