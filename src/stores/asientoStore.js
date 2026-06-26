import { defineStore } from 'pinia'
// ➔ AGREGÁ ESTA IMPORTACIÓN ACÁ ARRIBA:
import { obtenerAsientosPorVuelo } from '../services/asientoService' 


export const useAsientoStore = defineStore('asiento', {
  state: () => ({
    mapaAsientos: null,
    cargando: false,
    error: null,
    asientosSeleccionados: []
  }),

  actions: {
    async consultarDisponibilidad(vueloId) {
      this.cargando = true
      this.error = null
      
      try {
        // Ahora JavaScript ya sabe qué es y de dónde sale esta función:
        const respuesta = await obtenerAsientosPorVuelo(vueloId)
        
        this.mapaAsientos = respuesta.data
        
      } catch (err) {
        console.error("Error al cargar el mapa de asientos:", err)
        this.error = "No se pudo conectar con el servidor para obtener la distribución del avión."
      } finally {
        this.cargando = false
      }
    },

    seleccionarAsiento(asientoId, maxAsientos) {
      if (this.asientosSeleccionados.includes(asientoId)) {
        this.asientosSeleccionados = this.asientosSeleccionados.filter(id => id !== asientoId)
        return
      }
      
      if (this.asientosSeleccionados.length < maxAsientos) {
        this.asientosSeleccionados.push(asientoId)
      } else {
        this.asientosSeleccionados.shift()
        this.asientosSeleccionados.push(asientoId)
      }
    }
  }
})