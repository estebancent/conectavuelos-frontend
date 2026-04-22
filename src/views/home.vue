<script setup>
import { ref, onMounted, computed } from 'vue'
import { buscarVuelos } from '../services/vueloService' 
import { useAeropuertoStore } from '../stores/aeropuertoStore'
import { 
  MapPin, 
  PlaneLanding, 
  Calendar, 
  Search, 
  Loader2, 
  Plane, 
  ChevronRight,
  Info,
  Star,
  Tag
} from 'lucide-vue-next'

const aeropuertoStore = useAeropuertoStore()

// --- ESTADO ---
const form = ref({
  origen: '',
  destino: '',
  fecha: ''
})

const errores = ref({
  origen: false,
  destino: false,
  fecha: false
})

const vuelos = ref([])
const cargando = ref(false)
const busquedaRealizada = ref(false)

// NUEVO: Estado para el filtro
const precioMaximo = ref(300000)

// --- LÓGICA DE FILTRADO Y PROCESAMIENTO ---
const vuelosProcesados = computed(() => {
  if (vuelos.value.length === 0) return []
  
  // 1. Filtrar por el precio del slider
  const filtrados = vuelos.value.filter(v => v.precio <= precioMaximo.value)
  
  if (filtrados.length === 0) return []

  // 2. Identificar el precio más bajo entre los que quedaron
  const precios = filtrados.map(v => v.precio)
  const precioMinimo = Math.min(...precios)
  
  return filtrados.map(v => ({
    ...v,
    esElMasBarato: v.precio === precioMinimo,
    esRecomendado: v.precio === precioMinimo && v.aerolinea.includes('Aerolíneas')
  }))
})

// --- ACCIONES ---
onMounted(() => {
  aeropuertoStore.fetchAeropuertos()
})

const validarCampos = () => {
  errores.value.origen = !form.value.origen
  errores.value.destino = !form.value.destino
  errores.value.fecha = !form.value.fecha
  
  return !errores.value.origen && !errores.value.destino && !errores.value.fecha
}

const handleSearch = async () => {
  if (!validarCampos()) return
  
  cargando.value = true
  busquedaRealizada.value = true
  
  try {
    const { data } = await buscarVuelos({
      origen: form.value.origen,
      destino: form.value.destino,
      fecha: form.value.fecha
    })
    vuelos.value = data
    
    // Resetear el filtro al máximo al hacer una nueva búsqueda
    if (data.length > 0) {
      const precios = data.map(v => v.precio)
      precioMaximo.value = Math.max(...precios)
    }
  } catch (error) {
    console.error("Error buscando vuelos:", error)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="space-y-12 pb-20 overflow-hidden bg-slate-50/50 dark:bg-slate-950 min-h-screen">
    
    <section class="max-w-7xl mx-auto px-6 pt-16 lg:pt-24 flex flex-col items-center text-center">
      <h1 class="text-5xl lg:text-7xl font-black text-slate-800 dark:text-white tracking-tighter mb-8 leading-[1.1]">
        Viajá por Argentina con <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">el mejor precio garantizado.</span>
      </h1>

      <div class="w-full max-w-5xl mt-12 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div class="flex flex-col text-left">
            <label class="text-xs font-black uppercase text-blue-600 mb-2 ml-1">Origen</label>
            <div class="relative">
              <MapPin class="absolute left-4 top-3.5 w-5 h-5" :class="errores.origen ? 'text-red-500' : 'text-slate-400'" />
              <select v-model="form.origen" 
                class="input-field-custom appearance-none"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': errores.origen}">
                <option value="" disabled>¿De dónde salís?</option>
                <option v-for="item in aeropuertoStore.listaFormateada" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex flex-col text-left">
            <label class="text-xs font-black uppercase text-blue-600 mb-2 ml-1">Destino</label>
            <div class="relative">
              <PlaneLanding class="absolute left-4 top-3.5 w-5 h-5" :class="errores.destino ? 'text-red-500' : 'text-slate-400'" />
              <select v-model="form.destino" 
                class="input-field-custom appearance-none"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': errores.destino}">
                <option value="" disabled>¿A dónde vas?</option>
                <option v-for="item in aeropuertoStore.listaFormateada" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex flex-col text-left">
            <label class="text-xs font-black uppercase text-blue-600 mb-2 ml-1">Fecha</label>
            <div class="relative">
              <Calendar class="absolute left-4 top-3.5 w-5 h-5" :class="errores.fecha ? 'text-red-500' : 'text-slate-400'" />
              <input v-model="form.fecha" type="date" 
                class="input-field-custom"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': errores.fecha}">
            </div>
          </div>

          <div class="flex items-end">
            <button @click="handleSearch" :disabled="cargando" class="search-button-custom">
              <Loader2 v-if="cargando" class="w-5 h-5 animate-spin" />
              <template v-else>
                <Search class="w-5 h-5" /> Buscar Vuelos
              </template>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="busquedaRealizada" class="max-w-5xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div v-if="cargando" class="flex flex-col items-center py-16">
        <div class="relative w-20 h-20 flex items-center justify-center">
          <div class="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <Plane class="w-8 h-8 text-blue-600" />
        </div>
        <p class="mt-4 font-bold text-slate-500">Buscando las mejores rutas...</p>
      </div>

      <div v-else-if="vuelos.length > 0">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div class="flex items-center gap-4 w-full md:w-auto">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Tag class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p class="text-xs font-black text-blue-600 uppercase">Presupuesto Máximo</p>
              <p class="text-xl font-bold text-slate-800 dark:text-white">
                ${{ precioMaximo.toLocaleString() }}
              </p>
            </div>
          </div>
          
          <div class="w-full md:w-72">
            <input 
              v-model="precioMaximo" 
              type="range" 
              min="10000" 
              max="300000" 
              step="5000"
              class="range-slider-custom"
            >
            <div class="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Mín: $10k</span>
              <span>Máx: $300k</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6 px-2">
          <h3 class="text-2xl font-black text-slate-800 dark:text-white">Vuelos encontrados</h3>
          <span class="px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
            {{ vuelosProcesados.length }} opciones mostradas
          </span>
        </div>

        <div v-if="vuelosProcesados.length > 0" class="space-y-6">
          <div v-for="vuelo in vuelosProcesados" :key="vuelo.id" 
            class="vuelo-card group relative"
            :class="{'ring-2 ring-green-500/50': vuelo.esElMasBarato}">
            
            <div class="absolute -top-3 left-8 flex gap-2">
              <span v-if="vuelo.esElMasBarato" class="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                <Tag class="w-3 h-3" /> El más barato
              </span>
              <span v-if="vuelo.esRecomendado" class="bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                <Star class="w-3 h-3 fill-current" /> Recomendado
              </span>
            </div>

            <div class="flex flex-col lg:flex-row items-center justify-between gap-8 p-8">
              <div class="flex items-center gap-4 w-full lg:w-auto">
                <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Plane class="w-7 h-7" />
                </div>
                <div>
                  <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest">{{ vuelo.aerolinea }}</p>
                  <p class="text-xl font-bold text-slate-800 dark:text-white">{{ vuelo.nro_vuelo }}</p>
                </div>
              </div>

              <div class="flex items-center gap-6 lg:gap-12">
                <div class="text-center">
                  <p class="text-3xl font-black text-slate-800 dark:text-white uppercase">{{ vuelo.origen.substring(0,3) }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">{{ vuelo.origen }}</p>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <div class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase">Directo</div>
                  <div class="w-24 lg:w-32 h-[2px] bg-slate-200 dark:bg-slate-800 relative">
                    <div class="absolute -top-1 right-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <p class="text-[9px] font-bold text-slate-400 uppercase">1h 45m</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-black text-slate-800 dark:text-white uppercase">{{ vuelo.destino.substring(0,3) }}</p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">{{ vuelo.destino }}</p>
                </div>
              </div>

              <div class="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-100 dark:border-slate-800">
                <div class="text-right">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Precio Final</p>
                  <p class="text-3xl font-black" :class="vuelo.esElMasBarato ? 'text-green-600' : 'text-blue-600'">
                    ${{ vuelo.precio.toLocaleString() }}
                  </p>
                </div>
                <button class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center gap-2 group-hover:translate-x-1">
                  Seleccionar <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-16 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
          <Info class="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p class="font-bold text-slate-800 dark:text-white">Ningún vuelo coincide con ese presupuesto.</p>
          <button @click="precioMaximo = 300000" class="mt-4 text-blue-600 text-sm font-bold hover:underline">
            Ver todos los vuelos
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
        <Info class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h4 class="text-xl font-bold text-slate-800 dark:text-white">No hay vuelos disponibles</h4>
        <p class="text-slate-500 mt-2">Probá buscando con otro destino u otra fecha.</p>
      </div>

    </section>
  </div>
</template>

<style scoped>
.input-field-custom {
  @apply w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 dark:text-slate-200;
}

.search-button-custom {
  @apply w-full bg-blue-600 text-white h-[54px] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-70;
}

.vuelo-card {
  @apply bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500;
}

/* Custom Range Slider */
.range-slider-custom {
  @apply w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600;
}

.range-slider-custom::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900 shadow-lg;
}
</style>