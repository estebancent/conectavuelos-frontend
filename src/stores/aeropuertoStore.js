import { defineStore } from 'pinia'
import * as aeropuertoService from '../services/aeropuertoService'

export const useAeropuertoStore = defineStore('aeropuerto', {
  state: () => ({
    aeropuertos: [],
    loading: false,
  }),

  actions: {
    async fetchAeropuertos() {
      this.loading = true
      try {
        const { data } = await aeropuertoService.getAeropuertos()
        this.aeropuertos = data
      } catch (err) {
        console.error('Error cargando aeropuertos', err)
      } finally {
        this.loading = false
      }
    }
  },
  
  // stores/aeropuertoStore.js
getters: {
  listaFormateada: (state) => {
    return state.aeropuertos.map(aero => ({
      id: aero.cod_iata,
      // Accedemos a la cadena que trajimos del back
      label: `${aero.ciudad.name}, ${aero.ciudad.provincia.pais.name} (${aero.cod_iata})`
    }))
  }
}
})