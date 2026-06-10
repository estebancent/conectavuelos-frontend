import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { createPinia } from 'pinia'
// ➔ 1. IMPORTAR EL PLUGIN DE PERSISTENCIA
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// 🔥 IMPORTAR STORE
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

// ➔ 2. VINCULAR EL PLUGIN A PINIA ANTES DE USARLO EN LA APP
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(Toast, { position: "top-right" });

// 🔥 INICIALIZAR AUTH (CLAVE)
const auth = useAuthStore(pinia)
auth.initialize()

app.mount('#app')