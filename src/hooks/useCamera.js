import { useCallback } from 'react'

const isCapacitor = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()

/**
 * Hook para capturar/selecionar imagem de comprovante.
 * - No app nativo (Capacitor): abre câmera ou galeria
 * - No browser: usa <input type="file"> convencional
 *
 * Retorna: { capturar } — função assíncrona que resolve com { dataUrl, mimeType }
 */
export function useCamera() {
  const capturar = useCallback(async (opcao = 'PROMPT') => {
    if (isCapacitor()) {
      const { Camera, CameraSource, CameraResultType } = await import('@capacitor/camera')

      const perm = await Camera.requestPermissions({ permissions: ['camera', 'photos'] })
      if (perm.camera !== 'granted' && perm.photos !== 'granted') {
        throw new Error('Permissão de câmera/galeria negada.')
      }

      const source =
        opcao === 'CAMERA'  ? CameraSource.Camera :
        opcao === 'GALLERY' ? CameraSource.Photos :
                              CameraSource.Prompt  // pergunta ao usuário

      const foto = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source,
      })

      return {
        dataUrl:  foto.dataUrl,
        mimeType: 'image/' + (foto.format ?? 'jpeg'),
      }
    } else {
      // Browser: retorna uma promise que resolve quando o usuário seleciona o arquivo
      return new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type    = 'file'
        input.accept  = 'image/*'
        input.capture = 'environment' // abre câmera em mobile browsers também

        input.onchange = () => {
          const file = input.files?.[0]
          if (!file) { reject(new Error('Nenhum arquivo selecionado.')); return }
          const reader = new FileReader()
          reader.onload  = e => resolve({ dataUrl: e.target.result, mimeType: file.type })
          reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
          reader.readAsDataURL(file)
        }
        input.oncancel = () => reject(new Error('Cancelado pelo usuário.'))
        input.click()
      })
    }
  }, [])

  return { capturar }
}
