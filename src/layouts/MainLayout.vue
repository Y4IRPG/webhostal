<template>
  <q-layout view="lHh lpR lFr">
    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn flat dense round icon="las la-bars" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> HostalWEB </q-toolbar-title>

        <q-btn dense flat round icon="las la-user-circle" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" elevated>
      <q-list>
        <q-item-label header> Opciones del usuario </q-item-label>

        <q-item
          v-for="link in linksList"
          :key="link.title"
          :to="link.link"
          clickable
          v-ripple
          active-class="q-item--active"
          :exact="link.exact"
          @click="link.external ? openExternalLink(link.link) : null"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption class="caption">{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay bordered>
      <q-list>
        <q-item-label header> Opciones de usuario </q-item-label>

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="las la-sign-out-alt" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Cerrar sesión</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'src/services/supabase'

const linksList = [
  {
    title: 'Reservaciones',
    caption: 'Registra reservas y visualizalas',
    icon: 'las la-book',
    link: '/reservaciones_page',
    exact: true,
    external: false,
  },
  {
    title: 'Gestión de habitaciones',
    caption: 'Gestiona las habitaciones de tu Hostal',
    icon: 'las la-bed',
    link: '/gestion_hostal',
    exact: true,
    external: false,
  },
]

const router = useRouter()
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

function openExternalLink(url) {
  window.open(url, '_blank')
}

// Función para cerrar sesión
async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.caption {
  color: #00000099; /* Color oscuro para la descripción cuando no está seleccionada */
}
.q-item--active .caption {
  color: white; /* Color claro para la descripción cuando está seleccionada */
}
.q-item--active {
  background-color: var(--q-primary); /* Color principal de la página */
  color: white; /* Color del texto cuando está seleccionado */
}
.q-item--active .q-item-label {
  color: white; /* Color del título cuando está seleccionado */
}
.q-item--active .q-icon {
  color: white; /* Color del icono cuando está seleccionado */
}
</style>
