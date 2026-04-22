<template>
  <div class="max-w-7xl mx-auto px-6 py-20 text-center">
    <div class="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 border-2 border-dashed border-slate-200 dark:border-slate-800">
      <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <Clock class="w-10 h-10 text-blue-600" />
      </div>
      <h1 class="text-3xl font-black text-slate-800 dark:text-white mb-4">Sección en Desarrollo</h1>
      <p class="text-slate-500 max-w-md mx-auto">
        Estamos trabajando para que puedas gestionar tus vuelos reservados. ¡Pronto estará disponible!
      </p>
      <router-link to="/" class="inline-block mt-8 text-blue-600 font-bold hover:underline">
        Volver al buscador
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Clock } from 'lucide-vue-next'
</script>