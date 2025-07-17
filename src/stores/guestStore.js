import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useGuestStore = defineStore('guest', () => {
  const guests = ref([])
  const guest = ref(null)
  const loading = ref(false)
  const pagination = ref({})

  const fetchGuests = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/guests', { params })
      guests.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchGuest = async (id) => {
    loading.value = true
    try {
      const response = await api.get(`/guests/${id}`)
      guest.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error fetching guest:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createGuest = async (guestData) => {
    loading.value = true
    try {
      const response = await api.post('/guests', guestData)
      guests.value.unshift(response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error creating guest:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateGuest = async (id, guestData) => {
    loading.value = true
    try {
      const response = await api.put(`/guests/${id}`, guestData)
      const index = guests.value.findIndex(g => g.id === id)
      if (index !== -1) {
        guests.value[index] = response.data.data
      }
      guest.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error updating guest:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteGuest = async (id) => {
    loading.value = true
    try {
      await api.delete(`/guests/${id}`)
      guests.value = guests.value.filter(g => g.id !== id)
    } catch (error) {
      console.error('Error deleting guest:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchGuestBookingHistory = async (id) => {
    try {
      const response = await api.get(`/guests/${id}/booking-history`)
      return response.data
    } catch (error) {
      console.error('Error fetching guest booking history:', error)
      throw error
    }
  }

  return {
    guests,
    guest,
    loading,
    pagination,
    fetchGuests,
    fetchGuest,
    createGuest,
    updateGuest,
    deleteGuest,
    fetchGuestBookingHistory
  }
})