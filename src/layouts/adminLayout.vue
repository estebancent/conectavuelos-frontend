<script setup>
import { ref, onMounted } from 'vue'
import { 
  LayoutDashboard, Users, Box, Tags, Layers, 
  Truck, ShoppingCart, Receipt, LogOut, Sun, Moon, Menu, X 
} from 'lucide-vue-next'
import { useToast } from "vue-toastification"
import { useAuthStore } from '../stores/authStore'
const toast = useToast()
const isDark = ref(false)
const isSidebarOpen = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.theme = isDark.value ? 'dark' : 'light'
}

const auth = useAuthStore()


const logout = () => {
  if (confirm('¿Seguro que querés cerrar sesión?')) {
    auth.logout()
  }
}
// Cambiamos el nombre para que sea más descriptivo
const isSidebarExpanded = ref(true) 

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}
onMounted(() => {
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
    
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"></div>

    <aside 
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
      class="fixed lg:static inset-y-0 left-0 w-72 bg-slate-900 dark:bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 border-r border-slate-800"
    >
      <div class="p-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Box class="text-white w-6 h-6" />
          </div>
          <span class="text-xl font-bold text-white tracking-tight">GestProduct</span>
        </div>
        <button @click="isSidebarOpen = false" class="lg:hidden text-slate-400"><X /></button>
      </div>

     <nav class="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar py-4">
  <div v-show="isSidebarExpanded" class="menu-group">Principal</div>
  <router-link to="/admin" class="nav-link" exact-active-class="active" title="Dashboard">
    <LayoutDashboard class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Dashboard</span>
  </router-link>
  <router-link to="/admin/users" class="nav-link" exact-active-class="active" title="Usuarios">
    <Users class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Usuarios</span>
  </router-link>
  
  <div v-show="isSidebarExpanded" class="menu-group">Inventario</div>
  <router-link to="/admin/products" class="nav-link" exact-active-class="active" title="Productos">
    <Box class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Productos</span>
  </router-link>
  <router-link to="/admin/categories" class="nav-link" exact-active-class="active" title="Categorías">
    <Layers class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Categorías</span>
  </router-link>
  <router-link to="/admin/brands" class="nav-link" exact-active-class="active" title="Marcas">
    <Tags class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Marcas</span>
  </router-link>
  <router-link to="/admin/suppliers" class="nav-link" exact-active-class="active" title="Proveedores">
    <Truck class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Proveedores</span>
  </router-link>

  <div v-show="isSidebarExpanded" class="menu-group">Negocio</div>
  <router-link to="/admin/sales" class="nav-link" exact-active-class="active" title="Ventas">
    <ShoppingCart class="w-4 h-4 shrink-0" /> 
    <span v-show="isSidebarExpanded" class="truncate">Ventas</span>
  </router-link>
  <router-link to="/admin/purchases" class="nav-link" exact-active-class="active" title="Compras">
    <Receipt class="w-4 h-4 shrink-0" /> 
    
    <span v-show="isSidebarExpanded" class="truncate">Compras</span>
  </router-link>
</nav>

      <div class="p-4 border-t border-slate-800 bg-slate-900/50">
        <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">AD</div>
          <div class="flex-1 truncate">
            <p class="text-sm font-semibold text-white">{{ auth.user?.name?.split(' ').map(n => n[0]).join('').slice(0,2) }}</p>
            <p class="text-xs text-slate-400">{{ auth.user?.email }}</p>

          </div>
     
        </div>
      </div>
      
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      
      <header class="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex justify-between items-center transition-colors">
        <div class="flex items-center gap-4">
          <button @click="isSidebarOpen = true" class="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu />
          </button>
          <div class="hidden sm:block text-slate-400 font-medium">
             Gestión <span class="mx-2">/</span> <span class="text-indigo-600 dark:text-indigo-400">Dashboard</span>
          </div>
        </div>

        <div class="flex items-center gap-2 lg:gap-4">
          <button @click="toggleDarkMode" class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 ring-indigo-500/20 transition-all">
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <button 
            @click="logout"
            class="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-500/20 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all group shadow-sm"
            >
            <span class="hidden md:inline">Cerrar Sesión</span>
            <LogOut class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          
        </div>
      </header>

      <main class="p-4 lg:p-8 overflow-x-hidden">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>


<style scoped>
.menu-group {
  /* Espaciado más apretado y texto más pequeño */
  @apply px-3 pt-5 pb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500/80;
}

.nav-link {
  /* Reducimos el padding (py-2) y el redondeado (rounded-md) */
  @apply flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40;
}

.nav-link svg {
  /* Iconos más pequeños y sobrios */
  @apply opacity-60 transition-opacity;
}

.nav-link:hover svg {
  @apply opacity-100;
}

/* Estado Activo: Sobrio, sin sombras neón ni colores vibrantes */
.active {
  @apply bg-slate-800 text-white border-l-2 border-indigo-500 rounded-l-none !important;
}

.active svg {
  @apply opacity-100 text-indigo-400 !important;
}

/* Scrollbar minimalista */
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-800 rounded-full;
}
</style>