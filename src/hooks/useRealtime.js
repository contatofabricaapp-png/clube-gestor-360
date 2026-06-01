import { useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

// Assina mudanças em tempo real via Supabase Realtime.
// Em modo demo (supabase === null) é no-op — sem crash.
export function useRealtime(tabela, callback) {
  useEffect(() => {
    if (!supabase) return
    const canal = supabase
      .channel(`public:${tabela}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabela }, callback)
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [tabela])
}
