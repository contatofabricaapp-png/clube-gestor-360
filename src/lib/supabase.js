import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Retorna null enquanto as credenciais não estiverem configuradas.
// Todo o código que usa supabase deve verificar `if (supabase)` antes de chamar.
export const supabase = url && key && !url.includes('xxxx')
  ? createClient(url, key)
  : null
