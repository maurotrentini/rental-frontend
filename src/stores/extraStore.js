import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useExtraStore = defineStore('extra', () => {
  const extras = ref([])
  const extra = ref(null)
  const loading = ref(false)
  const pagination = ref({})

  const fetchExtras = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/extras', { params })
      extras.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      }
    } catch (error) {
      console.error('Error fetching extras:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchExtra = async (id) => {
    loading.value = true
    try {
      const response = await api.get(`/extras/${id}`)
      extra.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error fetching extra:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createExtra = async (extraData) => {
    loading.value = true
    try {
      const response = await api.post('/extras', extraData)
      extras.value.unshift(response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error creating extra:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateExtra = async (id, extraData) => {
    loading.value = true
    try {
      const response = await api.put(`/extras/${id}`, extraData)
      const index = extras.value.findIndex(e => e.id === id)
      if (index !== -1) {
        extras.value[index] = response.data.data
      }
      extra.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error updating extra:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteExtra = async (id) => {
    loading.value = true
    try {
      await api.delete(`/extras/${id}`)
      extras.value = extras.value.filter(e => e.id !== id)
    } catch (error) {
      console.error('Error deleting extra:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    extras,
    extra,
    loading,
    pagination,
    fetchExtras,
    fetchExtra,
    createExtra,
    updateExtra,
    deleteExtra
  }
})