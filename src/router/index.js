import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Pages
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Properties from '@/pages/Properties.vue'
import PropertyForm from '@/pages/PropertyForm.vue'
import Bookings from '@/pages/Bookings.vue'
import BookingForm from '@/pages/BookingForm.vue'
import Guests from '@/pages/Guests.vue'
import GuestForm from '@/pages/GuestForm.vue'
import Extras from '@/pages/Extras.vue'
import ExtraForm from '@/pages/ExtraForm.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/properties',
    name: 'Properties',
    component: Properties,
    meta: { requiresAuth: true }
  },
  {
    path: '/properties/create',
    name: 'CreateProperty',
    component: PropertyForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/properties/:id/edit',
    name: 'EditProperty',
    component: PropertyForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: Bookings,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookings/create',
    name: 'CreateBooking',
    component: BookingForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookings/:id/edit',
    name: 'EditBooking',
    component: BookingForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/guests',
    name: 'Guests',
    component: Guests,
    meta: { requiresAuth: true }
  },
  {
    path: '/guests/create',
    name: 'CreateGuest',
    component: GuestForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/guests/:id/edit',
    name: 'EditGuest',
    component: GuestForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/extras',
    name: 'Extras',
    component: Extras,
    meta: { requiresAuth: true }
  },
  {
    path: '/extras/create',
    name: 'CreateExtra',
    component: ExtraForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/extras/:id/edit',
    name: 'EditExtra',
    component: ExtraForm,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router