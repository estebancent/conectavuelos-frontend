// src/services/authService.js
import api from './api'

export default {

  login(credentials) {
    return api.post('/login', credentials)
  },

  logout() {
    return api.post('/logout')
  },

  me() {
    return api.get('/me')
  },
  //  Trae el historial de reservas que el usuario compró
  obtenerMisReservas() {
    return api.get('/user/reservas/mis-vuelos')
  }

}