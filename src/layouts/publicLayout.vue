<script setup>
import { Plane, Menu, X, LogOut, Ticket } from 'lucide-vue-next'
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore' 

const isMenuOpen = ref(false)
const authStore = useAuthStore() 

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
    isMenuOpen.value = false 
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 transition-colors">
    <nav class="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <router-link to="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
            <Plane class="text-white w-6 h-6" />
          </div>
          <span class="text-xl font-black text-slate-800 dark:text-white tracking-tight">ConectaVuelos</span>
        </router-link>

        <div class="hidden md:flex items-center gap-8">
          <router-link to="/" class="nav-item">Buscar Vuelos</router-link>
          <router-link to="/catalog" class="nav-item">Destinos</router-link>
          <router-link to="/about" class="nav-item">Nosotros</router-link>
          
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          
          <template v-if="!authStore.isAuth">
            <router-link to="/auth/login" class="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              Iniciar Sesión
            </router-link>
          </template>

          <template v-else>
            <div class="flex items-center gap-6">
              <router-link to="/reservas" class="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                <Ticket class="w-4 h-4" />
                Mi Reserva
              </router-link>

              <div class="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                <div class="flex flex-col items-end">
                  <span class="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Bienvenido</span>
                  <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ authStore.user?.name }}</span>
                </div>
                <button 
                  @click="handleLogout" 
                  class="flex items-center justify-center w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  title="Cerrar Sesión"
                >
                  <LogOut class="w-4 h-4" />
                </button>
              </div>
            </div>
          </template>
        </div>

        <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 text-slate-600 dark:text-slate-400">
          <Menu v-if="!isMenuOpen" />
          <X v-else />
        </button>
      </div>

      <div v-if="isMenuOpen" class="md:hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 px-6 py-6 space-y-4">
        <router-link to="/" class="block nav-item">Buscar Vuelos</router-link>
        <router-link to="/catalog" class="block nav-item">Destinos</router-link>
        <router-link to="/about" class="block nav-item">Nosotros</router-link>
        <hr class="border-slate-100 dark:border-slate-800" />
        
        <template v-if="!authStore.isAuth">
          <router-link to="/auth/login" class="block bg-blue-600 text-white text-center py-3 rounded-xl font-bold">
            Iniciar Sesión
          </router-link>
        </template>
        
        <template v-else>
          <router-link to="/mis-reservas" class="flex items-center gap-2 nav-item py-2">
            <Ticket class="w-4 h-4" /> Mi Reserva
          </router-link>
          <button @click="handleLogout" class="w-full text-left text-sm font-bold text-rose-600 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <LogOut class="w-4 h-4" /> Cerrar Sesión ({{ authStore.user?.name }})
          </button>
        </template>
      </div>
    </nav>

    <main class="pt-20">
      <router-view />
    </main>

    <footer class="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 py-12 mt-20">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2 opacity-50 grayscale">
          <Plane class="w-5 h-5 text-slate-900 dark:text-white" />
          <span class="font-bold text-slate-900 dark:text-white">ConectaVuelos</span>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
          © 2026 ConectaVuelos - UNNE Software II.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.nav-item {
  @apply text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors;
}
</style>