<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ mostrarTodos ? 'Reportes' : 'Lista de Reservas' }}</div>
        <q-space />
        <q-btn
          :label="mostrarTodos ? 'Salir' : 'Reportes'"
          :color="mostrarTodos ? 'secondary' : 'primary'"
          :text-color="mostrarTodos ? 'black' : 'white'"
          class="q-mr-md"
          @click="toggleReportes"
        />
        <q-input
          v-if="!mostrarTodos"
          v-model="search"
          placeholder="Buscar"
          dense
          outlined
          class="q-mr-md"
        >
          <template v-slot:append>
            <q-icon name="las la-search" />
          </template>
        </q-input>
        <q-input
          v-model="selectedDate"
          type="date"
          label="Filtrar por día"
          dense
          outlined
          class="q-ml-md"
          v-if="!mostrarTodos"
        />
        <q-btn
          v-if="mostrarTodos"
          label="Limpiar Filtros"
          color="primary"
          flat
          class="q-ml-md"
          @click="limpiarFiltros"
        />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="mostrarTodos ? reservasAgrupadas : filteredReservas"
          :columns="mostrarTodos ? reportColumns : columns"
          row-key="id"
          dense
          :loading="loading"
          loading-label="Cargando reservas..."
          :rows-per-page-options="[0]"
          :rows-per-page="0"
        >
          <template v-if="!mostrarTodos" v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn icon="las la-info-circle" dense flat @click="mostrarDetalles(props.row)" />
              <q-btn
                v-if="props.row.estado === 'reservada'"
                icon="las la-user-times"
                color="white"
                text-color="black"
                dense
                class="q-ml-sm"
                @click="abrirDialogoCancelar(props.row)"
              />
              <q-btn
                v-if="props.row.estado === 'reservada'"
                icon="las la-user-check"
                color="primary"
                dense
                class="q-ml-sm"
                @click="abrirDialogoEntrada(props.row)"
              />
              <q-btn
                v-if="props.row.estado === 'ocupada'"
                icon="las la-chevron-right"
                color="secondary"
                text-color="black"
                dense
                class="q-ml-sm"
                @click="abrirDialogoPernoctacion(props.row)"
              />
              <q-btn
                v-if="props.row.estado === 'ocupada'"
                icon="las la-door-open"
                color="primary"
                dense
                class="q-ml-sm"
                @click="abrirDialogoSalida(props.row)"
              />
            </q-td>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="col.headerClass"
              >
                <q-btn
                  flat
                  dense
                  @click="toggleFilter(col.name)"
                  v-if="
                    col.name === 'nacionalidad' ||
                    col.name === 'procedencia' ||
                    (mostrarTodos && col.name === 'fecha_reserva') ||
                    (mostrarTodos && col.name === 'tipo_r')
                  "
                >
                  {{ col.label }}
                  <q-icon name="las la-caret-down" />
                </q-btn>
                <div v-else>{{ col.label }}</div>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body-cell-precio="props">
            <q-td :props="props">
              {{ props.row.precio }}
            </q-td>
          </template>
          <template v-if="mostrarTodos" v-slot:bottom="props">
            <q-tr :props="props">
              <q-td colspan="100%">
                <div class="text-right q-mr-md"><strong>Total:</strong> {{ totalPrecio }}</div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogoVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Detalles de la Reserva</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>
            <strong>Nombre del Cliente:</strong> {{ detallesReserva.nombres }}
            {{ detallesReserva.apellidos }}
          </div>
          <div>
            <strong>Documento de Identidad:</strong> {{ detallesReserva.documento_identidad }}
          </div>
          <div><strong>Edad:</strong> {{ detallesReserva.edad }}</div>
          <div><strong>Sexo:</strong> {{ detallesReserva.sexo }}</div>
          <div><strong>Nacionalidad:</strong> {{ detallesReserva.nacionalidad }}</div>
          <div><strong>Procedencia:</strong> {{ detallesReserva.procedencia }}</div>
          <div><strong>Ocupación:</strong> {{ detallesReserva.ocupacion }}</div>
          <div><strong>Tipo de Habitación:</strong> {{ detallesReserva.tipo_habitacion }}</div>
          <div><strong>Número de Habitación:</strong> {{ detallesReserva.numero_habitacion }}</div>
          <div><strong>Fecha de Reserva:</strong> {{ detallesReserva.fecha_reserva }}</div>
          <div>
            <strong>Fecha de Entrada:</strong>
            {{ formatearFecha(detallesReserva.fecha_entrada) || '' }}
          </div>
          <div>
            <strong>Fecha de Salida:</strong>
            {{ formatearFecha(detallesReserva.fecha_salida) || '' }}
          </div>
          <div><strong>Estado:</strong> {{ detallesReserva.estado }}</div>
          <div><strong>Precio:</strong> {{ detallesReserva.precio }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoCancelarVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Cancelación</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>¿Estás seguro de que deseas cancelar esta reserva?</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Confirmar"
            color="primary"
            @click="cancelarReserva(detallesReserva.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoEntradaVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Registrar Fecha de Entrada</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>¿Estás seguro de que deseas registrar la fecha de entrada para esta reserva?</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Registrar"
            color="primary"
            @click="registrarEntrada(detallesReserva.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoSalidaVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Registrar Fecha de Salida</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>¿Estás seguro de que deseas registrar la fecha de salida para esta reserva?</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Registrar"
            color="primary"
            @click="registrarSalida(detallesReserva.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoPernoctacionVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Pernoctación</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>¿Estás seguro de que deseas marcar esta reserva como pernoctación?</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Confirmar"
            color="primary"
            @click="marcarPernoctacion(detallesReserva)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="filtroNacionalidadVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Filtrar por Nacionalidad</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            v-model="filtroNacionalidad"
            label="Nacionalidad"
            :options="nacionalidades.map((n) => n.nacionalidad)"
            outlined
            dense
            @update:model-value="filtrarReservas"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="filtroProcedenciaVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Filtrar por Procedencia</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            v-model="filtroProcedencia"
            label="Procedencia"
            :options="procedencias.map((p) => p.procedencia)"
            outlined
            dense
            @update:model-value="filtrarReservas"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="filtroFechaVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Filtrar por Fecha</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model="filtroFecha"
            label="Fecha"
            type="date"
            outlined
            dense
            @update:model-value="filtrarReservas"
          />
          <q-input
            v-model="filtroMes"
            label="Mes"
            type="month"
            outlined
            dense
            @update:model-value="filtrarReservas"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="filtroTipoReservaVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Filtrar por Tipo de Reserva</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-select
            v-model="filtroTipoReserva"
            label="Tipo de Reserva"
            :options="['arrivo', 'pernoctacion']"
            outlined
            dense
            @update:model-value="filtrarReservas"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'src/services/supabase'
import { actualizarHabitacionesDisponibles } from 'src/utils/filtrarHabitaciones'

export default {
  setup() {
    const reservas = ref([])
    const loading = ref(true)
    const search = ref('')
    const selectedDate = ref(new Date().toISOString().substr(0, 10)) // Fecha actual por defecto
    const dialogoVisible = ref(false)
    const detallesReserva = ref({})

    const dialogoCancelarVisible = ref(false)
    const dialogoEntradaVisible = ref(false)
    const dialogoSalidaVisible = ref(false)
    const dialogoPernoctacionVisible = ref(false)
    const mostrarTodos = ref(false)
    const filtroNacionalidad = ref(null)
    const filtroProcedencia = ref(null)
    const filtroFecha = ref(null)
    const filtroMes = ref(null)
    const filtroTipoReserva = ref(null)
    const filtroNacionalidadVisible = ref(false)
    const filtroProcedenciaVisible = ref(false)
    const filtroFechaVisible = ref(false)
    const filtroTipoReservaVisible = ref(false)
    const nacionalidades = ref([])
    const procedencias = ref([])

    const columns = [
      {
        name: 'documento_identidad',
        label: 'N° Documento',
        field: 'documento_identidad',
        align: 'left',
      },
      { name: 'nombres', label: 'Nombres', field: 'nombres', align: 'left' },
      { name: 'apellidos', label: 'Apellidos', field: 'apellidos', align: 'left' },
      { name: 'tipo_habitacion', label: 'Tipo', field: 'tipo_habitacion', align: 'left' },
      { name: 'numero_habitacion', label: 'Habitación', field: 'numero_habitacion', align: 'left' },
      { name: 'fecha_reserva', label: 'Reservó para', field: 'fecha_reserva', align: 'left' },
      { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
      { name: 'tipo_r', label: 'Tipo de Reserva', field: 'tipo_r', align: 'left' }, // Actualizar columna
      { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
    ]

    const reportColumns = [
      { name: 'precio', label: 'Ganancia', field: 'precio', align: 'left' },
      {
        name: 'nacionalidad',
        label: 'Nacionalidad',
        field: 'nacionalidad',
        align: 'left',
        headerSlot: 'nacionalidad-header',
      },
      {
        name: 'procedencia',
        label: 'Procedencia',
        field: 'procedencia',
        align: 'left',
        headerSlot: 'procedencia-header',
      },
      {
        name: 'fecha_reserva',
        label: 'Fecha',
        field: 'fecha_reserva',
        align: 'left',
        headerSlot: 'fecha-header',
      },
      {
        name: 'tipo_r',
        label: 'Tipo de Reserva',
        field: 'tipo_r',
        align: 'left',
        headerSlot: 'tipo-reserva-header',
      },
    ]

    const fetchReservas = async () => {
      loading.value = true
      try {
        const { data, error } = await supabase.from('reservas').select(`
          id,
          cliente_id,
          habitacion_id,
          fecha_reserva,
          fecha_entrada,
          fecha_salida,
          tipo_r,
          clientes:cliente_id (
            documento_identidad,
            nombres,
            apellidos,
            fecha_nacimiento,
            sexo,
            nacionalidad_id,
            procedencia_id,
            ocupacion_id,
            nacionalidades:nacionalidad_id (nacionalidad),
            procedencias:procedencia_id (procedencia),
            ocupaciones:ocupacion_id (ocupacion)
          ),
          habitaciones:habitacion_id (
            numero_habitacion,
            tipo_habitacion_id,
            estado,
            tipos_habitacion:tipo_habitacion_id (tipo, precio)
          )
        `)

        if (error) {
          console.error('Error cargando reservas:', error)
          return
        }

        reservas.value = data.map((reserva) => ({
          id: reserva.id,
          cliente_id: reserva.cliente_id,
          habitacion_id: reserva.habitacion_id,
          fecha_reserva: reserva.fecha_reserva,
          fecha_entrada: reserva.fecha_entrada,
          fecha_salida: reserva.fecha_salida,
          tipo_r: reserva.tipo_r,
          documento_identidad: reserva.clientes?.documento_identidad || '',
          nombres: reserva.clientes?.nombres || '',
          apellidos: reserva.clientes?.apellidos || '',
          fecha_nacimiento: reserva.clientes?.fecha_nacimiento || '',
          sexo: reserva.clientes?.sexo || '',
          nacionalidad: reserva.clientes?.nacionalidades?.nacionalidad || '',
          procedencia: reserva.clientes?.procedencias?.procedencia || '',
          ocupacion: reserva.clientes?.ocupaciones?.ocupacion || '',
          tipo_habitacion: reserva.habitaciones?.tipos_habitacion?.tipo || '',
          numero_habitacion: reserva.habitaciones?.numero_habitacion || '',
          estado: reserva.habitaciones?.estado || '',
          precio: reserva.habitaciones?.tipos_habitacion?.precio || 0,
        }))
      } catch (error) {
        console.error('Error cargando reservas:', error)
      } finally {
        loading.value = false
      }
    }

    const fetchNacionalidades = async () => {
      const { data, error } = await supabase.from('nacionalidades').select('*')

      if (error) {
        console.error('Error cargando nacionalidades:', error)
        return
      }

      nacionalidades.value = data
    }

    const fetchProcedencias = async () => {
      const { data, error } = await supabase.from('procedencias').select('*')

      if (error) {
        console.error('Error cargando procedencias:', error)
        return
      }

      procedencias.value = data
    }

    const filteredReservas = computed(() => {
      let filtered = reservas.value

      if (search.value) {
        filtered = filtered.filter((reserva) =>
          Object.values(reserva).some((value) =>
            String(value).toLowerCase().includes(search.value.toLowerCase()),
          ),
        )
      }

      if (selectedDate.value) {
        filtered = filtered.filter((reserva) => reserva.fecha_reserva === selectedDate.value)
      }

      return filtered
    })

    const reservasFiltradas = computed(() => {
      let filtered = reservas.value

      if (filtroNacionalidad.value) {
        filtered = filtered.filter((reserva) => reserva.nacionalidad === filtroNacionalidad.value)
      }

      if (filtroProcedencia.value) {
        filtered = filtered.filter((reserva) => reserva.procedencia === filtroProcedencia.value)
      }

      if (filtroFecha.value) {
        filtered = filtered.filter((reserva) => reserva.fecha_reserva === filtroFecha.value)
      }

      if (filtroMes.value) {
        filtered = filtered.filter(
          (reserva) => reserva.fecha_reserva.substr(0, 7) === filtroMes.value,
        )
      }

      if (filtroTipoReserva.value) {
        filtered = filtered.filter((reserva) => reserva.tipo_r === filtroTipoReserva.value) // Actualizar filtro
      }

      return filtered
    })

    const reservasAgrupadas = computed(() => {
      const agrupadas = []
      const mapaReservas = new Map()

      reservasFiltradas.value.forEach((reserva) => {
        if (reserva.tipo_r === 'pernoctacion') {
          // Actualizar agrupación
          const key = `${reserva.cliente_id}-${reserva.habitacion_id}`
          if (!mapaReservas.has(key)) {
            mapaReservas.set(key, {
              ...reserva,
              fechas: [reserva.fecha_reserva],
              totalPrecio: reserva.precio,
            })
          } else {
            const reservaExistente = mapaReservas.get(key)
            reservaExistente.fechas.push(reserva.fecha_reserva)
            reservaExistente.totalPrecio += reserva.precio
          }
        } else {
          agrupadas.push(reserva)
        }
      })

      mapaReservas.forEach((reserva) => {
        reserva.fecha_reserva = reserva.fechas[0]
        reserva.precio = reserva.totalPrecio
        agrupadas.push(reserva)
      })

      return agrupadas
    })

    const totalPrecio = computed(() => {
      return reservasAgrupadas.value.reduce((total, reserva) => total + reserva.precio, 0)
    })

    const mostrarDetalles = (reserva) => {
      detallesReserva.value = {
        ...reserva,
        edad: calcularEdad(reserva.fecha_nacimiento), // Calcular la edad a partir de la fecha de nacimiento
        fecha_entrada: reserva.fecha_entrada || '', // Mostrar fecha de entrada
        fecha_salida: reserva.fecha_salida || '', // Mostrar fecha de salida
      }
      dialogoVisible.value = true
    }

    const abrirDialogoCancelar = (reserva) => {
      detallesReserva.value = reserva
      dialogoCancelarVisible.value = true
    }

    const abrirDialogoEntrada = (reserva) => {
      detallesReserva.value = reserva
      dialogoEntradaVisible.value = true
    }

    const abrirDialogoSalida = (reserva) => {
      detallesReserva.value = reserva
      dialogoSalidaVisible.value = true
    }

    const abrirDialogoPernoctacion = (reserva) => {
      detallesReserva.value = reserva
      dialogoPernoctacionVisible.value = true
    }

    const toggleReportes = () => {
      mostrarTodos.value = !mostrarTodos.value
    }

    const calcularEdad = (fechaNacimiento) => {
      if (!fechaNacimiento) return ''
      const hoy = new Date()
      const nacimiento = new Date(fechaNacimiento)
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const mes = hoy.getMonth() - nacimiento.getMonth()
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
      }
      return edad
    }

    const formatearFecha = (fecha) => {
      if (!fecha) return ''
      const date = new Date(fecha)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const calcularPrecio = (reserva) => {
      if (!reserva.fecha_entrada || !reserva.fecha_salida) return 'N/A'
      const fechaEntrada = new Date(reserva.fecha_entrada)
      const fechaSalida = new Date(reserva.fecha_salida)
      const diffTime = Math.abs(fechaSalida - fechaEntrada)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays * reserva.precio
    }

    const cancelarReserva = async (id) => {
      try {
        // Encuentra la reserva correspondiente
        const reserva = reservas.value.find((reserva) => reserva.id === id)
        if (!reserva) {
          console.error('Reserva no encontrada')
          return
        }

        // Actualiza el estado de la habitación asociada a la reserva
        const { error } = await supabase
          .from('habitaciones')
          .update({ estado: 'disponible' }) // Actualizar el estado de la habitación a "disponible"
          .eq('id', reserva.habitacion_id) // Usar el id de la habitación
        if (error) {
          console.error('Error cancelando reserva:', error)
        } else {
          reserva.estado = 'cancelado' // Actualizar el estado de la reserva a "cancelado"
          dialogoCancelarVisible.value = false
        }
      } catch (error) {
        console.error('Error cancelando reserva:', error)
      }
    }

    const registrarEntrada = async (id) => {
      try {
        const fechaActual = new Date().toISOString() // Obtener la fecha actual en formato ISO
        const { error } = await supabase
          .from('reservas')
          .update({ fecha_entrada: fechaActual }) // Actualizar la fecha de entrada en la tabla reservas
          .eq('id', id)
        if (error) {
          console.error('Error registrando entrada:', error)
        } else {
          const reserva = reservas.value.find((reserva) => reserva.id === id)
          if (reserva) {
            reserva.fecha_entrada = fechaActual
            reserva.estado = 'ocupada'
          }
          await supabase
            .from('habitaciones')
            .update({ estado: 'ocupada' }) // Actualizar el estado de la habitación a "ocupada"
            .eq('id', reserva.habitacion_id)
          dialogoEntradaVisible.value = false
        }
      } catch (error) {
        console.error('Error registrando entrada:', error)
      }
    }

    const registrarSalida = async (id) => {
      try {
        const fechaActual = new Date().toISOString() // Obtener la fecha actual en formato ISO
        const { error } = await supabase
          .from('reservas')
          .update({ fecha_salida: fechaActual }) // Actualizar la fecha de salida en la tabla reservas
          .eq('id', id)
        if (error) {
          console.error('Error registrando salida:', error)
        } else {
          const reserva = reservas.value.find((reserva) => reserva.id === id)
          if (reserva) {
            reserva.fecha_salida = fechaActual
            reserva.estado = 'disponible' // Asegurarse de que el estado de la reserva se actualice a "disponible"
          }
          await supabase
            .from('habitaciones')
            .update({ estado: 'disponible' }) // Actualizar el estado de la habitación a "disponible"
            .eq('id', reserva.habitacion_id)
          dialogoSalidaVisible.value = false
          // Actualizar la interfaz de usuario para reflejar el cambio de estado
          await fetchReservas()
          // Llamar a la función para actualizar las habitaciones disponibles
          await actualizarHabitacionesDisponibles()
        }
      } catch (error) {
        console.error('Error registrando salida:', error)
      }
    }

    const marcarPernoctacion = async (reserva) => {
      try {
        // Actualizar la reserva actual a 'pernoctacion'
        const { error: updateError } = await supabase
          .from('reservas')
          .update({ tipo_r: 'pernoctacion' }) // Actualizar columna
          .eq('id', reserva.id)
        if (updateError) {
          console.error('Error actualizando la reserva:', updateError)
          return
        }

        // Crear una nueva reserva para el día siguiente
        const nuevaFechaReserva = new Date(reserva.fecha_reserva)
        nuevaFechaReserva.setDate(nuevaFechaReserva.getDate() + 1)
        const nuevaReserva = {
          cliente_id: reserva.cliente_id,
          habitacion_id: reserva.habitacion_id,
          fecha_reserva: nuevaFechaReserva.toISOString().split('T')[0],
          tipo_r: 'pernoctacion', // Actualizar columna
          fecha_entrada: reserva.fecha_entrada, // Copiar la fecha de entrada
        }
        const { error } = await supabase.from('reservas').insert([nuevaReserva]).select()
        if (error) {
          console.error('Error creando la nueva reserva:', error)
          return
        }

        // Actualizar la lista de reservas
        await fetchReservas()

        dialogoPernoctacionVisible.value = false
      } catch (error) {
        console.error('Error marcando pernoctación:', error)
      }
    }

    const actualizarEstados = async () => {
      const hoy = new Date().toISOString().substr(0, 10)
      for (const reserva of reservas.value) {
        if (reserva.fecha_reserva < hoy && !reserva.fecha_entrada) {
          await supabase
            .from('habitaciones')
            .update({ estado: 'disponible' })
            .eq('id', reserva.habitacion_id)
        }
      }
    }

    const toggleFilter = (colName) => {
      if (colName === 'nacionalidad') {
        filtroNacionalidadVisible.value = true
      } else if (colName === 'procedencia') {
        filtroProcedenciaVisible.value = true
      } else if (colName === 'fecha_reserva') {
        filtroFechaVisible.value = true
      } else if (colName === 'tipo_r') {
        filtroTipoReservaVisible.value = true
      }
    }

    const filtrarReservas = () => {
      reservasFiltradas.value = reservas.value.filter((reserva) => {
        return (
          (!filtroNacionalidad.value || reserva.nacionalidad === filtroNacionalidad.value) &&
          (!filtroProcedencia.value || reserva.procedencia === filtroProcedencia.value) &&
          (!filtroFecha.value || reserva.fecha_reserva === filtroFecha.value) &&
          (!filtroMes.value || reserva.fecha_reserva.substr(0, 7) === filtroMes.value) &&
          (!filtroTipoReserva.value || reserva.tipo_r === filtroTipoReserva.value)
        )
      })
    }

    const limpiarFiltros = () => {
      filtroNacionalidad.value = null
      filtroProcedencia.value = null
      filtroFecha.value = null
      filtroMes.value = null
      filtroTipoReserva.value = null
      search.value = ''
      selectedDate.value = new Date().toISOString().substr(0, 10)
    }

    onMounted(async () => {
      await fetchReservas()
      await actualizarEstados()
      await fetchNacionalidades()
      await fetchProcedencias()
    })

    return {
      reservas,
      loading,
      columns,
      reportColumns,
      search,
      selectedDate,
      filteredReservas,
      dialogoVisible,
      detallesReserva,
      mostrarDetalles,
      calcularEdad,
      formatearFecha,
      calcularPrecio,
      dialogoCancelarVisible,
      dialogoEntradaVisible,
      dialogoSalidaVisible,
      dialogoPernoctacionVisible,
      mostrarTodos,
      abrirDialogoCancelar,
      abrirDialogoEntrada,
      abrirDialogoSalida,
      abrirDialogoPernoctacion,
      cancelarReserva,
      registrarEntrada,
      registrarSalida,
      toggleReportes,
      filtroNacionalidad,
      filtroProcedencia,
      filtroFecha,
      filtroMes,
      filtroTipoReserva,
      nacionalidades,
      procedencias,
      reservasFiltradas,
      reservasAgrupadas,
      filtroNacionalidadVisible,
      filtroProcedenciaVisible,
      filtroFechaVisible,
      filtroTipoReservaVisible,
      toggleFilter,
      filtrarReservas,
      limpiarFiltros,
      totalPrecio,
      marcarPernoctacion,
    }
  },
}
</script>
