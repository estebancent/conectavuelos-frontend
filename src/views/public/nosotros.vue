<script setup>
import { Users, ShieldCheck, Globe, Star } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-20">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <h2 class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight mb-6">
          Conectamos personas con sus <span class="text-blue-600">destinos soñados.</span>
        </h2>
        <p class="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          ConectaVuelos nació como un proyecto de innovación para la cátedra de Ingeniería de Software II. Nuestro objetivo es simplificar la experiencia de reserva de vuelos utilizando tecnologías de vanguardia y una arquitectura escalable.
        </p>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5">
            <h4 class="text-3xl font-black text-blue-600">100%</h4>
            <p class="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Seguro</p>
          </div>
          <div class="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5">
            <h4 class="text-3xl font-black text-indigo-600">24/7</h4>
            <p class="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Soporte</p>
          </div>
        </div>
      </div>

      <div class="relative">
        <div class="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[3rem] blur-2xl opacity-10"></div>
        <div class="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl">
          <div class="space-y-8">
            <div class="flex gap-4">
              <div class="w-12 h-12 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <ShieldCheck />
              </div>
              <div>
                <h4 class="font-bold text-slate-800 dark:text-white">Transparencia Total</h4>
                <p class="text-sm text-slate-500">Sin cargos ocultos. El precio que ves es el que pagás.</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-12 h-12 shrink-0 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Globe />
              </div>
              <div>
                <h4 class="font-bold text-slate-800 dark:text-white">Alcance Nacional</h4>
                <p class="text-sm text-slate-500">Cubrimos todos los aeropuertos de Argentina.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>