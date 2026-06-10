import api from './api'

export const crearReserva = async (datosReserva) => {
  const response = await api.post('/reservas', datosReserva)
  return response.data
}