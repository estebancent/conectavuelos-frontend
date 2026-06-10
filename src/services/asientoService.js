// services/asientoService.js
import api from './api'

/**
 * Obtiene el mapa híbrido estructurado de asientos de un vuelo específico.
 * Utiliza el mock externo para la forma del avión y la BD local para IDs y ocupación.
 */
export const obtenerAsientosPorVuelo = (vueloId) => {
    return api.get(`/vuelos/${vueloId}/asientos`)
}

export const buscarAsientosConFiltro = (vueloId, params) => {
    return api.get(`/vuelos/${vueloId}/asientos`, { params })
}