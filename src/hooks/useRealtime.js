import { useEffect } from 'react'
import { pb } from '../lib/pocketbase.js'

// Assina mudanças em tempo real via PocketBase.
// Em modo demo (pb === null) é no-op — sem crash.
export function useRealtime(colecao, callback) {
  useEffect(() => {
    if (!pb) return
    pb.collection(colecao).subscribe('*', callback)
    return () => pb.collection(colecao).unsubscribe('*')
  }, [colecao])
}
