// stores/reservaStore.js
import { defineStore } from 'pinia'
import { useToast } from "vue-toastification"
import { obtenerMetodosPago } from '../services/metodoPagoService' 
import { crearReserva } from '../services/reservaService' // ◄--- IMPORTAMOS EL NUEVO SERVICIO

export const useReservaStore = defineStore('reserva', {
  state: () => ({
    vueloSeleccionado: null,
    pasajeros: [],        
    asientosElegidos: [], 
    metodoPagoId: null, // El ID seleccionado de la lista
    metodosPagoDisponibles: [],
    reservaConfirmada: null 
  }),

  actions: {
    setVuelo(vuelo) {
      if (!this.vueloSeleccionado || this.vueloSeleccionado.id !== vuelo.id) {
        this.pasajeros = []
        this.asientosElegidos = []
        this.metodoPagoId = null // ◄ Corregido nombre
        this.reservaConfirmada = null
      }
      this.vueloSeleccionado = vuelo
    },

    guardarPasajeros(listaPasajeros) {
      this.pasajeros = listaPasajeros
    },

    guardarAsientos(listaAsientos) {
      this.asientosElegidos = listaAsientos
    },

    async cargarMetodosPago() {
      try {
        this.metodosPagoDisponibles = await obtenerMetodosPago()
        if (this.metodosPagoDisponibles.length > 0) {
          this.metodoPagoId = this.metodosPagoDisponibles[0].id
        }
      } catch (error) {
        console.error('Error al cargar los métodos en el Store:', error)
      }
    },
    
   async enviarReservaABackend() {
  const toast = useToast()
  
  if (!this.vueloSeleccionado || this.pasajeros.length === 0 || this.asientosElegidos.length === 0 || !this.metodoPagoId) {
    toast.error("Faltan datos clave para completar la reserva.")
    return false
  }

  try {
    // Armamos el Payload con las propiedades exactas que el validador de Laravel exige
    // Adentro de stores/reservaStore.js -> enviarReservaABackend()
const payload = {
  vuelo_id: this.vueloSeleccionado.id, // ID del Mock
  
  // Enviamos los datos del mock para que Laravel los registre si no los tiene
  vuelo_datos: {
    codigo_vuelo: this.vueloSeleccionado.codigo_vuelo,
    origen: this.vueloSeleccionado.origen || 'BUE',
    destino: this.vueloSeleccionado.destino || 'CNQ',
    precio: this.vueloSeleccionado.precio || 0,
    avion_id: this.vueloSeleccionado.avion_id || 1, // Un ID por defecto de avión para tu tabla
    fecha_salida: this.vueloSeleccionado.fecha_salida,
    fecha_llegada: this.vueloSeleccionado.fecha_llegada,
    distancia_km: this.vueloSeleccionado.distancia_km
  },
  
  metodo_pago_id: this.metodoPagoId,
  pasajeros: this.pasajeros.map((p, index) => {
    const asiento = this.asientosElegidos[index];
    const idAsientoLimpio = (asiento && typeof asiento === 'object') ? (asiento.id || asiento.id_asiento) : asiento;

    return {
      datos: {
        tipo_documento: p.tipo_documento || 'DNI',
        nro_documento: parseInt(p.nro_documento),
        nombre: p.nombre,
        apellido: p.apellido,
        email: p.email,
        telefono: p.telefono || null,
        fechanac: p.fechanac || null
      },
      id_asiento: idAsientoLimpio,
      peso_equipaje_extra: p.equipaje_extra ? 15.00 : 0.00,
      costo_equipaje_extra: p.equipaje_extra ? 12000.00 : 0.00,
      precio_asiento_extra: 0.00
    }
  })
}

    // Usamos el servicio aislado que creaste recién
    const data = await crearReserva(payload) 
    
    this.reservaConfirmada = data
    toast.success("¡Reserva procesada con éxito!")
    return true
  }  catch (error) {
    console.error("Error al confirmar reserva en Store:", error);
    
    // ◄--- CAPTURAMOS EL ERROR REAL QUE VIENE DEL BACKEND
    if (error.response && error.response.data) {
      console.error("👉 DETALLE REAL DEL BACKEND:", error.response.data.error_real_bd);
      console.error("👉 EN LA LÍNEA:", error.response.data.linea);
      toast.error(error.response.data.error_real_bd || "Error al procesar la reserva.");
    } else {
      toast.error("Error al procesar la reserva.");
    }
    return false;
  }
},

    limpiarReserva() {
      this.$reset()
    }
  },
  persist: {
    storage: sessionStorage 
  }
})