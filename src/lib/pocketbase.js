import PocketBase from 'pocketbase'

const url = import.meta.env.VITE_POCKETBASE_URL

// Retorna null enquanto a URL não estiver configurada.
// Todo o código que usa pb deve verificar `if (pb)` antes de chamar.
export const pb = url && !url.includes('xxxx')
  ? new PocketBase(url)
  : null
