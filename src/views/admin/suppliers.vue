<script setup>
import { onMounted, ref } from 'vue'

import { 
  Tag, Pencil, Trash2, X, Loader2, AlertCircle, Plus, RotateCcw 
} from 'lucide-vue-next'
import { useToast } from "vue-toastification"

const toast = useToast()
const supplierStore = useSupplierStore()
const mostrarForm = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const sending = ref(false)

const form = ref({ name: '' })

const fetchSuppliers = async () => {
  try {
    await supplierStore.fetchSuppliers()
  } catch (err) {
    toast.error("No se pudieron cargar los proveedores")
  }
}

const abrirModalCrear = () => {
  isEditing.value = false
  currentId.value = null
  form.value = { name: '' }
  mostrarForm.value = true
}

const abrirModalEditar = (supplier) => {
  isEditing.value = true
  currentId.value = supplier.id
  form.value = { name: supplier.name, cuit: supplier.cuit, address: supplier.address, phone: supplier.phone, email: supplier.email }
  mostrarForm.value = true
}

const guardarProveedor = async () => {
  if (!form.value.name) return toast.warning('El nombre es obligatorio')
  
  sending.value = true
  try {
    if (isEditing.value) {
      await supplierStore.updateSuppliers(currentId.value, form.value)
      toast.success("Proveedor actualizado correctamente")
    } else {
      await supplierStore.addSuppliers(form.value)
      toast.success("Proveedor creado correctamente")
    }
    mostrarForm.value = false
    form.value = { name: '' }
  } catch (err) {
    toast.error("Hubo un problema al procesar el proveedor")
  } finally {
    sending.value = false
  }
}

const cambiarEstado = async (supplier) => {
  const accion = supplier.is_active ? 'desactivar' : 'activar'
  if (confirm(`¿Estás seguro de ${accion} este proveedor?`)) {
    try {
      await supplierStore.toggleStatus(supplier.id)
      toast.success(`Proveedor ${accion}ado correctamente`)
    } catch (err) {
      toast.error("Error al cambiar el estado")
    }
  }
}

const restaurarProveedor = async (id) => {
  if (confirm('¿Deseas restaurar este proveedor?')) {
    try {
      await supplierStore.restoreSupplier(id)
      toast.success("Proveedor restaurado correctamente")
    } catch (err) {
      toast.error("No se pudo restaurar")
    }
  }
}

onMounted(fetchSuppliers)
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Proveedores</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Administración de proveedores</p>
      </div>
      <button 
        @click="abrirModalCrear"
        class="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <Plus class="w-5 h-5" /> Nuevo Proveedor
      </button>
    </div>

    <div v-if="supplierStore.loading" class="grid grid-cols-1 gap-4">
      <div v-for="i in 3" :key="i" class="h-20 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 animate-pulse rounded-2xl"></div>
    </div>

    <div v-else-if="supplierStore.error" class="flex flex-col items-center justify-center py-12 text-slate-400">
      <AlertCircle class="w-12 h-12 mb-2 text-rose-500" />
      <p>{{ supplierStore.error }}</p>
    </div>
    <div v-else-if="supplierStore.suppliers.length === 0" 
     class="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-[2rem] py-20 flex flex-col items-center justify-center text-center animate-in fade-in">
  <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
    <Tag class="w-10 h-10 text-slate-300 dark:text-slate-600" />
  </div>
  <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300 tracking-tight">No hay proveedores registrados</h3>
  <p class="text-sm text-slate-500 dark:text-slate-500 max-w-[250px] mt-1">
    Comienza agregando tu primer proveedor para organizar tus productos.
  </p>
  <button 
    @click="abrirModalCrear"
    class="mt-6 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline active:scale-95 transition-transform"
  >
    + Registrar proveedor ahora
  </button>
</div>
    <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors">
      <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
  <thead>
    <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
      <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Detalles de Proveedor</th>
      <!-- Cambié alineación a la izquierda para mejor lectura -->
      <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">CUIT</th>
        <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Dirección</th>
          <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Teléfono</th>
            <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Email</th>
      <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Estado</th>
      <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Acciones</th>
    </tr>
  </thead>

  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
    <tr v-for="supplier in supplierStore.suppliers" :key="supplier.id" 
        :class="['group transition-all', supplier.deleted_at ? 'opacity-50 grayscale-[0.5] bg-slate-50/50' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30']">
      
      <!-- Columna Nombre -->
      <td class="px-6 py-5">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700">
            <Tag class="w-5 h-5 opacity-50" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
              {{ supplier.name }}
              <span v-if="supplier.deleted_at" class="ml-2 text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase font-normal">Eliminado</span>
            </span>
            <span class="text-[11px] font-mono text-indigo-500">ID: #{{ supplier.id }}</span>
          </div>
        </div>
      </td>

      <!-- Columna CUIT (Corregida) -->
      <td class="px-6 py-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ supplier.cuit || 'Sin CUIT disponible' }}
        </p>
      </td>
       <!-- Columna address (Corregida) -->
      <td class="px-6 py-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ supplier.address || 'Sin dirección disponible' }}
        </p>
      </td>
      <!-- Columna phone (Corregida) -->
      <td class="px-6 py-5">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ supplier.phone || 'Sin teléfono disponible' }}
        </p>
        </td>
        <!-- Columna email (Corregida) -->
      <td class="px-6 py-5">    
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ supplier.email || 'Sin email disponible' }}
        </p>    
        </td>

      <!-- Columna Estado -->
      <td class="px-6 py-5 text-center">
        <span v-if="!supplier.deleted_at"
          :class="['inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', 
            supplier.is_active 
              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400']"
        >
          {{ supplier.is_active ? 'Activo' : 'Inactivo' }}
        </span>
        <span v-else class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-400">
          Fuera de sistema
        </span>
      </td>

      <!-- Columna Acciones -->
       <td class="px-6 py-5">
      <div class="flex justify-end gap-2">
        <template v-if="!supplier.deleted_at">
          <button @click="abrirModalEditar(supplier)" class="action-btn-edit" title="Editar">
            <Pencil class="w-4 h-4" />
          </button>
          <button 
            @click="cambiarEstado(supplier)" 
            :class="[supplier.is_active ? 'action-btn-delete' : 'action-btn-restore']"
            :title="supplier.is_active ? 'Desactivar' : 'Activar'"
          >
            <component :is="supplier.is_active ? Trash2 : Plus" class="w-4 h-4" />
          </button>
        </template>

        <template v-else>
          <button @click="restaurarProveedor(supplier.id)" class="action-btn-restore !text-indigo-600 !border-indigo-200 bg-indigo-50" title="Restaurar registro">
            <RotateCcw class="w-4 h-4" />
          </button>
        </template>
      </div>
    </td>
    </tr>
  </tbody>
</table>

      </div>
    </div>

    
  </div>
  <div v-if="mostrarForm" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div @click="mostrarForm = false" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
      
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
        
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-black text-slate-800 dark:text-white">{{ isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h3>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Información del proveedor</p>
          </div>
          <button @click="mostrarForm = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X class="w-5 h-5" />
          </button>
        </div>
       <div class="p-8 space-y-5">
  <!-- Nombre -->
  <div class="space-y-1.5">
    <label class="input-label">Nombre del Proveedor</label>
    <input 
      v-model="form.name" 
      type="text" 
      class="custom-input" 
      placeholder="Ej. Samsung, Nike, etc." 
      @keyup.enter="guardarProveedor"
    />
  </div>

  <!-- CUIT (Mejorado) -->
  <div class="space-y-1.5">
    <label class="input-label">CUIT</label>
    <input 
      v-model="form.cuit" 
      type="text" 
      class="custom-input" 
      placeholder="Ej. 30-12345678-9" 
      @keyup.enter="guardarProveedor"
    />
  </div>

  <!-- Dirección (Mejorado) -->
  <div class="space-y-1.5">
    <label class="input-label">Dirección</label>
    <input 
      v-model="form.address" 
      type="text" 
      class="custom-input" 
      placeholder="Ej. Av. Siempre Viva 123" 
      @keyup.enter="guardarProveedor"
    />
  </div>

  <!-- Teléfono (Mejorado) -->
  <div class="space-y-1.5">
    <label class="input-label">Teléfono</label>
    <input 
      v-model="form.phone" 
      type="text" 
      class="custom-input" 
      placeholder="Ej. 11-1234-5678" 
      @keyup.enter="guardarProveedor"
    />
  </div>

  <!-- Email (Mejorado) -->
  <div class="space-y-1.5">
    <label class="input-label">Email</label>
    <input 
      v-model="form.email" 
      type="email" 
      class="custom-input" 
      placeholder="Ej. proveedor@samsung.com" 
      @keyup.enter="guardarProveedor"
    />
  </div>
    
  
</div>


        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3 border-t border-slate-100 dark:border-slate-800">
          <button @click="mostrarForm = false" class="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-sm">
            Cancelar
          </button>
          <button 
            @click="guardarProveedor" 
            :disabled="sending"
            class="flex-1 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-xl"
          >
            <Loader2 v-if="sending" class="w-4 h-4 animate-spin" />
            {{ sending ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Proveedor') }}
          </button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.input-label { @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1; }
.custom-input { @apply w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-0 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 text-sm; }
.action-btn-edit { @apply p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all active:scale-90; }
.action-btn-delete { @apply p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-90; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-in { animation: fadeIn 0.4s ease-out forwards; }

.action-btn-restore {
  @apply p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-green-600 hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all active:scale-90;
}
</style>