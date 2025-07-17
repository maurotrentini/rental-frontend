<template>
  <aside class="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
    <nav class="p-4">
      <ul class="space-y-2">
        <li>
          <router-link
            to="/"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'Dashboard' }"
          >
            <HomeIcon class="w-5 h-5" />
            Dashboard
          </router-link>
        </li>
        
        <li>
          <router-link
            to="/properties"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/properties') }"
          >
            <BuildingOfficeIcon class="w-5 h-5" />
            Properties
          </router-link>
        </li>
        
        <li>
          <router-link
            to="/bookings"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/bookings') }"
          >
            <CalendarIcon class="w-5 h-5" />
            Bookings
          </router-link>
        </li>
        
        <li>
          <router-link
            to="/guests"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/guests') }"
          >
            <UsersIcon class="w-5 h-5" />
            Guests
          </router-link>
        </li>
        
        <li>
          <router-link
            to="/extras"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/extras') }"
          >
            <PlusCircleIcon class="w-5 h-5" />
            Extras
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UsersIcon,
  PlusCircleIcon
} from '@heroicons/vue/24/outline'
</script>

<style scoped>
.nav-link {
  @apply flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors;
}

.nav-link-active {
  @apply bg-primary-50 text-primary-700 border-r-2 border-primary-600;
}
</style>