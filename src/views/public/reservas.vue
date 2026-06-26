<template>
  <div class="max-w-6xl mx-auto px-6 py-12 space-y-8">
    
    <div class="text-left space-y-2">
      <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
        Mis Vuelos Reservados
      </h1>
      <p class="text-slate-500 text-sm">
        Gestioná, revisá los itinerarios y descargá los tickets de tus compras realizadas.
      </p>
    </div>

    <div v-if="authStore.misReservas.length === 0" class="text-center py-20">
      <div class="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 border-2 border-dashed border-slate-200 dark:border-slate-800">
        <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <PlaneTakeoff class="w-10 h-10 text-blue-600" />
        </div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Aún no tenés vuelos reservados</h2>
        <p class="text-slate-500 max-w-md mx-auto text-sm">
          Los pasajes que compres o reserves a tu nombre o para terceros con tu cuenta iniciada van a figurar en este panel.
        </p>
        <router-link to="/" class="inline-block mt-8 bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-sm hover:bg-blue-700 transition-all shadow-sm">
          Buscar mi próximo destino
        </router-link>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="reserva in authStore.misReservas" 
        :key="reserva.id_reserva"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all relative overflow-hidden"
      >
        <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Código</span>
            <p class="text-lg font-black text-blue-600 tracking-wider">CV-{{ String(reserva.id).padStart(4, '0') }}</p>
          </div>
          <div class="text-right">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fecha Operación</span>
            <p class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ formatFecha(reserva.fecha_reserva) }}</p>
          </div>
        </div>

        <div class="space-y-4 flex-grow">
          <div 
            v-for="pasaje in reserva.pasajes" 
            :key="pasaje.id_pasaje"
            class="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl space-y-3"
          >
            <div v-for="vuelo in pasaje.vuelos" :key="vuelo.id_vuelo" class="space-y-2 pb-2 border-b border-slate-200/40 dark:border-slate-700/30 last:border-0 last:pb-0">
              <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-2">
                  <Plane class="w-4 h-4 text-slate-400 rotate-90" />
                  <span class="font-black text-slate-800 dark:text-slate-200">{{ vuelo.codigo_vuelo }}</span>
                  <span class="font-black text-slate-800 dark:text-slate-200">{{ vuelo.origen }} ➔ {{ vuelo.destino }}</span>
                </div>
                
                <div class="flex flex-col text-right text-[11px] font-bold text-slate-500">
                  <span>salida: {{ formatFechaHora(vuelo.fecha_salida) }}</span>
                  <span>llegada: {{ formatFechaHora(vuelo.fecha_llegada) }}</span>
                </div>
              </div>

              <div class="flex gap-2 items-center text-[11px]">
                <span class="inline-flex items-center gap-1 bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold">
                  <Armchair class="w-3 h-3 text-slate-500" />
                  Asiento: {{ vuelo.pivot?.asiento_name || vuelo.asiento_name || 'Sin Asignar' }}
                </span>
                
                <span 
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px]"
                  :class="getClaseBadgeStyle(vuelo.pivot?.clase_name || vuelo.clase_name)"
                >
                  {{ vuelo.pivot?.clase_name || vuelo.clase_name || 'Turista' }}
                </span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-700/50 text-xs">
              <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-slate-600 dark:text-slate-400">
                <div class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <span class="font-medium">{{ pasaje.persona?.nombre }} {{ pasaje.persona?.apellido }}</span>
                </div>
                
                <div class="flex items-center gap-1.5">
                  <IdCard class="w-3.5 h-3.5 text-slate-400" />
                  <span class="text-slate-500 dark:text-slate-500">{{ pasaje.persona?.nro_documento }}</span>
                </div>
              </div>

              <span class="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-black text-[10px] whitespace-nowrap">
                Ticket: {{ String(pasaje.numero_ticket || '').padStart(8, '0') }}
              </span>
            </div>

          </div>
        </div>

        <div class="flex justify-between items-center pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase">Monto Abonado</span>
            <p class="text-base font-black text-slate-800 dark:text-white">
              ${{ parseFloat(reserva.pago?.monto || 0).toLocaleString('es-AR') }}
            </p>
          </div>
          <button 
            @click="imprimirVoucher(reserva.id_reserva)"
            class="p-2.5 bg-slate-100 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white rounded-xl transition-all"
            title="Descargar Comprobante PDF"
          >
            <Download class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
// Importamos Armchair (Butaca) e IdCard para mejorar los componentes visuales
import { Plane, Calendar, User, Download, PlaneTakeoff, Armchair, IdCard } from 'lucide-vue-next'

const authStore = useAuthStore()

onMounted(() => {
  authStore.cargarMisReservas()
})

// Mapeador dinámico para pintar la clase con diferentes colores semánticos
const getClaseBadgeStyle = (clase) => {
  const normalizado = String(clase || '').toLowerCase()
  if (normalizado.includes('business') || normalizado.includes('ejecutiva')) {
    return 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
  }
  if (normalizado.includes('primera') || normalizado.includes('first')) {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
}

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatFechaHora = (fechaStr) => {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

const imprimirVoucher = (idReserva) => {
  alert(`Abriendo impresión para la reserva ID: ${idReserva}`)
}
</script>