<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservaStore } from '../../stores/reservaStore.js' 
import { CreditCard, ArrowLeft, Lock, Loader2, Sparkles } from 'lucide-vue-next'

const emit = defineEmits(['atras', 'siguiente'])
const reservaStore = useReservaStore()

// --- ESTADO DEL FORMULARIO ---
const metodoSeleccionadoId = computed({
  get: () => reservaStore.metodoPagoId,
  set: (val) => reservaStore.metodoPagoId = val
})

const procesando = ref(false)

// 1. FILTRADO ESTRICTO: Dejamos pasar únicamente Débito y Crédito para la presentación
const listaMetodosBD = computed(() => {
  const metodos = reservaStore.metodosPagoDisponibles
  let rawArray = []
  
  if (metodos && metodos.data && Array.isArray(metodos.data)) {
    rawArray = metodos.data
  } else if (Array.isArray(metodos)) {
    rawArray = metodos
  }
  
  // Filtramos estrictamente por los IDs 1 (Crédito) y 3 (Débito)
  return rawArray.filter(m => m && (m.id === 1 || m.id === 3))
})
const objetoMetodoActual = computed(() => {
  if (!listaMetodosBD.value) return null
  return listaMetodosBD.value.find(m => m.id === metodoSeleccionadoId.value) || null
})

// Forzamos a que el formulario esté siempre visible si hay algún método seleccionado
const requiereFormularioTarjeta = computed(() => {
  return metodoSeleccionadoId.value !== null && metodoSeleccionadoId.value !== undefined
})

const formularioTarjeta = ref({
  numero: '',
  nombre: '',
  expiracion: '',
  cvv: ''
})

const errores = ref({
  numero: false,
  nombre: false,
  expiracion: false,
  cvv: false
})

// --- AUTOCOMPLETADO PARA LA DEFENSA ACADÉMICA ---
const simularTarjetaValida = () => {
  formularioTarjeta.value = {
    numero: '4512 7490 2341 8892',
    nombre: 'ESTEBAN A CENTURION',
    expiracion: '2029-12',
    cvv: '713'
  }
  // Limpiamos errores previos al autocompletar
  errores.value = { numero: false, nombre: false, expiracion: false, cvv: false }
}

// --- CARGA AL MONTAR EL COMPONENTE ---
onMounted(async () => {
  await reservaStore.cargarMetodosPago()
  // Seleccionar automáticamente el primer método de tarjeta disponible para agilizar la UI
  if (listaMetodosBD.value.length > 0) {
    metodoSeleccionadoId.value = listaMetodosBD.value[0].id
  }
})

// --- LIQUIDACIÓN BASADA EN PINIA ---
const precioVueloBase = computed(() => reservaStore.vueloSeleccionado?.precio || 0)
const listaPasajeros = computed(() => reservaStore.pasajeros || [])
const cantidadPasajeros = computed(() => listaPasajeros.value.length)
const subtotalPasajes = computed(() => precioVueloBase.value * cantidadPasajeros.value)

const totalEquipajeAdicional = computed(() => {
  return listaPasajeros.value.reduce((total, pasajero) => {
    return total + (pasajero.equipaje_extra ? 12000 : 0)
  }, 0)
})

const tasasImpuestos = computed(() => (subtotalPasajes.value + totalEquipajeAdicional.value) * 0.15)
const totalAPagar = computed(() => subtotalPasajes.value + totalEquipajeAdicional.value + tasasImpuestos.value)

// --- VALIDACIONES DE FRONTEND ---
const validarCampos = () => {
  if (!requiereFormularioTarjeta.value) return true
  
  errores.value.numero = formularioTarjeta.value.numero.replace(/\s+/g, '').length < 16
  errores.value.nombre = formularioTarjeta.value.nombre.trim().length < 3
  errores.value.expiracion = !formularioTarjeta.value.expiracion
  errores.value.cvv = formularioTarjeta.value.cvv.length < 3

  return !Object.values(errores.value).includes(true)
}

// --- ACCIÓN DE PAGO ---
const iniciarPago = async () => {
  if (!validarCampos()) return

  procesando.value = true
  reservaStore.metodoPagoId = metodoSeleccionadoId.value

  const exito = await reservaStore.enviarReservaABackend()
  procesando.value = false

  if (exito) {
    emit('siguiente')
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="border-b border-slate-100 dark:border-slate-800 pb-6">
      <h2 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
        Método de Pago
      </h2>
      <p class="text-sm text-slate-500 mt-1">
        Finalizá tu compra de forma segura. Simulación transaccional con pasarela bancaria mock.
      </p>
    </div>

    <div v-if="cantidadPasajeros === 0" class="p-6 bg-amber-50 text-amber-700 border border-amber-200 rounded-3xl text-center font-bold">
      No se detectaron pasajeros registrados. Por favor, volvé al inicio del flujo.
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <div class="lg:col-span-2 space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="metodo in listaMetodosBD"
            :key="metodo.id"
            type="button"
            @click="metodoSeleccionadoId = metodo.id"
            :disabled="procesando"
            class="p-4 border rounded-2xl flex items-center justify-between font-bold text-sm transition-all text-left disabled:opacity-50"
            :class="metodoSeleccionadoId === metodo.id 
              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 ring-2 ring-blue-600' 
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'"
          >
            <div class="flex items-center gap-3">
              <CreditCard class="w-5 h-5 shrink-0 text-blue-500" />
              
              <div>
                <p class="font-black text-slate-800 dark:text-white">{{ metodo?.name }}</p>
                <p class="text-[11px] font-medium text-slate-400">
                  Procesamiento bancario directo
                </p>
              </div>
            </div>

            <div 
              class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
              :class="metodoSeleccionadoId === metodo.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-700'"
            >
              <div v-if="metodoSeleccionadoId === metodo.id" class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </button>
        </div>

        <div v-if="requiereFormularioTarjeta" class="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
          
          <div class="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
            <span class="text-xs font-black uppercase text-slate-400 tracking-wider">Datos de la Tarjeta</span>
            <button 
              type="button" 
              @click="simularTarjetaValida"
              class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles class="w-3.5 h-3.5" /> Autocompletar Test
            </button>
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-2 ml-1">Nombre del Tarjetahabiente</label>
            <input 
              v-model="formularioTarjeta.nombre"
              type="text"
              placeholder="Como figura en la tarjeta"
              class="input-field-custom"
              :class="{'ring-2 ring-red-500 border-transparent': errores.nombre}"
              :disabled="procesando"
            />
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-2 ml-1">Número de Tarjeta</label>
            <div class="relative">
              <input 
                v-model="formularioTarjeta.numero"
                type="text"
                placeholder="0000 0000 0000 0000"
                class="input-field-custom"
                :class="{'ring-2 ring-red-500 border-transparent': errores.numero}"
                :disabled="procesando"
              />
              <CreditCard class="absolute right-4 top-4 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-2 ml-1">Vencimiento</label>
              <input 
                v-model="formularioTarjeta.expiracion"
                type="month"
                class="input-field-custom"
                :class="{'ring-2 ring-red-500 border-transparent': errores.expiracion}"
                :disabled="procesando"
              />
            </div>

            <div class="flex flex-col">
              <label class="text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-2 ml-1">Cód. Seguridad (CVV)</label>
              <input 
                v-model="formularioTarjeta.cvv"
                type="password"
                maxlength="4"
                placeholder="123"
                class="input-field-custom"
                :class="{'ring-2 ring-red-500 border-transparent': errores.cvv}"
                :disabled="procesando"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <Lock class="w-4 h-4 text-green-500 shrink-0" />
            Simulación académica encriptada: Entidad integrada con {{ objetoMetodoActual?.name || 'Pasarela Local' }}.
          </div>
        </div>

      </div>

      <div class="space-y-6">
        <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 class="text-md font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Detalle de Facturación
          </h3>

          <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div class="flex justify-between">
              <span>Pasaje Aéreo (x{{ cantidadPasajeros }})</span>
              <span class="font-bold text-slate-800 dark:text-white">${{ subtotalPasajes.toLocaleString('es-AR') }}</span>
            </div>
            
            <div v-if="totalEquipajeAdicional > 0" class="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Equipaje de Bodega Adicional</span>
              <span class="font-bold">+${{ totalEquipajeAdicional.toLocaleString('es-AR') }}</span>
            </div>

            <div class="flex justify-between">
              <span>Tasas e Impuestos (15%)</span>
              <span class="font-bold text-slate-800 dark:text-white">${{ tasasImpuestos.toLocaleString('es-AR') }}</span>
            </div>
            
            <hr class="border-slate-200 dark:border-slate-800 my-2" />
            
            <div class="flex flex-col gap-1 pt-1">
              <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Total a Pagar</span>
              <div class="flex justify-between items-baseline">
                <span class="text-[10px] text-slate-400 font-medium font-mono">ARS</span>
                <span class="text-2xl font-black text-blue-600 dark:text-blue-400">${{ totalAPagar.toLocaleString('es-AR') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            type="button"
            @click="emit('atras')"
            :disabled="procesando"
            class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft class="w-4 h-4" /> Volver a Asientos
          </button>
          
          <button 
            type="button"
            @click="iniciarPago"
            :disabled="procesando || cantidadPasajeros === 0 || !metodoSeleccionadoId"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
          >
            <template v-if="procesando">
              <Loader2 class="w-5 h-5 animate-spin" /> Procesando...
            </template>
            <template v-else>
              Pagar y Confirmar Reserva
            </template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.input-field-custom {
  @apply w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700 dark:text-slate-200 disabled:opacity-60;
}
</style>