<script setup>
import { MapPin, Plane } from 'lucide-vue-next'
import { ref } from 'vue'

const destinos = ref([
  { 
    id: 1, 
    nombre: 'Cataratas del Iguazú', 
    provincia: 'Misiones', 
    precio: '45.000', 
    imagen: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    nombre: 'Bariloche', 
    provincia: 'Río Negro', 
    precio: '62.000', 
    imagen: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=800&auto=format&fit=crop' 
  },
 { 
    id: 3, 
    nombre: 'Salta La Linda', 
    provincia: 'Salta', 
    precio: '38.500', 
    // Nueva URL de Salta (Formato verificado)
    imagen: 'https://images.unsplash.com/photo-1627664819818-e147d6221422?q=80&w=800&auto=format&fit=crop' 
  },
 { 
    id: 4, 
    nombre: 'Glaciar Perito Moreno', 
    provincia: 'Santa Cruz', 
    precio: '75.000', 
    imagen: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=800&auto=format&fit=crop' 
  }
])
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-12">
    <header class="mb-12">
      <h2 class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Destinos Populares</h2>
      <p class="text-slate-500 dark:text-slate-400 mt-2">Explorá los rincones más increíbles de Argentina.</p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-for="destino in destinos" :key="destino.id" 
           class="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500">
        
        <div class="relative h-48 overflow-hidden">
          <img :src="destino.imagen" :alt="destino.nombre" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-blue-600">
            DESDE ${{ destino.precio }}
          </div>
        </div>

        <div class="p-6">
          <div class="flex items-center gap-1 text-blue-600 mb-2">
            <MapPin class="w-4 h-4" />
            <span class="text-xs font-bold uppercase tracking-wider">{{ destino.provincia }}</span>
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-4">{{ destino.nombre }}</h3>
          
          <button class="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all">
            Ver Vuelos <Plane class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>