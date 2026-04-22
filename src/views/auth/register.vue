<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { Mail, Lock, User, Loader2, ArrowRight, AlertCircle, Plane } from 'lucide-vue-next'

const name = ref('')
const email = ref('')
const password = ref('')
const auth = useAuthStore()

// VALIDACIONES EN TIEMPO REAL (Siguiendo tu lógica del Login)
const nameError = computed(() => {
  if (name.value.length === 0) return null
  return name.value.length < 3 ? 'Nombre demasiado corto' : null
})

const emailError = computed(() => {
  if (email.value.length === 0) return null
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email.value) ? null : 'Email no válido'
})

const passwordError = computed(() => {
  if (password.value.length === 0) return null
  return password.value.length < 6 ? 'Mínimo 6 caracteres' : null
})

const isFormInvalid = computed(() => {
  return emailError.value || passwordError.value || nameError.value || !email.value || !password.value || !name.value
})

const handleRegister = async () => {
  if (isFormInvalid.value) return
  await auth.register({
    name: name.value,
    email: email.value,
    password: password.value
  })
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="mb-10 text-center lg:text-left">
      <div class="flex items-center gap-2 mb-4 justify-center lg:justify-start">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Plane class="w-5 h-5" />
        </div>
        <span class="text-sm font-black text-blue-600 uppercase tracking-widest">Unite a ConectaVuelos</span>
      </div>
      <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Crear mi cuenta</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Empezá a planificar tu próximo viaje hoy.</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-5">
      
      <div class="space-y-2 group">
        <label class="input-label-pro">Nombre Completo</label>
        <div class="relative">
          <User :class="['input-icon', nameError ? 'text-rose-500' : '']" />
          <input 
            v-model="name" 
            type="text" 
            :class="['auth-input-pro', nameError ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : '']" 
            placeholder="Juan Pérez"
          />
        </div>
        <p v-if="nameError" class="text-[10px] text-rose-500 font-bold flex items-center gap-1">
          <AlertCircle class="w-3 h-3" /> {{ nameError }}
        </p>
      </div>

      <div class="space-y-2 group">
        <label class="input-label-pro">Correo Electrónico</label>
        <div class="relative">
          <Mail :class="['input-icon', emailError ? 'text-rose-500' : '']" />
          <input 
            v-model="email" 
            type="email" 
            :class="['auth-input-pro', emailError ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : '']" 
            placeholder="usuario@email.com"
          />
        </div>
        <p v-if="emailError" class="text-[10px] text-rose-500 font-bold flex items-center gap-1">
          <AlertCircle class="w-3 h-3" /> {{ emailError }}
        </p>
      </div>

      <div class="space-y-2 group">
        <label class="input-label-pro">Contraseña</label>
        <div class="relative">
          <Lock :class="['input-icon', passwordError ? 'text-rose-500' : '']" />
          <input 
            v-model="password" 
            type="password" 
            :class="['auth-input-pro', passwordError ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : '']" 
            placeholder="••••••••••••"
          />
        </div>
        <p v-if="passwordError" class="text-[10px] text-rose-500 font-bold flex items-center gap-1">
          <AlertCircle class="w-3 h-3" /> {{ passwordError }}
        </p>
      </div>

      <button
        type="submit"
        :disabled="auth.loading || isFormInvalid"
        class="register-submit-btn"
      >
        <Loader2 v-if="auth.loading" class="w-5 h-5 animate-spin" />
        <template v-else>
          Registrarme <ArrowRight class="w-4 h-4 ml-2" />
        </template>
      </button>

    </form>

    <div class="mt-8 text-center">
      <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
        ¿Ya tenés cuenta? 
        <router-link to="/auth/login" class="text-blue-600 font-bold hover:underline">Iniciá Sesión</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.input-label-pro {
  @apply text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 ml-1;
}

.auth-input-pro {
  @apply w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-0 focus:border-blue-500 transition-all outline-none text-slate-700 dark:text-white placeholder:text-slate-400 font-medium;
}

.input-icon {
  @apply absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors;
}

.register-submit-btn {
  @apply w-full flex items-center justify-center py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50
         bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 dark:shadow-none;
}
</style>