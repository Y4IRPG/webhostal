import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { supabase } from '../services/supabase'
import App from '../App.vue'

// Escuchar cambios en la autenticación
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Cambio de estado de autenticación:', event, session)
})

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Forzar inicio en login si no hay sesión
      if (!session && to.path !== '/login') {
        return next('/login')
      }

      // Si el usuario está autenticado y trata de acceder a login, redirigir a reservaciones
      if (session && (to.path === '/' || to.path === '/login')) {
        return next('/reservaciones_page')
      }

      next()
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      next('/login')
    }
  })

  Router.addRoute({
    path: '/',
    component: App,
    children: routes,
  })

  return Router
})
