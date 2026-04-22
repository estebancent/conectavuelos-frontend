import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { createPinia } from 'pinia'

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// 🔥 IMPORTAR STORE
import { useAuthStore } from './stores/authStore'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, { position: "top-right" });

// 🔥 INICIALIZAR AUTH (CLAVE)
const auth = useAuthStore(pinia)
auth.initialize()

app.mount('#app')