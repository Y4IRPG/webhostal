import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tacmygveowtsjlmyxxpb.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhY215Z3Zlb3d0c2psbXl4eHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzg4ODEsImV4cCI6MjA1Mzg1NDg4MX0.OjLxgeHpcBr2AgoEx_IFPdoqqLp-dpvlvTMqlCQ8Y0c' // Usa tu clave real
const supabase = createClient(supabaseUrl, supabaseKey)

supabase.auth.onAuthStateChange((event, session) => {
  console.log('Cambio de estado de autenticación:', event, session)
})

export { supabase }
