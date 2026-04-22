import api from './api'


// El frontend debe enviar los parámetros como query strings (?origen=...&destino=...)
export const buscarVuelos = (params) => {
    return api.get('/vuelos/buscar', { params })
}
// O si preferís exportar por defecto (aunque mejor mantener tu estilo de marcas):
// export default { buscarVuelos }