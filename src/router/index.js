import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import Home from '../views/home.vue'

// Layouts
import AuthLayout from '../layouts/authLayout.vue'
import AdminLayout from '../layouts/adminLayout.vue'
import publicLayout from '../layouts/publicLayout.vue'
// Views
import Login from '../views/auth/login.vue'
import Register from '../views/auth/register.vue'

import Catalogo from '../views/public/catalogo.vue'
import About from '../views/public/nosotros.vue'
import Reservas from '../views/public/reservas.vue'

import Dashboard from '../views/admin/dashboard.vue'
import Users from '../views/admin/users.vue'
import Products from '../views/admin/products.vue'
import Categories from '../views/admin/categories.vue'
import Brands from '../views/admin/brands.vue'
import Suppliers from '../views/admin/suppliers.vue'
import Sales from '../views/admin/sales.vue'
import Purchases from '../views/admin/purchases.vue'
import PublicLayout from '../layouts/publicLayout.vue'

const routes = [
    {  
   path: '/',
    component: PublicLayout,
    children: [
      {
        path: '', // Este es el Home (ruta: /)
        name: 'home',
        component: Home
      },
        {
            path: 'catalog',
            component: Catalogo
        }, 
         {
        path: 'about',
        component: About
      },     
      {
        path: 'reservas',
        component: Reservas
      }
    ]
        },
        // AUTH
        {
            path: '/auth',
            component: AuthLayout,
            children: [
            {
                path: 'login',
                component: Login
            },
            {
                path: 'register',
                component: Register
            }
            ]
        },
    {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'products', component: Products },
      { path: 'categories', component: Categories },
      { path: 'brands', component: Brands },
      { path: 'suppliers', component: Suppliers },
      { path: 'sales', component: Sales },
      { path: 'purchases', component: Purchases },
    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()

  // Si la ruta requiere admin y no hay token
  if (to.path.startsWith('/admin') && !auth.token) {
    // Simplemente retornamos el path al que queremos redirigir
    return '/auth/login'
  }

  // No hace falta llamar a next(). 
  // Si no retornas nada (o retornas true), la navegación continúa normalmente.
});
