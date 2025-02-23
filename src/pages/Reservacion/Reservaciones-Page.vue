<template>
  <div class="reservaciones-container">
    <!-- Navbar Interno tipo Tabs -->
    <nav class="internal-navbar">
      <div
        :class="['tab', { active: currentView === 'registrar' }]"
        @click="changeView('registrar')"
      >
        Registrar
      </div>
      <div
        :class="['tab', { active: currentView === 'visualizar' }]"
        @click="changeView('visualizar')"
      >
        Visualizar
      </div>
      <!-- Línea deslizante -->
      <div class="active-line" :style="lineStyle"></div>
    </nav>

    <!-- Contenido Dinámico con Animación -->
    <transition name="slide-fade" mode="out-in">
      <component :is="currentViewComponent" key="currentView" />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RegistrarPage from './Registrar-Page.vue'
import VisualizarPage from './Visualizar-Page.vue'

const currentView = ref('registrar') // Vista inicial

const currentViewComponent = computed(() => {
  return currentView.value === 'registrar' ? RegistrarPage : VisualizarPage
})

const lineStyle = computed(() => ({
  transform: currentView.value === 'registrar' ? 'translateX(0%)' : 'translateX(100%)',
}))

const changeView = (view) => {
  currentView.value = view
}
</script>

<style scoped>
.reservaciones-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* Navbar tipo Tabs */
.internal-navbar {
  display: flex;
  position: relative;
  border-bottom: 2px solid #ddd;
  background-color: #fff;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.3s;
  position: relative;
  color: #666;
}

.tab.active {
  color: #5c2000;
}

/* Línea deslizante */
.active-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 3px;
  background-color: #5c2000;
  transition: transform 0.3s ease;
}

/* Animación del cambio de vista */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
