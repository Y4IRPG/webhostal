<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Gestión de Habitaciones</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn label="Agregar Habitación" color="primary" @click="abrirDialogoAgregar" />
        <q-input
          v-model="search"
          placeholder="Buscar"
          dense
          outlined
          class="q-ml-md"
          debounce="300"
        >
          <template v-slot:append>
            <q-icon name="las la-search" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="filteredHabitaciones"
          :columns="columns"
          row-key="id"
          dense
          :loading="loading"
          loading-label="Cargando habitaciones..."
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn icon="las la-edit" dense flat @click="abrirDialogoEditar(props.row)" />
              <q-btn
                icon="las la-ban"
                dense
                flat
                color="warning"
                v-if="props.row.estado !== 'inhabilitada'"
                @click="inhabilitarHabitacion(props.row)"
              />
              <q-btn
                icon="las la-check"
                dense
                flat
                color="positive"
                v-if="props.row.estado === 'inhabilitada'"
                @click="rehabilitarHabitacion(props.row)"
              />
              <q-btn
                icon="las la-trash"
                dense
                flat
                color="negative"
                @click="abrirDialogoBorrar(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogoAgregarVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Agregar Habitación</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="agregarHabitacion">
            <q-input
              v-model="nuevaHabitacion.numero_habitacion"
              label="Número de Habitación"
              outlined
              dense
            />
            <q-select
              v-model="nuevaHabitacion.piso"
              label="Piso"
              :options="[1, 2, 3]"
              outlined
              dense
            />
            <q-select
              v-model="nuevaHabitacion.tipo_habitacion_id"
              label="Tipo de Habitación"
              :options="tiposHabitacion"
              option-label="tipo"
              option-value="id"
              outlined
              dense
              @update:model-value="actualizarPrecio"
            />
            <q-input
              v-model="nuevaHabitacion.precio"
              label="Precio"
              outlined
              dense
              prepend-icon="las la-money-bill-wave"
              readonly
            />
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="primary" v-close-popup />
              <q-btn flat label="Agregar" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoEditarVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Editar Habitación</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="editarHabitacion">
            <q-input
              v-model="habitacionSeleccionada.numero_habitacion"
              label="Número de Habitación"
              outlined
              dense
            />
            <q-select
              v-model="habitacionSeleccionada.piso"
              label="Piso"
              :options="[1, 2, 3]"
              outlined
              dense
            />
            <q-select
              v-model="habitacionSeleccionada.tipo_habitacion_id"
              label="Tipo de Habitación"
              :options="tiposHabitacion"
              option-label="tipo"
              option-value="id"
              outlined
              dense
              @update:model-value="actualizarPrecioEditar"
            />
            <q-input
              v-model="habitacionSeleccionada.precio"
              label="Precio"
              outlined
              dense
              prepend-icon="las la-money-bill-wave"
              readonly
            />
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="primary" v-close-popup />
              <q-btn flat label="Guardar" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoBorrarVisible">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Borrado</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div>¿Estás seguro de que deseas borrar esta habitación?</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Borrar"
            color="negative"
            @click="borrarHabitacion(habitacionSeleccionada.id)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'src/services/supabase'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()
    const habitaciones = ref([])
    const tiposHabitacion = ref([])
    const loading = ref(true)
    const dialogoAgregarVisible = ref(false)
    const dialogoEditarVisible = ref(false)
    const dialogoBorrarVisible = ref(false)
    const habitacionSeleccionada = ref(null)
    const nuevaHabitacion = ref({
      numero_habitacion: '',
      piso: '',
      tipo_habitacion_id: '',
      precio: '',
    })
    const search = ref('')

    const columns = [
      {
        name: 'numero_habitacion',
        label: 'Número de Habitación',
        field: 'numero_habitacion',
        align: 'left',
      },
      { name: 'piso', label: 'Piso', field: 'piso', align: 'left' },
      {
        name: 'tipo_habitacion',
        label: 'Tipo de Habitación',
        field: 'tipo_habitacion',
        align: 'left',
      },
      { name: 'precio', label: 'Precio', field: 'precio', align: 'left' },
      { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
    ]

    const fetchHabitaciones = async () => {
      loading.value = true
      const { data, error } = await supabase.from('habitaciones').select(`
        id,
        numero_habitacion,
        piso,
        tipo_habitacion_id,
        estado,
        tipos_habitacion:tipo_habitacion_id (tipo, precio)
      `)

      if (error) {
        console.error('Error cargando habitaciones:', error)
      } else {
        habitaciones.value = data
          .map((habitacion) => ({
            id: habitacion.id,
            numero_habitacion: habitacion.numero_habitacion,
            piso: habitacion.piso,
            tipo_habitacion: habitacion.tipos_habitacion.tipo,
            tipo_habitacion_id: habitacion.tipo_habitacion_id,
            precio: habitacion.tipos_habitacion.precio,
            estado: habitacion.estado,
          }))
          .sort((a, b) => a.numero_habitacion - b.numero_habitacion)
      }
      loading.value = false
    }

    const fetchTiposHabitacion = async () => {
      const { data, error } = await supabase.from('tipos_habitacion').select('*')

      if (error) {
        console.error('Error cargando tipos de habitación:', error)
        return
      }

      tiposHabitacion.value = data
    }

    const abrirDialogoAgregar = () => {
      nuevaHabitacion.value = {
        numero_habitacion: '',
        piso: '',
        tipo_habitacion_id: '',
        precio: '',
      }
      dialogoAgregarVisible.value = true
    }

    const abrirDialogoEditar = (habitacion) => {
      habitacionSeleccionada.value = {
        ...habitacion,
        tipo_habitacion_id: habitacion.tipo_habitacion_id, // Asegurarse de que el tipo de habitación sea el ID
      }
      actualizarPrecioEditar(habitacion.tipo_habitacion_id) // Actualizar el precio al abrir el diálogo
      dialogoEditarVisible.value = true
    }

    const abrirDialogoBorrar = (habitacion) => {
      habitacionSeleccionada.value = habitacion
      dialogoBorrarVisible.value = true
    }

    const agregarHabitacion = async () => {
      try {
        const habitacionData = {
          numero_habitacion: nuevaHabitacion.value.numero_habitacion,
          piso: nuevaHabitacion.value.piso,
          tipo_habitacion_id:
            nuevaHabitacion.value.tipo_habitacion_id.id || nuevaHabitacion.value.tipo_habitacion_id, // Asegurarse de enviar solo el ID
        }

        console.log('Datos de la nueva habitación:', habitacionData)

        const { error } = await supabase.from('habitaciones').insert([habitacionData]).single()

        if (error) {
          if (error.code === '23505') {
            $q.notify({
              type: 'negative',
              message: 'La habitación ya existe',
              icon: 'las la-times-circle',
            })
          } else {
            console.error('Error agregando habitación:', error)
            $q.notify({
              type: 'negative',
              message: 'Error al agregar habitación',
              icon: 'las la-times-circle',
            })
          }
          return
        }

        $q.notify({
          type: 'positive',
          message: 'Habitación agregada exitosamente',
          icon: 'las la-check-circle',
        })

        dialogoAgregarVisible.value = false
        await fetchHabitaciones()
      } catch (error) {
        console.error('Error agregando habitación:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al agregar habitación',
          icon: 'las la-times-circle',
        })
      }
    }

    const editarHabitacion = async () => {
      try {
        const habitacionData = {
          numero_habitacion: habitacionSeleccionada.value.numero_habitacion,
          piso: habitacionSeleccionada.value.piso,
          tipo_habitacion_id:
            habitacionSeleccionada.value.tipo_habitacion_id.id ||
            habitacionSeleccionada.value.tipo_habitacion_id, // Asegurarse de enviar solo el ID
        }

        console.log('Datos de la habitación editada:', habitacionData)

        const { error: habitacionError } = await supabase
          .from('habitaciones')
          .update(habitacionData)
          .eq('id', habitacionSeleccionada.value.id)

        if (habitacionError) {
          console.error('Error editando habitación:', habitacionError)
          $q.notify({
            type: 'negative',
            message: 'Error al editar habitación',
            icon: 'las la-times-circle',
          })
          return
        }

        $q.notify({
          type: 'positive',
          message: 'Habitación editada exitosamente',
          icon: 'las la-check-circle',
        })

        dialogoEditarVisible.value = false
        await fetchHabitaciones()
      } catch (error) {
        console.error('Error editando habitación:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al editar habitación',
          icon: 'las la-times-circle',
        })
      }
    }

    const borrarHabitacion = async (id) => {
      try {
        const { error } = await supabase.from('habitaciones').delete().eq('id', id)

        if (error) {
          console.error('Error borrando habitación:', error)
          $q.notify({
            type: 'negative',
            message: 'Error al borrar habitación',
            icon: 'las la-times-circle',
          })
          return
        }

        $q.notify({
          type: 'positive',
          message: 'Habitación borrada exitosamente',
          icon: 'las la-check-circle',
        })

        dialogoBorrarVisible.value = false
        await fetchHabitaciones()
      } catch (error) {
        console.error('Error borrando habitación:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al borrar habitación',
          icon: 'las la-times-circle',
        })
      }
    }

    const inhabilitarHabitacion = async (habitacion) => {
      try {
        const { error } = await supabase
          .from('habitaciones')
          .update({ estado: 'inhabilitada' })
          .eq('id', habitacion.id)

        if (error) {
          console.error('Error inhabilitando habitación:', error)
          $q.notify({
            type: 'negative',
            message: 'Error al inhabilitar habitación',
            icon: 'las la-times-circle',
          })
          return
        }

        $q.notify({
          type: 'positive',
          message: 'Habitación inhabilitada exitosamente',
          icon: 'las la-check-circle',
        })

        await fetchHabitaciones()
      } catch (error) {
        console.error('Error inhabilitando habitación:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al inhabilitar habitación',
          icon: 'las la-times-circle',
        })
      }
    }

    const rehabilitarHabitacion = async (habitacion) => {
      try {
        const { error } = await supabase
          .from('habitaciones')
          .update({ estado: 'disponible' })
          .eq('id', habitacion.id)

        if (error) {
          console.error('Error rehabilitando habitación:', error)
          $q.notify({
            type: 'negative',
            message: 'Error al rehabilitar habitación',
            icon: 'las la-times-circle',
          })
          return
        }

        $q.notify({
          type: 'positive',
          message: 'Habitación rehabilitada exitosamente',
          icon: 'las la-check-circle',
        })

        await fetchHabitaciones()
      } catch (error) {
        console.error('Error rehabilitando habitación:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al rehabilitar habitación',
          icon: 'las la-times-circle',
        })
      }
    }

    const actualizarPrecio = (tipoHabitacionId) => {
      const tipoHabitacion = tiposHabitacion.value.find((tipo) => tipo.id === tipoHabitacionId)
      if (tipoHabitacion) {
        nuevaHabitacion.value.precio = tipoHabitacion.precio
      }
    }

    const actualizarPrecioEditar = (tipoHabitacionId) => {
      const tipoHabitacion = tiposHabitacion.value.find((tipo) => tipo.id === tipoHabitacionId)
      if (tipoHabitacion) {
        habitacionSeleccionada.value.precio = tipoHabitacion.precio
      }
    }

    const filteredHabitaciones = computed(() => {
      if (!search.value) {
        return habitaciones.value
      }
      return habitaciones.value.filter((habitacion) =>
        Object.values(habitacion).some((value) =>
          String(value).toLowerCase().includes(search.value.toLowerCase()),
        ),
      )
    })

    onMounted(async () => {
      await fetchHabitaciones()
      await fetchTiposHabitacion()
    })

    return {
      habitaciones,
      tiposHabitacion,
      loading,
      columns,
      dialogoAgregarVisible,
      dialogoEditarVisible,
      dialogoBorrarVisible,
      habitacionSeleccionada,
      nuevaHabitacion,
      search,
      filteredHabitaciones,
      abrirDialogoAgregar,
      abrirDialogoEditar,
      abrirDialogoBorrar,
      agregarHabitacion,
      editarHabitacion,
      borrarHabitacion,
      inhabilitarHabitacion,
      rehabilitarHabitacion,
      actualizarPrecio,
      actualizarPrecioEditar,
    }
  },
}
</script>

<style scoped>
.q-card {
  max-width: 800px;
  margin: auto;
}
</style>
