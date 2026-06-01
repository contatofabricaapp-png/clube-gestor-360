import { useEffect, useState } from 'react'

export function useNotificacaoPush() {
  const [permissao, setPermissao] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])

  async function solicitarPermissao() {
    if (typeof Notification === 'undefined') return 'denied'
    const resultado = await Notification.requestPermission()
    setPermissao(resultado)
    return resultado
  }

  function notificarLocal(titulo, corpo) {
    if (permissao === 'granted' && typeof Notification !== 'undefined') {
      new Notification(titulo, { body: corpo, icon: '/icon-192.png' })
    }
  }

  return { permissao, solicitarPermissao, notificarLocal }
}
