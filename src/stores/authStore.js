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
    misReservas: []
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
        
        // Guardar datos en el estado y localStorage
        this.token = data.token
        this.user = data.user
        localStorage.setItem('token', data.token)
        
        await this.initialize()

        // 🔥 EXTRAEMOS EL NOMBRE DESDE LA RELACIÓN PERSONA
        const nombreMostrar = this.user?.persona?.nombre || this.user?.name

        toast.success(`¡Bienvenido, ${nombreMostrar}! `)
        router.push('/')
        
        return data 
      } catch (error) {
        const message = error.response?.data?.message || 'Credenciales incorrectas'
        toast.error(message)
        throw error 
      } finally {
        this.loading = false
      }
    },

    // 🚪 LOGOUT
    async logout() {
      try {
        await authService.logout()
      } catch (e) {}
      this.isAuth = false
      this.user = null
      this.token = null

      localStorage.removeItem('token')
      toast.info('Sesión cerrada correctamente')
      router.push('/auth/login')
    },
    async cargarMisReservas() {
      try {
        const response = await authService.obtenerMisReservas()
        // Dependiendo de cómo devuelvas el JSON en tu controlador (si directo o envuelto en un objeto)
        this.misReservas = response.data
      } catch (error) {
        console.error('Error al cargar el historial de vuelos:', error)
        this.misReservas = []
      }
    }
  
  }
})