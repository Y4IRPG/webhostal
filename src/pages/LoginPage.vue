<template>
  <div class="login-page flex flex-center">
    <q-img src="../assets/fondo.jpg" fit="cover" class="absolute-full"></q-img>
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6">Iniciar Sesión - HostalWEB</div>
      </q-card-section>

      <q-separator />

      <q-form @submit.prevent="login">
        <q-card-section>
          <q-input
            v-model="email"
            label="Correo Electrónico"
            type="email"
            outlined
            dense
            prepend-icon="las la-envelope"
            no-error-icon="las la-exclamation"
            :rules="[(val) => !!val || 'El correo es obligatorio']"
          />
          <q-input
            v-model="password"
            label="Contraseña"
            type="password"
            outlined
            dense
            prepend-icon="las la-lock"
            no-error-icon="las la-exclamation"
            :rules="[(val) => !!val || 'La contraseña es obligatoria']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Iniciar Sesión" color="primary" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </div>
</template>

<script>
import { supabase } from '../services/supabase'

export default {
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    async login() {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        })

        if (error) {
          this.$q.notify({
            type: 'negative',
            message: 'Error al iniciar sesión: ' + error.message,
            icon: 'las la-times-circle',
          })
          return
        }

        this.$q.notify({
          type: 'positive',
          message: 'Inicio de sesión exitoso',
          icon: 'las la-check-circle',
        })

        this.$router.push('/reservaciones_page')
      } catch (error) {
        console.error('Error al iniciar sesión:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al iniciar sesión',
          icon: 'las la-times-circle',
        })
      }
    },
  },
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
