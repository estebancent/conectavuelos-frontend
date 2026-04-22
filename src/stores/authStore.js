import { defineStore } from 'pinia'
import authService from '../services/authService'
import router from '../router'
import { useToast } from "vue-toastification"

const toast = useToast()    

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
  }),

  getters: {
    isAuth: (state) => !!state.token,
    isAdmin: (state) => state.user?.role?.name === 'admin',
  },

  actions: {

    // 🔄 Inicializar sesión
    async initialize() {
      if (this.token) {
        try {
          const { data } = await authService.me()
          this.user = data
        } catch (error) {
          this.logout()
        }
      }
    },

    // 🔐 LOGIN
   async login(credentials) {
  this.loading = true
  try {
    const { data } = await authService.login(credentials)
    
    // Guardar datos
    this.token = data.token
    this.user = data.user
    localStorage.setItem('token', data.token)
    
    // Configurar cabeceras de Axios (importante si no lo haces en el service)
    // api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    await this.initialize()

    // Solo si todo lo anterior fue bien:
    toast.success(`¡Bienvenido, ${this.user.name}! 👋`)
    router.push('/')
    
    return data // Retornamos para que el componente sepa que terminó bien
  } catch (error) {
    const message = error.response?.data?.message || 'Credenciales incorrectas'
    toast.error(message)
    throw error // Re-lanzamos para que el componente no limpie el form si hubo error
  } finally {
    this.loading = false
  }
},
    // 🚪 LOGOUT
    async logout() {
      try {
        await authService.logout()
      } catch (e) {}

      this.user = null
      this.token = null

      localStorage.removeItem('token')
        // 🔥 TOAST LOGOUT
      toast.info('Sesión cerrada correctamente 👋')
      router.push('/auth/login')
    }
  }
})