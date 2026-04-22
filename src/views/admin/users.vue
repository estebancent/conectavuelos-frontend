<script setup>
import { onMounted, ref } from 'vue'
import { getUsers, createUser } from '../../services/userService'
import { 
  UserPlus, Pencil, Trash2, Mail, Phone, Fingerprint, 
  MapPin, X, Loader2, AlertCircle 
} from 'lucide-vue-next'
import { useToast } from "vue-toastification"

const toast = useToast()
const users = ref([])
const loading = ref(true)
const sending = ref(false)
const error = ref(null)
const mostrarForm = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  role_id: '',
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res.data
  } catch (err) {
    error.value = 'No se pudieron cargar los usuarios.'
    toast.error("Error al conectar con el servidor")
  } finally {
    loading.value = false
  }
}

const guardarUsuario = async () => {
  if (!form.value.role_id) return toast.warning('Por favor, seleccioná un rol')
  
  sending.value = true
  try {
    await createUser(form.value)
    toast.success("Usuario creado correctamente")
    mostrarForm.value = false
    form.value = { name: '', email: '', password: '', role_id: '' }
    fetchUsers()
  } catch (err) {
    toast.error("Hubo un problema al crear el usuario")
  } finally {
    sending.value = false
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Usuarios</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Panel de administración de cuentas</p>
      </div>
      <button 
        @click="mostrarForm = true"
        class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <UserPlus class="w-5 h-5" /> Nuevo Usuario
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4">
      <div v-for="i in 4" :key="i" class="h-20 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 animate-pulse rounded-2xl"></div>
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center py-12 text-slate-400">
      <AlertCircle class="w-12 h-12 mb-2 text-rose-500" />
      <p>{{ error }}</p>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Información General</th>
              <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Contacto</th>
              <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Identificación</th>
              <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Rol</th>
              <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest">Estado</th>
              <th class="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="user in users" :key="user.id" class="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
              <td class="px-6 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold border border-slate-200 dark:border-slate-700">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ user.name }}</span>
                    <span class="text-[11px] font-mono text-indigo-500">ID: {{ user.id }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5 text-sm">
                <div class="flex flex-col gap-1">
                  <span class="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Mail class="w-3.5 h-3.5" /> {{ user.email }}</span>
                  <span class="flex items-center gap-2 text-slate-400"><Phone class="w-3.5 h-3.5" /> {{ user.phone || 'N/A' }}</span>
                </div>
              </td>
              <td class="px-6 py-5 text-sm">
                <div class="flex flex-col gap-1">
                  <span class="flex items-center gap-2 text-slate-600 dark:text-slate-400"><MapPin class="w-3.5 h-3.5" /> {{ user.address || 'Sin dirección' }}</span>
                  <span class="flex items-center gap-2 text-[11px] text-slate-400 font-mono"><Fingerprint class="w-3.5 h-3.5" /> DNI: {{ user.dni || '---' }}</span>
                </div>
              </td>
              <td class="px-6 py-5">
                <span 
                  :class="['px-2 py-1 rounded text-xs font-bold', 
                    user.role_id === 1 ? 'bg-indigo-100 text-indigo-700' : 
                    user.role_id === 2 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700']"
                >
                  {{ user.role_id === 1 ? 'Administrador' : user.role_id === 2 ? 'Empleado' : 'Cliente' }}
                </span>

              </td>
              <td>
                <span 
                  :class="['px-2 py-1 rounded text-xs font-bold', 
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700']"
                >
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-5">
                <div class="flex justify-end gap-2">
                  <button class="action-btn-edit group/btn">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="action-btn-delete group/btn">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

   
  </div>
  <div v-if="mostrarForm" class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div @click="mostrarForm = false" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
      
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Nuevo Usuario</h3>
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Completa los datos de acceso</p>
          </div>
          <button @click="mostrarForm = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-8 space-y-5 overflow-y-auto custom-scrollbar">
          <div class="space-y-1.5">
            <label class="input-label">Nombre Completo</label>
            <input v-model="form.name" type="text" class="custom-input" placeholder="Ej. Juan Perez" />
          </div>

          <div class="space-y-1.5">
            <label class="input-label">Correo Electrónico</label>
            <input v-model="form.email" type="email" class="custom-input" placeholder="juan@ejemplo.com" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="input-label">Contraseña</label>
              <input v-model="form.password" type="password" class="custom-input" placeholder="••••••••" />
            </div>
            <div class="space-y-1.5">
              <label class="input-label">Rol de Usuario</label>
              <select v-model="form.role_id" class="custom-input appearance-none">
                <option disabled value="">Seleccionar...</option>
                <option value="1">Administrador</option>
                <option value="2">Empleado</option>
                <option value="3">Cliente</option>
              </select>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3 sticky bottom-0 border-t border-slate-100 dark:border-slate-800">
          <button @click="mostrarForm = false" class="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-sm">
            Cancelar
          </button>
          <button 
            @click="guardarUsuario" 
            :disabled="sending"
            class="flex-1 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <Loader2 v-if="sending" class="w-4 h-4 animate-spin" />
            {{ sending ? 'Guardando...' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.input-label {
  @apply text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1;
}

.custom-input {
  @apply w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-0 focus:border-indigo-500 transition-all outline-none text-slate-700 dark:text-slate-200 text-sm;
}

/* Botones de acción minimalistas */
.action-btn-edit {
  @apply p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all active:scale-90;
}

.action-btn-delete {
  @apply p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-90;
}

/* Animaciones de entrada */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>