<script setup>
import { 
  Package, Users, ShoppingCart, TrendingUp, 
  AlertTriangle, ArrowUpRight, ArrowDownRight 
} from 'lucide-vue-next'

// Datos de ejemplo (Luego los traeremos de tu API)
const stats = [
  { 
    label: 'Productos en Stock', 
    value: '1,284', 
    change: '+12%', 
    trend: 'up', 
    icon: Package, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50 dark:bg-indigo-500/10' 
  },
  { 
    label: 'Ventas del Mes', 
    value: '$12,450', 
    change: '+8.2%', 
    trend: 'up', 
    icon: ShoppingCart, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
  },
  { 
    label: 'Usuarios Activos', 
    value: '42', 
    change: '-2%', 
    trend: 'down', 
    icon: Users, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 dark:bg-blue-500/10' 
  },
  { 
    label: 'Stock Crítico', 
    value: '12', 
    change: 'Revisar', 
    trend: 'neutral', 
    icon: AlertTriangle, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50 dark:bg-rose-500/10' 
  },
]
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    
    <div>
      <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Panel Principal</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400">Resumen general de tu negocio hoy.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl transition-all hover:border-indigo-500/30 group"
      >
        <div class="flex justify-between items-start mb-4">
          <div :class="['p-3 rounded-2xl transition-colors', stat.bg]">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
          <span 
            :class="[
              'text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider',
              stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 
              stat.trend === 'down' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20' : 
              'bg-slate-100 text-slate-600 dark:bg-slate-800'
            ]"
          >
            {{ stat.change }}
          </span>
        </div>
        
        <div>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
            {{ stat.label }}
          </p>
          <h3 class="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
            {{ stat.value }}
          </h3>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
        <div class="flex justify-between items-center mb-6">
          <h4 class="font-black text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-indigo-500" /> Rendimiento Semanal
          </h4>
          <button class="text-xs font-bold text-indigo-500 hover:underline">Ver Reporte</button>
        </div>
        <div class="h-64 flex items-end justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div v-for="h in [40, 70, 45, 90, 65, 80, 50]" :key="h" 
               :style="{ height: h + '%' }" 
               class="flex-1 bg-indigo-100 dark:bg-indigo-500/20 rounded-t-xl hover:bg-indigo-500 dark:hover:bg-indigo-500 transition-all cursor-pointer group relative">
               <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                 ${{h * 10}}
               </span>
          </div>
        </div>
        <div class="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
        </div>
      </div>

      <div class="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
        <div class="relative z-10">
          <h4 class="text-xl font-black mb-4 leading-tight">¿Necesitas ayuda con el stock?</h4>
          <p class="text-indigo-100 text-sm mb-6 opacity-90 font-medium">Hemos detectado 5 productos que se agotarán en menos de 48hs.</p>
          <button class="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
            Revisar Inventario
          </button>
        </div>
        <Package class="absolute -bottom-10 -right-10 w-40 h-40 text-white/10 rotate-12" />
      </div>
    </div>

  </div>
</template>