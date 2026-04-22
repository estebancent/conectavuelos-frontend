<script setup>
import { Plane, ArrowLeft, Globe, Map } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
    
    <div class="hidden lg:flex w-1/2 bg-blue-600 dark:bg-blue-900 relative overflow-hidden items-center justify-center p-12">
      
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -left-24 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]"></div>
        <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[150px]"></div>
        <div class="absolute inset-0 opacity-[0.05]" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px;"></div>
      </div>

      <div class="relative z-10 max-w-lg text-center animate-in fade-in slide-in-from-left-8 duration-1000">
        <div class="inline-flex p-5 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
          <Plane class="w-16 h-16 text-white" />
        </div>
        
        <h2 class="text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
          Tu próximo destino <br/>
          <span class="text-sky-200 italic font-serif leading-relaxed">comienza acá.</span>
        </h2>
        
        <p class="text-blue-50 text-lg font-medium opacity-80 leading-relaxed">
          Accedé a tu panel de viajero para gestionar tus vuelos y descubrir beneficios exclusivos en todo el país.
        </p>
      </div>
      
      <div class="absolute bottom-12 left-12 flex items-center gap-4">
        <div class="flex items-center gap-2">
           <Map class="w-4 h-4 text-blue-300/60" />
           <p class="text-blue-300/40 text-[10px] font-black uppercase tracking-[0.3em]">
             ConectaVuelos // UNNE 2026
           </p>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
      
      <div class="absolute top-8 left-8 sm:left-12">
        <router-link 
          to="/" 
          class="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
          <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors border border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-500/20">
            <ArrowLeft class="w-4 h-4" />
          </div>
          <span>Volver al Buscador</span>
        </router-link>
      </div>

      <div class="absolute top-8 right-8 sm:right-12 hidden sm:block">
        <button class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <Globe class="w-4 h-4" /> ES-AR
        </button>
      </div>

      <div class="w-full max-w-md">
        <router-view />
      </div>
    </div>

  </div>
</template>

<style scoped>
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
}
</style>