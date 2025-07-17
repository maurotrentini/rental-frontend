import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref([])
  const booking = ref(null)
  const loading = ref(false)
  const pagination = ref({})

  const fetchBookings = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.get('/bookings', { params })
      bookings.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchBooking = async (id) => {
    loading.value = true
    try {
      const response = await api.get(`/bookings/${id}`)
      booking.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error fetching booking:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createBooking = async (bookingData) => {
    loading.value = true
    try {
      const response = await api.post('/bookings', bookingData)
      bookings.value.unshift(response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateBooking = async (id, bookingData) => {
    loading.value = true
    try {
      const response = await api.put(`/bookings/${id}`, bookingData)
      const index = bookings.value.findIndex(b => b.id === id)
      if (index !== -1) {
        bookings.value[index] = response.data.data
      }
      booking.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteBooking = async (id) => {
    loading.value = true
    try {
      await api.delete(`/bookings/${id}`)
      bookings.value = bookings.value.filter(b => b.id !== id)
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchCalendarEvents = async (params = {}) => {
    try {
      const response = await api.get('/bookings-calendar', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  return {
    bookings,
    booking,
    loading,
    pagination,
    fetchBookings,
    fetchBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    fetchCalendarEvents
  }
})