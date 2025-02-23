const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      {
        path: 'reservaciones_page',
        name: 'reservaciones_page',
        component: () => import('pages/Reservacion/Reservaciones-Page.vue'),
      },
      {
        path: 'gestion_hostal',
        name: 'gestion_hostal',
        component: () => import('pages/Gestion/Gestion-Hostal.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
