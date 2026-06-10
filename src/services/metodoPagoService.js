import api from './api'

/**
 * Obtiene la lista completa de métodos de pago registrados en la base de datos local.
 * Se utiliza para renderizar dinámicamente las opciones en la pasarela.
 */
export const obtenerMetodosPago= () => {
    return api.get('/metodos-pago')
}