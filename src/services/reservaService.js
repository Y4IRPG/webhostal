import { ref } from 'vue'
import { supabase } from './supabase'

const reservas = ref([])

export const useReservaService = () => {
  const setReservas = (newReservas) => {
    reservas.value = newReservas
  }

  const getReservas = () => {
    return reservas.value
  }

  return {
    setReservas,
    getReservas,
  }
}

export const fetchReservas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, habitaciones (numero_habitacion, estado)')
  if (error) {
    throw error
  }
  return data
}

export const registrarSalida = async (reservaId) => {
  const { error } = await supabase
    .from('reservas')
    .update({ estado: 'finalizada' })
    .eq('id', reservaId)
  if (error) {
    throw error
  }
}
