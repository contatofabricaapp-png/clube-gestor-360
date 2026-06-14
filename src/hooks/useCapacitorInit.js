import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const isCapacitor = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()

/**
 * Hook de inicialização do Capacitor.
 * Deve ser usado UMA VEZ no App.jsx.
 *
 * Responsabilidades:
 * - Esconde a SplashScreen após o app carregar
 * - Define a cor da StatusBar (barra de status do Android)
 * - Intercepta o botão "Voltar" do Android para navegar no React Router
 *   (em vez de fechar o app abruptamente)
 */
export function useCapacitorInit() {
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    if (!isCapacitor()) return

    let cleanupFns = []

    async function init() {
      try {
        // 1. Esconde a splash screen
        const { SplashScreen } = await import('@capacitor/splash-screen')
        await SplashScreen.hide()

        // 2. Configura StatusBar
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#028090' })

        // 3. Botão Voltar do Android
        const { App } = await import('@capacitor/app')
        const handler = await App.addListener('backButton', ({ canGoBack }) => {
          // Se pode voltar no histórico do React Router → volta
          if (window.history.length > 1) {
            navigate(-1)
          } else {
            // Última tela: minimiza o app (não fecha)
            App.minimizeApp()
          }
        })
        cleanupFns.push(() => handler.remove())

      } catch (err) {
        console.warn('[Capacitor] Erro na inicialização:', err)
      }
    }

    init()
    return () => cleanupFns.forEach(fn => fn())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Rola para o topo a cada mudança de rota (comportamento esperado em mobile)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])
}
