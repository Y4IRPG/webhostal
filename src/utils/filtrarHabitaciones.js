import { supabase } from 'src/services/supabase'

export function filtrarHabitaciones(
  habitaciones,
  reservas,
  filtroTipoHabitacion,
  filtroPiso,
  fechaReserva,
) {
  console.log('Filtrando habitaciones...')
  console.log('Habitaciones originales:', habitaciones)
  console.log('Filtro Tipo de Habitación:', filtroTipoHabitacion)
  console.log('Filtro Piso:', filtroPiso)
  console.log('Fecha de Reserva:', fechaReserva)

  let habitacionesFiltradas = habitaciones

  if (filtroTipoHabitacion) {
    habitacionesFiltradas = habitacionesFiltradas.filter(
      (habitacion) => habitacion.tipo_habitacion_id === filtroTipoHabitacion.id,
    )
    console.log('Habitaciones después de filtrar por tipo:', habitacionesFiltradas)
  }

  if (filtroPiso) {
    habitacionesFiltradas = habitacionesFiltradas.filter(
      (habitacion) => habitacion.piso === filtroPiso,
    )
    console.log('Habitaciones después de filtrar por piso:', habitacionesFiltradas)
  }

  if (fechaReserva) {
    habitacionesFiltradas = habitacionesFiltradas.map((habitacion) => {
      const reserva = reservas.find(
        (reserva) =>
          reserva.habitacion_id === habitacion.id && reserva.fecha_reserva === fechaReserva,
      )
      if (reserva) {
        if (reserva.fecha_entrada && reserva.fecha_salida) {
          return { ...habitacion, estado: 'disponible' } // Cambiar a "disponible" si hay una reserva con fecha de entrada y salida
        }
        if (reserva.fecha_entrada && !reserva.fecha_salida) {
          return { ...habitacion, estado: 'ocupada' }
        }
        return { ...habitacion, estado: 'reservada' }
      }
      return { ...habitacion, estado: 'disponible' }
    })

    console.log('Habitaciones después de filtrar por fecha de reserva:', habitacionesFiltradas)
  }

  console.log('Habitaciones filtradas finales:', habitacionesFiltradas)
  return habitacionesFiltradas
}

export const actualizarHabitacionesDisponibles = async () => {
  try {
    const { error } = await supabase.from('habitaciones').select('*').eq('estado', 'disponible')
    if (error) {
      console.error('Error actualizando habitaciones disponibles:', error)
      return
    }
    // Actualizar el estado de las habitaciones disponibles en la aplicación
    // ...código para actualizar el estado de las habitaciones disponibles...
  } catch (error) {
    console.error('Error actualizando habitaciones disponibles:', error)
  }
}
