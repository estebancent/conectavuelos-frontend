<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAsientoStore } from '../../stores/asientoStore.js'
import { useReservaStore } from '../../stores/reservaStore.js'
import { Armchair, ArrowLeft, ArrowRight, Info } from 'lucide-vue-next'

// --- CONFIGURACIÓN DE RUTAS Y EMITS ---
const route = useRoute()
// CORRECCIÓN 1: Cambiado 'anterior' por 'atras' para que ReservaView (onAtras) lo capture
const emit = defineEmits(['atras', 'siguiente'])

// --- STORES ---
const reservaStore = useReservaStore()
const asientoStore = useAsientoStore()
const inicializarMapaAsientos = () => {
  const vueloId = reservaStore.vueloSeleccionado?.id || route.params.vueloId
  
  if (vueloId) {
    console.log("Despachando consulta de asientos para el vuelo ID:", vueloId);
    asientoStore.consultarDisponibilidad(vueloId)
  } else {
    asientoStore.cargando = false
    asientoStore.error = "No se detectó ningún vuelo seleccionado. Volvé al paso anterior."
  }
}
// --- HOOKS DE CICLO DE VIDA (ONMOUNTED UNIFICADO) ---
// Se ejecuta al montar el componente
onMounted(() => {
  inicializarMapaAsientos()
})

// Opcional y altamente recomendado: si el usuario cambia de vuelo, re-consultar al instante
watch(() => reservaStore.vueloSeleccionado?.id, (nuevoId) => {
  if (nuevoId) inicializarMapaAsientos()
})

// --- COMPUTADOS DE PASAJEROS ---
const listaPasajeros = computed(() => reservaStore.pasajeros || [])
const cantidadAsientosNecesarios = computed(() => listaPasajeros.value.length)

// --- LÓGICA DE RESTRICCIÓN Y SELECCIÓN ---
// 1. Capturamos la selección pasando el ID relacional
const manejarSeleccion = (asiento) => {
  const max = cantidadAsientosNecesarios.value || 1
  asientoStore.seleccionarAsiento(asiento.id, max)
}

// 2. Buscamos el nombre del asiento en el mapa para pintarlo en la tarjeta del pasajero
const obtenerAsientoPasajero = (index) => {
  const idSeleccionado = asientoStore.asientosSeleccionados[index]
  if (!idSeleccionado || !asientoStore.mapaAsientos) return 'Sin asignar'
  
  let asientoEncontrado = null
  for (const fila of asientoStore.mapaAsientos.filas) {
    const target = fila.asientos.find(a => a.id === idSeleccionado)
    if (target) {
      asientoEncontrado = target
      break
    }
  }
  return asientoEncontrado ? asientoEncontrado.name : 'Sin asignar'
}

// 3. Evaluamos estados visuales usando inclusiones por ID
const getEstadoAsiento = (asiento) => {
  if (!asiento.disponible) return 'ocupado'
  if (asientoStore.asientosSeleccionados.includes(asiento.id)) return 'seleccionado'
  return 'disponible'
}

// --- NAVEGACIÓN ENTRE PASOS ---
const puedeAvanzar = computed(() => {
  return asientoStore.asientosSeleccionados.length === cantidadAsientosNecesarios.value && cantidadAsientosNecesarios.value > 0
})

const handleSiguiente = () => {
  if (!puedeAvanzar.value) return
  reservaStore.guardarPasajeros(listaPasajeros.value)
  reservaStore.guardarAsientos(asientoStore.asientosSeleccionados)
  emit('siguiente')
}

// --- RENDIMIENTO VISUAL E INTERFAZ ---
const debeMostrarPasillo = (index, configuracion) => {
  if (!configuracion) return false
  
  // Limpiamos el string por si viene con espacios o caracteres especiales
  const configLimpia = configuracion.replace(/\s+/g, '').replace('x', '-')

  // Si el avión es un Boeing/Airbus (3-3), el pasillo va entre el 3er y 4to asiento (Índice 2)
  if (configLimpia === '3-3' && index === 2) {
    return true
  }

  // Si el avión es un Embraer (2-2), el pasillo va exactamente en la mitad: entre el 2do y 3er asiento (Índice 1)
  if (configLimpia === '2-2' && index === 1) {
    return true
  }

  return false
}

// --- CONFIGURACIÓN ESTRUCTURAL DINÁMICA DEL AVIÓN ---
const estructuraAvion = computed(() => {
  const config = asientoStore.mapaAsientos?.configuracion
  
  if (config === '2-2' || config === '2x2') {
    return {
      anchoFuselaje: 'max-w-xs',
      // 2 asientos + pasillo + 2 asientos = 5 columnas en la grilla CSS
      gridColumnas: 'grid-cols-[1fr_1fr_auto_1fr_1fr]'
    }
  }
  
  // Por defecto '3-3'
  return {
    anchoFuselaje: 'max-w-md',
    // 3 asientos + pasillo + 3 asientos = 7 columnas en la grilla CSS
    gridColumnas: 'grid-cols-[1fr_1fr_1fr_auto_1fr_1fr_1fr]'
  }
})

// --- ESTILOS EN TIEMPO REAL ---
const obtenerStylePorClase = (asiento) => {
  const estado = getEstadoAsiento(asiento)
  
  // Si está ocupado (en pasaje_vuelo o bloqueado en API externa)
  if (estado === 'ocupado') {
    return 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
  }
  
  // Si está seleccionado por el usuario en esta sesión
  if (estado === 'seleccionado') {
    return 'bg-blue-600 border-blue-700 text-white shadow-md scale-105 z-10'
  }
  
  // Si está disponible (Colores según clase sincronizada de la base de datos)
  const claseAsiento = (asiento.clase || '').toLowerCase()

  if (claseAsiento === 'business' || claseAsiento === 'ejecutivo' || claseAsiento === 'primera') {
    return 'bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100'
  }
  
  // Clase Turista estándar
  return 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
}
</script>

<template>
  <div class="space-y-8">
    
    <div class="border-b border-slate-100 dark:border-slate-800 pb-6">
      <h2 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
        Selección de Asientos
      </h2>
      <p class="text-sm text-slate-500 mt-1">
        Debés seleccionar exactamente <span class="font-black text-blue-600">{{ cantidadAsientosNecesarios }}</span> asiento(s) para continuar la reserva.
      </p>
      
      <div v-if="reservaStore.vueloSeleccionado" class="mt-3 text-xs text-slate-400 font-medium">
        Vuelo: <span class="text-slate-600 dark:text-slate-300 font-bold">{{ reservaStore.vueloSeleccionado.codigo_vuelo || 'N/A' }}</span> | 
        Origen: <span class="text-slate-600 dark:text-slate-300 font-bold">{{ reservaStore.vueloSeleccionado.origen }}</span> ➔ 
        Destino: <span class="text-slate-600 dark:text-slate-300 font-bold">{{ reservaStore.vueloSeleccionado.destino }}</span>
      </div>
    </div>

    <div v-if="asientoStore.cargando" class="text-center py-12 bg-slate-50 dark:bg-slate-900/40 border rounded-3xl">
      <p class="text-slate-500 font-bold animate-pulse">Consultando disponibilidad en tiempo real con el proveedor...</p>
    </div>

    <div v-else-if="asientoStore.error" class="p-6 bg-red-50 text-red-600 border border-red-100 rounded-3xl text-center">
      <p class="font-bold">{{ asientoStore.error }}</p>
      <button @click="emit('atras')" class="mt-4 px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border shadow-sm text-xs hover:bg-slate-50">
        Volver a la selección de Pasajeros
      </button>
    </div>

    <div v-else-if="asientoStore.mapaAsientos" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <div class="lg:col-span-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col items-center">
        
        <div class="flex flex-wrap justify-center gap-4 mb-8 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded bg-amber-50 border border-amber-400 block"></span>
            Clase Business
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded bg-white border border-slate-200 block"></span>
            Clase Economica
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded bg-blue-600 block"></span>
            Seleccionado
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-4 h-4 rounded bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-[9px]">X</span>
            Ocupado
          </div>
        </div>

       
          
        <div 
          class="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-t-[100px] rounded-b-3xl p-8 shadow-sm transition-all duration-300"
          :class="estructuraAvion.anchoFuselaje"
        >
          
          <div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-8 pb-4 border-b-2 border-dashed border-slate-100 dark:border-slate-800">
            FRENTE DEL AVIÓN / CABINA PILOTOS
          </div>

          <div class="space-y-4">
            <div 
              v-for="fila in asientoStore.mapaAsientos.filas" 
              :key="fila.numero_fila" 
              class="flex items-center justify-center gap-3"
            >
              <span class="w-5 text-[11px] font-black text-slate-300 dark:text-slate-600 text-right select-none">
                {{ fila.numero_fila }}
              </span>

              <div class="flex items-center justify-center gap-1.5 w-full">
                <template v-for="(asiento, index) in fila.asientos" :key="asiento.id">
                  
                  <button
                    type="button"
                    @click="manejarSeleccion(asiento)"
                    :disabled="getEstadoAsiento(asiento) === 'ocupado'"
                    class="relative w-9 h-9 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border flex-shrink-0"
                    :class="[
                      obtenerStylePorClase(asiento),
                      // Si este asiento precede al pasillo, le metemos una separación física a la derecha (Margen de 24px)
                      debeMostrarPasillo(index, asientoStore.mapaAsientos.configuracion) ? 'mr-6' : ''
                    ]"
                    :title="`Clase: ${asiento.clase || 'Estándar'} - Asiento ${fila.numero_fila}${asiento.letra}`"
                  >
                    <Armchair class="w-3.5 h-3.5 stroke-[2.5]" />
                    
                    <span 
                      class="text-[8px] font-black absolute bottom-0.5 tracking-tighter" 
                      :class="getEstadoAsiento(asiento) === 'seleccionado' ? 'text-blue-200' : 'text-slate-400'"
                    >
                      {{ asiento.letra }}
                    </span>
                  </button>
                </template>
              </div>

              <span class="w-5 text-[11px] font-black text-slate-300 dark:text-slate-600 text-left select-none">
                {{ fila.numero_fila }}
              </span>
            </div>
          </div>
          <div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-8 pt-4 border-t-2 border-dashed border-slate-100 dark:border-slate-800">
            COLA DEL AVIÓN
          </div>
        </div>
        </div>
      

      <div class="space-y-6">
        <div class="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
          <h3 class="text-lg font-black tracking-tight flex items-center gap-2">
            <Info class="w-5 h-5 text-blue-400" /> Distribución
          </h3>
          
          <div 
  v-for="(pasajero, idx) in listaPasajeros" 
  :key="idx"
  class="py-4 flex flex-col gap-3"
>
  <div class="flex justify-between items-center">
    <div class="truncate max-w-[160px]">
      <p class="text-sm font-bold truncate">
        {{ pasajero.nombre || 'Pasajero' }} {{ pasajero.apellido || (idx + 1) }}
      </p>
      <p class="text-[10px] text-slate-400 uppercase font-black tracking-wider">
        {{ pasajero.tipo_documento || 'DOC' }}: {{ pasajero.nro_documento || '---' }}
      </p>
    </div>
    
    <span 
      class="px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200"
      :class="obtenerAsientoPasajero(idx) !== 'Sin asignar' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-800 text-slate-400'"
    >
      Asiento: {{ obtenerAsientoPasajero(idx) }}
    </span>
  </div>

  <div class="flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
    <label class="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer select-none">
      <input 
        type="checkbox" 
        v-model="pasajero.equipaje_extra" 
        class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-600 bg-slate-700"
      />
      <span>💼 Equipaje extra (Hasta 15kg)</span>
    </label>
    <span class="text-[11px] font-black text-emerald-400">+$12.000</span>
  </div>
</div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            type="button"
            @click="emit('atras')"
            class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" /> Volver a Pasajeros
          </button>
          
          <button 
            type="button"
            @click="handleSiguiente"
            :disabled="!puedeAvanzar"
            class="w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
            :class="puedeAvanzar 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 cursor-pointer' 
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'"
          >
            Proceder al Pago <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>