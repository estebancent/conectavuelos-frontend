<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReservaStore } from '../../stores/reservaStore'
import { CheckCircle2, Ticket, Calendar, Plane, Download, Clock, Armchair, User } from 'lucide-vue-next'

const router = useRouter()
const reservaStore = useReservaStore()

// Redirección de seguridad: si no hay datos de reserva, mandamos al usuario al inicio
onMounted(() => {
  if (!reservaStore.reservaConfirmada || !reservaStore.vueloSeleccionado) {
    router.push('/')
  }
})

// Propiedades computadas dinámicas extraídas del Store
const vuelo = computed(() => reservaStore.vueloSeleccionado)
const infoBackend = computed(() => reservaStore.reservaConfirmada)

// Generador de código visual para el Ticket alineado con tu otra vista (usa .id o .id_reserva)
const codigoReserva = computed(() => {
  const id = infoBackend.value?.id || infoBackend.value?.id_reserva || 0
  return `CV-${String(id).padStart(4, '0')}`
})

// Mapeo seguro del Estado de la Reserva
const estadoFormateado = computed(() => {
  const estado = infoBackend.value?.estado_pago || infoBackend.value?.estado || infoBackend.value?.status
  if (estado === 'aprobado' || estado === 'confirmado' || codigoReserva.value !== 'CV-0000') {
    return 'Emitido'
  }
  return 'Pendiente'
})

// 🔧 EXTRACCIÓN DE PASAJEROS Y ASIENTOS DESDE LA ESTRUCTURA REAL DEL BACKEND
const listadoPasajesConfirmados = computed(() => {
  // Si el backend retorna la estructura limpia con la colección de pasajes directos
  if (infoBackend.value?.pasajes && Array.isArray(infoBackend.value.pasajes)) {
    return infoBackend.value.pasajes.map(pasaje => {
      // Buscamos el asiento dentro del pivot del primer vuelo asociado a este pasaje
      const primerVuelo = pasaje.vuelos?.[0]
      return {
        nombre: pasaje.persona?.nombre || 'Pasajero',
        apellido: pasaje.persona?.apellido || '',
        asiento: primerVuelo?.pivot?.asiento_name || 'Sin Asignar',
        clase: primerVuelo?.pivot?.clase_name || 'Económica'
      }
    })
  }

  // Fallback de emergencia por si usás estados locales del Store antes del refresh
  const pasajerosLocal = reservaStore.pasajeros || []
  const asientosLocal = reservaStore.asientosElegidos || []
  return pasajerosLocal.map((p, idx) => ({
    nombre: p.nombre,
    apellido: p.apellido,
    asiento: typeof asientosLocal[idx] === 'object' ? asientosLocal[idx]?.name : asientosLocal[idx] || 'Asignado',
    clase: 'Económica'
  }))
})

// Formateador de Fecha Amigable
const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' }
  return new Date(fechaStr).toLocaleDateString('es-AR', opciones)
}

// Formateador de Hora (HH:MM)
const formatHora = (fechaStr) => {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

// Acción: Limpiar los estados de la reserva y volver al inicio
const volverAlInicio = () => {
  reservaStore.limpiarReserva()
  router.push('/')
}

// Acción: Simulación de descarga del PDF
const descargarPDF = () => {
  const idReserva = infoBackend.value?.id_reserva || infoBackend.value?.id || 0
  alert(`Iniciando la generación del PDF para la Reserva ID: ${idReserva}...`)
}
</script>

<template>
  <div v-if="vuelo && infoBackend" class="max-w-2xl mx-auto text-center space-y-8 py-6">
    
    <div class="flex justify-center">
      <div class="p-4 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full animate-bounce">
        <CheckCircle2 class="w-16 h-16 stroke-[1.5]" />
      </div>
    </div>

    <div class="space-y-2">
      <h2 class="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">
        ¡Tu viaje ya está confirmado!
      </h2>
      <p class="text-slate-500 max-w-md mx-auto text-sm">
        Hemos procesado tu pago de ${{ parseFloat(infoBackend.pago?.monto || infoBackend.monto_total || 0).toLocaleString('es-AR') }} correctamente y generamos los pasajes en nuestro sistema.
      </p>
    </div>

    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 text-left shadow-sm relative overflow-hidden">
      
      <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full"></div>
      <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full"></div>
      
      <div class="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <div>
          <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Código de Reserva</span>
          <p class="text-2xl font-black text-blue-600 tracking-widest">{{ codigoReserva }}</p>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estado</span>
          <p 
            class="text-xs font-black px-3 py-1 rounded-full uppercase mt-0.5 inline-block"
            :class="estadoFormateado === 'Emitido' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-amber-600 bg-amber-50'"
          >
            {{ estadoFormateado }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="space-y-1">
          <span class="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Plane class="w-3 h-3" /> Vuelo 
          </span>

          <p class="font-bold text-slate-800 dark:text-slate-200">
            {{ vuelo.origen }} ➔ {{ vuelo.destino }}
          </p>
          <p class="font-bold text-slate-800 dark:text-slate-200">
            {{ vuelo.codigo_vuelo }}
          </p>
          <p class="text-xs text-slate-400 font-medium">{{ vuelo.aerolinea }}</p>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Clock class="w-3 h-3" /> Horarios
          </span>
          <p class="font-bold text-slate-800 dark:text-slate-200">
            {{ formatHora(vuelo.fecha_salida) }} <span class="text-slate-400 font-normal">a</span> {{ formatHora(vuelo.fecha_llegada) }}
          </p>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Calendar class="w-3 h-3" /> Fecha de Salida
          </span>
          <p class="font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ formatFecha(vuelo.fecha_salida) }}
          </p>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Calendar class="w-3 h-3" /> Fecha de Llegada
          </span>
          <p class="font-bold text-slate-800 dark:text-slate-200 text-xs">
            {{ formatFecha(vuelo.fecha_llegada) }}
          </p>
        </div>
        
        <div class="space-y-1 col-span-2 pt-2">
          <span class="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Ticket class="w-3 h-3" /> Pasajeros y Asientos Asignados
          </span>
          <div class="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl mt-1 space-y-2">
            <div 
              v-for="(item, index) in listadoPasajesConfirmados" 
              :key="index"
              class="font-bold text-xs text-slate-700 dark:text-slate-300 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 last:border-0 pb-1.5 last:pb-0"
            >
              <div class="flex items-center gap-1.5">
                <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{{ item.nombre }} {{ item.apellido }}</span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  {{ item.clase }}
                </span>
                <span class="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-black px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded-md">
                  <Armchair class="w-3 h-3" />
                  Asiento: {{ item.asiento }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row justify-center gap-4 pt-4">
      <button 
        @click="volverAlInicio"
        class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center justify-center gap-2"
      >
        Volver al Inicio
      </button>

      <button 
        @click="descargarPDF"
        type="button"
        class="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
      >
        <Download class="w-4 h-4" /> Descargar Tickets (PDF)
      </button>
    </div>

  </div>
</template>