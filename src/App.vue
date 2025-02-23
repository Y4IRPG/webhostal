<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './services/supabase'

const router = useRouter()

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session && router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
})
</script>
