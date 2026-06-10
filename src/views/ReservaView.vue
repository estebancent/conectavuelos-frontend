<script setup>
import { ref } from 'vue'
import { useReservaStore } from '../stores/reservaStore'
import FormPasajeros from '../components/reserva/FormPasajeros.vue'
import MapaAsientos from '../components/reserva/MapaAsientos.vue'
import PasarelaPago from '../components/reserva/PasarelaPago.vue'
import ConfirmacionReserva from '../components/reserva/ConfirmacionReserva.vue'

const reservaStore = useReservaStore()
const pasoActual = ref(1) // Controla qué pantalla se renderiza

const avanzarPaso = () => { pasoActual.value++ }
const retrocederPaso = () => { pasoActual.value-- }

</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-12">
    <!-- Barra de Progreso Visual Estilo conectaVuelos -->
    <div class="flex justify-between items-center mb-12 bg-white p-4 rounded-2xl border border-slate-100">
      <span :class="{'text-blue-600 font-black': pasoActual === 1}">1. Pasajeros</span>
      <span :class="{'text-blue-600 font-black': pasoActual === 2}">2. Asientos</span>
      <span :class="{'text-blue-600 font-black': pasoActual === 3}">3. Pago</span>
      <span :class="{'text-blue-600 font-black': pasoActual === 4}">4. Fin</span>
    </div>

    <!-- Renderizado Dinámico de Vistas según el Paso -->
    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
      <FormPasajeros 
        v-if="pasoActual === 1" 
        @siguiente="avanzarPaso" 
      />
      
      <MapaAsientos 
        v-else-if="pasoActual === 2" 
        @siguiente="avanzarPaso" 
        @atras="retrocederPaso" 
      />
      
      <PasarelaPago 
        v-else-if="pasoActual === 3" 
        @siguiente="avanzarPaso" 
        @atras="retrocederPaso" 
      />
      
      <ConfirmacionReserva 
        v-else-if="pasoActual === 4" 
      />
    </div>
  </div>
</template>