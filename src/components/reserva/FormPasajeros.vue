<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useReservaStore } from '../../stores/reservaStore'
import { useAuthStore } from '../../stores/authStore'
import { useAsientoStore } from '../../stores/asientoStore' // ➔ IMPORTANTE: Importamos el store de asientos
import { useRouter } from 'vue-router'
import { User, Mail, Phone, Calendar, IdCard, Plus, Trash2, ArrowRight, ArrowLeft, Plane, AlertTriangle, RotateCcw } from 'lucide-vue-next'

const emit = defineEmits(['siguiente'])
const reservaStore = useReservaStore()
const authStore = useAuthStore()
const asientoStore = useAsientoStore() // ➔ Instanciamos el store
const router = useRouter()

// --- DISPONIBILIDAD REAL EN TIEMPO DE EJECUCIÓN ---
const asientosLibres = computed(() => {
  // Si el store de asientos ya cargó el mapa para este vuelo, contamos los disponibles reales
  if (asientoStore.mapaAsientos && asientoStore.mapaAsientos.filas) {
    let contador = 0
    asientoStore.mapaAsientos.filas.forEach(fila => {
      contador += fila.asientos.filter(a => a.disponible).length
    })
    return contador
  }
  
  // Fallback por si la API tarda un milisegundo en responder
  return reservaStore.vueloSeleccionado?.asientos_disponibles ?? 0
})

// --- DISPARADOR DE CARGA ---
onMounted(() => {
  const vueloId = reservaStore.vueloSeleccionado?.id
  if (vueloId) {
    // Despachamos la consulta al JSON de asientos en segundo plano apenas aparece el formulario
    asientoStore.consultarDisponibilidad(vueloId)
  }
})

// --- DATOS DEL VUELO ADAPTADOS ---
const vuelo = computed(() => {
  const v = reservaStore.vueloSeleccionado
  if (!v) return { id: null, nro_vuelo: 'S/D', origen: '---', destino: '---', precio: 0 }

  return {
    id: v.id,
    codigo_vuelo: v.codigo_vuelo || 'S/D',
    origen: v.origen || '---',
    destino: v.destino || '---',
    // Usamos el computado reactivo que cuenta los True reales
    asientos_disponibles: asientosLibres.value,
    precio: v.precio || 0
  }
})

// --- ESTADO ---
const pasajeros = ref([
  {
    tipo_documento: 'DNI',
    nro_documento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechanac: '',
    errores: { nro_documento: false, nombre: false, apellido: false, email: false, documentoDuplicado: false  }
  }
])
const mensajeAlerta = ref('')

// Función centralizada para rellenar el pasajero #1 con los datos de la sesión
const autocompletarConSesion = () => {
  if (authStore.isAuth && authStore.user?.persona && pasajeros.value.length > 0) {
    if (pasajeros.value[0].nombre || pasajeros.value[0].email) return

    const personaLogueada = authStore.user.persona
    
    pasajeros.value[0].tipo_documento = personaLogueada.tipo_documento || 'DNI'
    pasajeros.value[0].nro_documento = personaLogueada.nro_documento || ''
    pasajeros.value[0].nombre = personaLogueada.nombre || ''
    pasajeros.value[0].apellido = personaLogueada.apellido || ''
    pasajeros.value[0].email = personaLogueada.email || ''
    pasajeros.value[0].telefono = personaLogueada.telefono || ''
    pasajeros.value[0].fechanac = personaLogueada.fechanac || ''
    
    mensajeAlerta.value = "Hemos precargado tus datos de perfil para el Pasajero #1."
    setTimeout(() => { mensajeAlerta.value = '' }, 4000)
  }
}

onMounted(() => {
  if (reservaStore.pasajeros && reservaStore.pasajeros.length > 0) {
    pasajeros.value = reservaStore.pasajeros.map(p => ({
      ...p,
      errores: { nro_documento: false, nombre: false, apellido: false, email: false }
    }))
    return 
  }

  reservaStore.guardarPasajeros([]) 
  autocompletarConSesion()
})

watch(() => authStore.isAuth, (nuevoEstadoAuth) => {
  if (nuevoEstadoAuth) {
    autocompletarConSesion()
  }
})

// --- LÓGICA DE CONTROL DE DISPONIBILIDAD ---
const alcanzoLimiteDisponibilidad = computed(() => {
  return pasajeros.value.length >= asientosLibres.value
})

// --- ACCIONES ---
const agregarPasajero = () => {
  if (alcanzoLimiteDisponibilidad.value) {
    mensajeAlerta.value = `Lo sentimos, este vuelo solo cuenta con ${asientosLibres.value} asientos disponibles.`
    setTimeout(() => { mensajeAlerta.value = '' }, 4000)
    return
  }

  pasajeros.value.push({
    tipo_documento: 'DNI',
    nro_documento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechanac: '',
    errores: { nro_documento: false, nombre: false, apellido: false, email: false }
  })
}

const eliminarPasajero = (index) => {
  if (pasajeros.value.length > 1) {
    pasajeros.value.splice(index, 1)
  }
}

// ➔ NUEVA ACCIÓN: Limpiar Formulario por completo sin salir de la página
const limpiarFormulario = () => {
  // Dejamos un solo pasajero con la estructura limpia
  pasajeros.value = [
    {
      tipo_documento: 'DNI',
      nro_documento: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      fechanac: '',
      errores: { nro_documento: false, nombre: false, apellido: false, email: false }
    }
  ]
  // Limpiamos los pasajeros también del store para que quede síncrono
  reservaStore.guardarPasajeros([])
  
  // Si está logueado, le volvemos a ofrecer la precarga limpia
  autocompletarConSesion()
  
  mensajeAlerta.value = "Formulario restablecido."
  setTimeout(() => { mensajeAlerta.value = '' }, 2000)
}

// ➔ NUEVA ACCIÓN: Volver al Home limpiando el proceso actual
const volverAlHome = () => {
  reservaStore.limpiarReserva() // Resetea Pinia y borra el sessionStorage de esta reserva
  router.push('/') // Redirige al home/buscador (cambiá '/' por tu ruta exacta si es otra)
}

// BUSCAR SI EL DNI YA EXISTE (Simulación de Pasajero Frecuente)
const verificarDocumento = (index) => {
  const dni = pasajeros.value[index].nro_documento
  
  if (dni === '12345678') {
    mensajeAlerta.value = `¡Pasajero frecuente detectado en el registro número ${index + 1}! Se precargaron los datos.`
    
    pasajeros.value[index].nombre = 'Esteban Agustín'
    pasajeros.value[index].apellido = 'Centurión'
    pasajeros.value[index].email = 'esteban.centurion@email.com'
    pasajeros.value[index].telefono = '3794123456'
    pasajeros.value[index].fechanac = '2000-05-15'
    
    setTimeout(() => { mensajeAlerta.value = '' }, 4000)
  }
}

// --- VALIDACIÓN Y ENVÍO ---
const validarFormulario = () => {
  let valido = true
  
  // Limpiamos alertas previas
  mensajeAlerta.value = ''

  pasajeros.value.forEach((p, index) => {
    // Validaciones estándar de campos obligatorios
    p.errores.nro_documento = !p.nro_documento
    p.errores.nombre = !p.nombre
    p.errores.apellido = !p.apellido
    p.errores.email = !p.email
    p.errores.documentoDuplicado = false // Resetear en cada chequeo

    // ➔ CONTROL DE DUPLICADOS:
    // Si el pasajero tiene un documento cargado, verificamos si existe otro atrás de él con el mismo número
    if (p.nro_documento) {
      const esDuplicado = pasajeros.value.some((otroPasajero, otroIndex) => {
        return otroIndex < index && 
               otroPasajero.nro_documento && 
               String(otroPasajero.nro_documento).trim() === String(p.nro_documento).trim()
      })

      if (esDuplicado) {
        p.errores.documentoDuplicado = true
        valido = false
        mensajeAlerta.value = "Hay pasajeros con números de documento duplicados."
      }
    }
    
    // Si saltó cualquier error tradicional
    if (p.errores.nro_documento || p.errores.nombre || p.errores.apellido || p.errores.email) {
      valido = false
    }
  })
  
  // Limpiar el mensaje general después de unos segundos si falló
  if (!valido && mensajeAlerta.value) {
    setTimeout(() => { mensajeAlerta.value = '' }, 4000)
  }

  return valido
}

const handleSiguiente = () => {
  if (!validarFormulario()) return
  
  const datosClonados = pasajeros.value.map(({ errores, ...resto }) => resto)
  reservaStore.guardarPasajeros(datosClonados)
  
  emit('siguiente', {
    vuelo_id: vuelo.value.id,
    pasajeros: datosClonados
  })
}
</script>

<template>
  <div class="space-y-8">
    
    <div class="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-white/10 rounded-2xl">
          <Plane class="w-6 h-6 text-white rotate-90" />
        </div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-blue-200">Vuelo Seleccionado</span>
          <h3 class="text-xl font-black tracking-tight">
            {{ vuelo.codigo_vuelo }} | {{ vuelo.origen }} ➔ {{ vuelo.destino }}
          </h3>
        </div>
      </div>
      <div class="bg-white/10 px-4 py-2 rounded-2xl text-right self-stretch md:self-auto flex md:flex-col justify-between items-center md:items-end">
        <span class="text-xs font-bold text-blue-200 uppercase">Lugares Libres</span>
        <span class="text-lg font-black">{{ asientosLibres }} asientos</span>
      </div>
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
      <div>
        <h2 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          Información de los Pasajeros
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          Llevás seleccionados <strong>{{ pasajeros.length }}</strong> pasajes para este vuelo.
        </p>
      </div>
      
      <button 
        type="button" 
        @click="agregarPasajero" 
        :disabled="alcanzoLimiteDisponibilidad"
        class="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm
               disabled:opacity-40 disabled:cursor-not-allowed"
        :class="alcanzoLimiteDisponibilidad 
          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' 
          : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400'"
      >
        <template v-if="alcanzoLimiteDisponibilidad">
          <AlertTriangle class="w-4 h-4" /> Vuelo Completo
        </template>
        <template v-else>
          <Plus class="w-4 h-4" /> Agregar Pasajero
        </template>
      </button>
    </div>

    <div v-if="mensajeAlerta" class="p-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl text-sm font-bold animate-fade-in flex items-center gap-2">
      <span>{{ mensajeAlerta }}</span>
    </div>

    <form @submit.prevent="handleSiguiente" class="space-y-8">
      <div 
        v-for="(pasajero, index) in pasajeros" 
        :key="index"
        class="relative p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl transition-all shadow-sm"
      >
        <div class="flex justify-between items-center mb-6">
          <span class="px-4 py-1.5 bg-slate-800 text-white dark:bg-slate-700 rounded-full text-xs font-black uppercase tracking-wider">
            Pasajero #{{ index + 1 }} {{ index === 0 && authStore.isAuth ? '(Vos)' : '' }}
          </span>
          
          <button 
            v-if="pasajeros.length > 1"
            type="button" 
            @click="eliminarPasajero(index)" 
            class="p-2 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Tipo Doc.</label>
            <div class="relative">
              <IdCard class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <select v-model="pasajero.tipo_documento" class="input-field-custom appearance-none pl-12">
                <option value="DNI">DNI (Documento Nacional)</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Nro. Documento</label>
            <div class="relative">
              <IdCard 
                class="absolute left-4 top-3.5 w-5 h-5" 
                :class="pasajero.errores.nro_documento || pasajero.errores.documentoDuplicado ? 'text-red-500' : 'text-slate-400'" 
              />
              <input 
                v-model="pasajero.nro_documento"
                type="number"
                placeholder="Ej: 12345678"
                class="input-field-custom pl-12"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': pasajero.errores.nro_documento || pasajero.errores.documentoDuplicado}"
                @blur="verificarDocumento(index)"
              />
            </div>
            
            <p v-if="pasajero.errores.nro_documento" class="text-[10px] text-red-500 font-bold mt-1 ml-1">
              El documento es obligatorio
            </p>
            
            <p v-if="pasajero.errores.documentoDuplicado" class="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
              ⚠️ Este documento ya fue asignado a otro pasajero
            </p>
</div>

          <div>
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Fecha de Nacimiento</label>
            <div class="relative">
              <Calendar class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input v-model="pasajero.fechanac" type="date" class="input-field-custom pl-12" />
            </div>
          </div>

          <div>
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Nombres</label>
            <div class="relative">
              <User class="absolute left-4 top-3.5 w-5 h-5" :class="pasajero.errores.nombre ? 'text-red-500' : 'text-slate-400'" />
              <input 
                v-model="pasajero.nombre"
                type="text"
                placeholder="Como figura en el DNI"
                class="input-field-custom pl-12"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': pasajero.errores.nombre}"
              />
            </div>
            <p v-if="pasajero.errores.nombre" class="text-[10px] text-red-500 font-bold mt-1 ml-1">El nombre es obligatorio</p>
          </div>

          <div>
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Apellidos</label>
            <div class="relative">
              <User class="absolute left-4 top-3.5 w-5 h-5" :class="pasajero.errores.apellido ? 'text-red-500' : 'text-slate-400'" />
              <input 
                v-model="pasajero.apellido"
                type="text"
                placeholder="Como figura en el DNI"
                class="input-field-custom pl-12"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': pasajero.errores.apellido}"
              />
            </div>
            <p v-if="pasajero.errores.apellido" class="text-[10px] text-red-500 font-bold mt-1 ml-1">El apellido es obligatorio</p>
          </div>

          <div>
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Email</label>
            <div class="relative">
              <Mail class="absolute left-4 top-3.5 w-5 h-5" :class="pasajero.errores.email ? 'text-red-500' : 'text-slate-400'" />
              <input 
                v-model="pasajero.email"
                type="email"
                placeholder="ejemplo@correo.com"
                class="input-field-custom pl-12"
                :class="{'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10': pasajero.errores.email}"
              />
            </div>
            <p v-if="pasajero.errores.email" class="text-[10px] text-red-500 font-bold mt-1 ml-1">El email es obligatorio</p>
          </div>

          <div class="flex flex-col md:col-span-3">
            <label class="text-xs font-black uppercase text-slate-400 dark:text-slate-500 mb-2 ml-1">Teléfono de Contacto (Opcional)</label>
            <div class="relative">
              <Phone class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input v-model="pasajero.telefono" type="tel" placeholder="Ej: 3794123456" class="input-field-custom pl-12" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
        
        <button 
          type="button"
          @click="volverAlHome"
          class="w-full md:w-auto border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group"
        >
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Buscador
        </button>

        <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button 
            type="button"
            @click="limpiarFormulario"
            class="w-full md:w-auto bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 px-6 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw class="w-4 h-4" /> Limpiar Formulario
          </button>

          <button 
            type="submit" 
            class="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-900/10 dark:shadow-none"
          >
            Seleccionar Asientos <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </form>
  </div>
</template>

<style scoped>
.input-field-custom {
  @apply w-full pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700 dark:text-slate-200;
}
</style>