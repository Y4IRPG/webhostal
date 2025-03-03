<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Registro de Cliente</div>
      </q-card-section>

      <q-separator />

      <q-form @submit.prevent="registrar">
        <q-card-section>
          <q-row gutter-md>
            <!-- DNI -->
            <q-col cols="12" md="4">
              <q-input
                v-model="cliente.dni"
                label="DNI"
                outlined
                dense
                :rules="[(val) => !!val || 'El DNI es obligatorio']"
                prepend-icon="las la-id-card"
              >
                <template v-slot:append>
                  <q-btn dense flat round icon="las la-search" @click="buscarClientePorDNI" />
                </template>
              </q-input>
            </q-col>

            <!-- Nombres -->
            <q-col cols="12" md="4">
              <q-input
                v-model="cliente.nombres"
                label="Nombres"
                outlined
                dense
                prepend-icon="las la-user"
                :rules="[(val) => !!val || 'El nombre es obligatorio']"
              />
            </q-col>

            <!-- Apellidos -->
            <q-col cols="12" md="4">
              <q-input
                v-model="cliente.apellidos"
                label="Apellidos"
                outlined
                dense
                prepend-icon="las la-user"
                :rules="[(val) => !!val || 'El apellido es obligatorio']"
              />
            </q-col>

            <!-- Fecha de Nacimiento -->
            <q-col cols="12" md="4">
              <q-input
                v-model="cliente.nacimiento"
                label="Fecha de Nacimiento"
                type="date"
                outlined
                dense
                prepend-icon="las la-calendar"
                :rules="[(val) => !!val || 'La fecha de nacimiento es obligatoria']"
                @change="calcularEdad"
              />
            </q-col>

            <!-- Edad -->
            <q-col cols="12" md="4">
              <q-input
                v-model="cliente.edad"
                label="Edad"
                outlined
                dense
                prepend-icon="las la-birthday-cake"
                readonly
              />
            </q-col>

            <!-- Sexo -->
            <q-col cols="12" md="4">
              <q-select
                v-model="cliente.sexo"
                label="Sexo"
                :options="['Masculino', 'Femenino']"
                outlined
                dense
                prepend-icon="las la-genderless"
                dropdown-icon="las la-caret-down"
                :rules="[(val) => !!val || 'El sexo es obligatorio']"
              />
            </q-col>

            <!-- Nacionalidad -->
            <q-col cols="12" md="4">
              <q-select
                v-model="cliente.nacionalidad"
                label="Nacionalidad"
                :options="nacionalidades"
                option-label="nacionalidad"
                option-value="id"
                outlined
                dense
                prepend-icon="las la-globe"
                dropdown-icon="las la-caret-down"
                :rules="[(val) => !!val || 'La nacionalidad es obligatoria']"
                @update:model-value="actualizarProcedencias"
              />
            </q-col>

            <!-- Procedencia -->
            <q-col cols="12" md="6">
              <q-select
                v-model="cliente.procedencia"
                label="Procedencia"
                :options="procedencias"
                option-label="procedencia"
                option-value="id"
                outlined
                dense
                prepend-icon="las la-map-marked"
                dropdown-icon="las la-caret-down"
                :rules="[(val) => !!val || 'La procedencia es obligatoria']"
              />
            </q-col>

            <!-- Ocupación -->
            <q-col cols="12" md="6">
              <q-select
                v-model="cliente.ocupacion"
                label="Ocupación"
                :options="ocupaciones"
                option-label="ocupacion"
                option-value="id"
                outlined
                dense
                prepend-icon="las la-briefcase"
                dropdown-icon="las la-caret-down"
                :rules="[(val) => !!val || 'La ocupación es obligatoria']"
              />
            </q-col>
          </q-row>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Registro de Habitación</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-row gutter-md>
            <!-- Número de Habitación -->
            <q-col cols="12" md="4">
              <q-btn
                label="Seleccionar Habitación"
                color="primary"
                @click="abrirDialogoHabitaciones"
              />
            </q-col>
          </q-row>

          <q-row gutter-md>
            <!-- Mostrar datos de la habitación seleccionada -->
            <q-col cols="12" md="4">
              <q-input
                v-model="habitacionSeleccionada.numero_habitacion"
                label="Número de Habitación"
                outlined
                dense
                readonly
              />
            </q-col>
            <q-col cols="12" md="4">
              <q-input
                v-model="habitacionSeleccionada.tipo_habitacion"
                label="Tipo de Habitación"
                outlined
                dense
                readonly
              />
            </q-col>
            <q-col cols="12" md="4">
              <q-input v-model="habitacionSeleccionada.piso" label="Piso" outlined dense readonly />
            </q-col>
            <q-col cols="12" md="4">
              <q-input
                v-model="habitacionSeleccionada.precio"
                label="Precio"
                outlined
                dense
                readonly
              />
            </q-col>
          </q-row>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Registrar" color="primary" type="submit" />
          <q-btn label="Limpiar" color="secondary" @click="limpiarFormulario" text-color="black" />
        </q-card-actions>
      </q-form>
    </q-card>

    <q-dialog v-model="dialogoHabitacionesVisible" @click-outside="cerrarDialogoHabitaciones">
      <q-card class="q-dialog-plugin q-dialog-plugin--wider q-dialog-plugin--extra-wide">
        <q-card-section>
          <div class="text-h6">Seleccionar Habitación</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-row gutter-md>
            <!-- Fecha de Reserva -->
            <q-col cols="12" md="4">
              <q-input
                v-model="reserva.fecha_reserva"
                label="Fecha de Reserva"
                type="date"
                outlined
                dense
                prepend-icon="las la-calendar"
                :rules="[(val) => !!val || 'La fecha de reserva es obligatoria']"
                @change="filtrarHabitaciones"
              />
            </q-col>
            <q-col cols="12" md="6">
              <q-select
                v-model="filtroTipoHabitacion"
                label="Filtrar por Tipo de Habitación"
                :options="tiposHabitacion"
                option-label="tipo"
                option-value="id"
                dense
                outlined
                @update:model-value="filtrarHabitaciones"
              />
            </q-col>
            <q-col cols="12" md="6">
              <q-select
                v-model="filtroPiso"
                label="Filtrar por Piso"
                :options="[1, 2, 3]"
                dense
                outlined
                @update:model-value="filtrarHabitaciones"
              />
            </q-col>
          </q-row>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="habitaciones-grid">
            <q-col
              v-for="habitacion in obtenerHabitacionesOrdenadas()"
              :key="habitacion.id"
              @click="seleccionarHabitacion(habitacion)"
            >
              <q-card
                :class="{
                  'bg-green': habitacion.estado === 'disponible',
                  'bg-blue': habitacion.estado === 'reservada',
                  'bg-red': habitacion.estado === 'ocupada',
                }"
                class="q-pa-md text-white cursor-pointer habitacion-card"
                :style="{ opacity: habitacion.estado === 'disponible' ? 1 : 0.5 }"
              >
                <div class="text-h6">{{ habitacion.numero_habitacion }}</div>
                <div>{{ habitacion.tipos_habitacion.tipo }}</div>
                <div>{{ habitacion.piso }}</div>
                <div>{{ habitacion.estado }}</div>
              </q-card>
            </q-col>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="cerrarDialogoHabitaciones" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoTicketVisible" persistent>
      <q-card class="q-dialog-plugin q-dialog-plugin--wider q-dialog-plugin--extra-wide">
        <q-card-section>
          <div class="ticket">
            <p class="title">Hostal Web</p>
            <div class="info">
              <p><strong>R.U.C.:</strong> 10311248755</p>
              <p><strong>Dirección:</strong> Jr. Ramón Castilla N° 264 - Andahuaylas</p>
              <p><strong>Emisión:</strong> {{ reserva.fecha_reserva }}</p>
              <p><strong>Cliente:</strong> {{ cliente.nombres }} {{ cliente.apellidos }}</p>
              <p><strong>DNI:</strong> {{ cliente.dni }}</p>
              <p><strong>Fecha de Reserva:</strong> {{ reserva.fecha_reserva }}</p>
            </div>
            <div class="items">
              <table>
                <thead>
                  <tr>
                    <th>Habitación</th>
                    <th>Tipo</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ habitacionSeleccionada.numero_habitacion }}</td>
                    <td>{{ habitacionSeleccionada.tipo_habitacion }}</td>
                    <td>S/. {{ habitacionSeleccionada.precio }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="total">Total: S/. {{ habitacionSeleccionada.precio }}</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" @click="dialogoTicketVisible = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { supabase } from '../../services/supabase'
import {
  filtrarHabitaciones,
  actualizarHabitacionesDisponibles,
} from '../../utils/filtrarHabitaciones'

export default {
  data() {
    return {
      cliente: {
        dni: '',
        nombres: '',
        apellidos: '',
        nacimiento: '',
        sexo: '',
        nacionalidad: null,
        procedencia: null,
        ocupacion: null,
        edad: '',
      },
      habitacion: {
        numero_habitacion: '',
      },
      habitacionSeleccionada: {
        numero_habitacion: '',
        tipo_habitacion: '',
        piso: '',
        precio: '',
      },
      reserva: {
        fecha_reserva: this.getFechaReservaPeru(), // Fecha actual por defecto ajustada a la hora de Perú
      },
      nacionalidades: [],
      procedencias: [],
      ocupaciones: [],
      tiposHabitacion: [],
      habitaciones: [],
      habitacionesFiltradas: [],
      reservas: [],
      dialogoHabitacionesVisible: false,
      minFechaReserva: new Date().toISOString().split('T')[0], // Fecha mínima para la reserva (hoy)
      filtroTipoHabitacion: null,
      filtroPiso: null,
      dialogoTicketVisible: false,
    }
  },
  methods: {
    async buscarClientePorDNI() {
      if (!this.cliente.dni) {
        this.$q.notify({
          type: 'negative',
          message: 'El DNI es obligatorio',
          icon: 'las la-exclamation-triangle',
        })
        return
      }

      const { data, error } = await supabase
        .from('clientes')
        .select(
          `
          *,
          nacionalidades (id, nacionalidad),
          procedencias (id, procedencia),
          ocupaciones (id, ocupacion)
        `,
        )
        .eq('documento_identidad', this.cliente.dni)

      if (error || data.length === 0) {
        this.$q.notify({
          type: 'negative',
          message: 'Cliente no encontrado',
          icon: 'las la-exclamation-triangle',
        })
        return
      }

      const cliente = data[0] // Usar el primer registro encontrado

      this.cliente = {
        ...this.cliente,
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        nacimiento: cliente.fecha_nacimiento,
        sexo: cliente.sexo,
        nacionalidad: cliente.nacionalidades || null, // Usar el objeto de la nacionalidad
        procedencia: cliente.procedencias || null, // Usar el objeto de la procedencia
        ocupacion: cliente.ocupaciones || null, // Usar el objeto de la ocupación
      }
      this.calcularEdad() // Calcular y mostrar la edad después de establecer la fecha de nacimiento
      if (cliente.nacionalidades?.id) {
        await this.actualizarProcedencias(cliente.nacionalidades.id)
      }
    },
    async registrar() {
      // Validar que todos los campos del cliente y la habitación estén completos
      if (
        !this.cliente.dni ||
        !this.cliente.nombres ||
        !this.cliente.apellidos ||
        !this.cliente.nacimiento ||
        !this.cliente.sexo ||
        !this.cliente.nacionalidad ||
        !this.cliente.procedencia ||
        !this.cliente.ocupacion ||
        !this.habitacion.numero_habitacion
      ) {
        this.$q.notify({
          type: 'negative',
          message: 'Por favor, complete todos los campos del cliente y seleccione una habitación.',
          icon: 'las la-exclamation-triangle',
        })
        return
      }

      try {
        const nacionalidadId = this.cliente.nacionalidad?.id || null
        const procedenciaId = this.cliente.procedencia?.id || null
        const ocupacionId = this.cliente.ocupacion?.id || null

        const clienteData = {
          nombres: this.cliente.nombres,
          apellidos: this.cliente.apellidos,
          fecha_nacimiento: this.cliente.nacimiento,
          sexo: this.cliente.sexo,
          nacionalidad_id: nacionalidadId,
          documento_identidad: this.cliente.dni,
          procedencia_id: procedenciaId,
          ocupacion_id: ocupacionId,
        }

        console.log('Datos del cliente:', clienteData)

        const { data: clienteResponse, error: clienteError } = await supabase
          .from('clientes')
          .insert([clienteData])
          .select('id')
          .single()

        if (clienteError) {
          console.error('Error al registrar cliente:', clienteError)
          this.$q.notify({
            type: 'negative',
            message: 'Error al registrar cliente',
            icon: 'las la-times-circle',
          })
          return
        }

        const reservaData = {
          cliente_id: clienteResponse.id,
          habitacion_id: this.habitacion.numero_habitacion,
          fecha_reserva: this.reserva.fecha_reserva || new Date().toISOString().split('T')[0], // Guardar fecha de reserva en la tabla reservas
          fecha_entrada: null,
          fecha_salida: null,
        }

        console.log('Datos de la reserva:', reservaData)

        const { error: reservaError } = await supabase
          .from('reservas')
          .insert([reservaData])
          .single()

        if (reservaError) {
          console.error('Error al registrar reserva:', reservaError)
          this.$q.notify({
            type: 'negative',
            message: 'Error al registrar reserva',
            icon: 'las la-times-circle',
          })
          return
        }

        // Actualizar el estado de la habitación a "reservada"
        const { error: habitacionError } = await supabase
          .from('habitaciones')
          .update({ estado: 'reservada' })
          .eq('id', this.habitacion.numero_habitacion)

        if (habitacionError) {
          console.error('Error al actualizar el estado de la habitación:', habitacionError)
          this.$q.notify({
            type: 'negative',
            message: 'Error al actualizar el estado de la habitación',
            icon: 'las la-times-circle',
          })
          return
        }

        this.$q.notify({
          type: 'positive',
          message: 'Reserva registrada exitosamente',
          icon: 'las la-check-circle',
        })

        // Mostrar el ticket en el diálogo modal
        this.dialogoTicketVisible = true
      } catch (error) {
        console.error('Error al registrar datos:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Error al registrar datos',
          icon: 'las la-times-circle',
        })
      }
    },
    calcularEdad() {
      if (!this.cliente.nacimiento) return
      const hoy = new Date()
      const nacimiento = new Date(this.cliente.nacimiento)
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const mes = hoy.getMonth() - nacimiento.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
      }
      this.cliente.edad = edad
    },
    async actualizarProcedencias(nacionalidadId) {
      if (typeof nacionalidadId === 'object') {
        nacionalidadId = nacionalidadId.id
      }
      console.log('Cargando procedencias para nacionalidad ID:', nacionalidadId)
      const { data, error } = await supabase
        .from('procedencias')
        .select('*')
        .eq('nacionalidad_id', nacionalidadId)

      if (error) {
        console.error('Error cargando procedencias:', error)
        return
      }

      this.procedencias = data
      console.log('Procedencias cargadas:', this.procedencias)
    },
    async fetchTiposHabitacion() {
      const { data, error } = await supabase.from('tipos_habitacion').select('*')

      if (error) {
        console.error('Error cargando tipos de habitación:', error)
        return
      }

      this.tiposHabitacion = data
    },
    async fetchNacionalidades() {
      const { data, error } = await supabase.from('nacionalidades').select('*')

      if (error) {
        console.error('Error cargando nacionalidades:', error)
        return
      }

      this.nacionalidades = data
    },
    async fetchOcupaciones() {
      const { data, error } = await supabase.from('ocupaciones').select('*')

      if (error) {
        console.error('Error cargando ocupaciones:', error)
        return
      }

      this.ocupaciones = data
    },
    async fetchHabitaciones() {
      const { data, error } = await supabase
        .from('habitaciones')
        .select('*, tipos_habitacion (tipo, precio)')
        .neq('estado', 'inhabilitada') // Excluir habitaciones inhabilitadas

      if (error) {
        console.error('Error cargando habitaciones:', error)
        return
      }

      this.habitaciones = data
    },
    async fetchReservas() {
      const { data, error } = await supabase
        .from('reservas')
        .select(
          'habitacion_id, fecha_reserva, fecha_entrada, fecha_salida, habitaciones (id, numero_habitacion, tipo_habitacion_id, piso, tipos_habitacion (tipo, precio))',
        )

      if (error) {
        console.error('Error cargando reservas:', error)
        return
      }

      this.reservas = data
      console.log('Reservas cargadas:', this.reservas)
    },
    async abrirDialogoHabitaciones() {
      this.reserva.fecha_reserva = this.getFechaReservaPeru() // Actualizar la fecha de reserva a la hora de Perú
      await this.fetchHabitaciones()
      await this.fetchReservas()
      this.filtrarHabitaciones()
      this.dialogoHabitacionesVisible = true
    },
    cerrarDialogoHabitaciones() {
      this.dialogoHabitacionesVisible = false
    },
    obtenerHabitacionesOrdenadas() {
      return [...this.habitacionesFiltradas].sort(
        (a, b) => a.numero_habitacion - b.numero_habitacion,
      )
    },
    filtrarHabitaciones() {
      this.habitacionesFiltradas = filtrarHabitaciones(
        this.habitaciones,
        this.reservas,
        this.filtroTipoHabitacion,
        this.filtroPiso,
        this.reserva.fecha_reserva,
      )
    },
    seleccionarHabitacion(habitacion) {
      if (habitacion.estado === 'disponible') {
        this.habitacion.numero_habitacion = habitacion.id
        this.habitacionSeleccionada = {
          numero_habitacion: habitacion.numero_habitacion,
          tipo_habitacion: habitacion.tipos_habitacion.tipo,
          piso: habitacion.piso,
          precio: habitacion.tipos_habitacion.precio,
        }
        this.cerrarDialogoHabitaciones()
      }
    },
    getFechaReservaPeru() {
      const now = new Date()
      const peruOffset = -5 * 60 // UTC-5 en minutos
      const localOffset = now.getTimezoneOffset() // Offset local en minutos
      const peruTime = new Date(now.getTime() + (peruOffset - localOffset) * 60000)
      return peruTime.toISOString().split('T')[0]
    },
    limpiarFormulario() {
      this.cliente = {
        dni: '',
        nombres: '',
        apellidos: '',
        nacimiento: '',
        sexo: '',
        nacionalidad: null,
        procedencia: null,
        ocupacion: null,
        edad: '',
      }
      this.habitacion = {
        numero_habitacion: '',
      }
      this.habitacionSeleccionada = {
        numero_habitacion: '',
        tipo_habitacion: '',
        piso: '',
        precio: '',
      }
      this.reserva.fecha_reserva = this.getFechaReservaPeru()
    },
  },
  async mounted() {
    await this.fetchNacionalidades()
    await this.fetchOcupaciones()
    await this.fetchTiposHabitacion()
    await this.fetchHabitaciones()
    await this.fetchReservas()
    await actualizarHabitacionesDisponibles()
  },
}
</script>

<style scoped>
.habitaciones-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.habitacion-card {
  width: 100%;
  max-width: 200px;
  text-align: center;
  border-radius: 8px;
}

.ticket {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.info {
  text-align: left;
  font-size: 14px;
  margin: 10px 0;
}
.info strong {
  display: inline-block;
  width: 100px;
}
.items {
  width: 100%;
  border-top: 1px dashed black;
  border-bottom: 1px dashed black;
  padding: 10px 0;
  margin: 10px 0;
}
.items table {
  width: 100%;
  text-align: left;
  font-size: 14px;
}
.items th,
.items td {
  padding: 5px;
}
.total {
  font-size: 16px;
  font-weight: bold;
  text-align: right;
}
</style>
