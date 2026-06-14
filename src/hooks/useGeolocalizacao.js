import { useState, useCallback } from 'react'

// Detecta se está rodando dentro do Capacitor (app nativo)
const isCapacitor = () =>
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()

// Fórmula de Haversine — distância entre dois pontos GPS em metros
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const rad = x => (x * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Obtém posição usando a API correta (Capacitor nativo ou browser)
async function obterPosicao() {
  if (isCapacitor()) {
    // No app nativo: usa o plugin @capacitor/geolocation
    // Importação dinâmica para não quebrar o build web
    const { Geolocation } = await import('@capacitor/geolocation')

    // Solicita permissão antes (necessário no Android 6+)
    const perm = await Geolocation.requestPermissions()
    if (perm.location !== 'granted') {
      throw new Error('Permissão de GPS negada. Ative a localização nas configurações do dispositivo.')
    }

    const pos = await Geolocation.getCurrentPosition({
      timeout: 10000,
      maximumAge: 30000,
      enableHighAccuracy: true,
    })
    return pos.coords
  } else {
    // No browser: usa a API nativa do navegador
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS não disponível neste dispositivo.'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => {
          const msg =
            err.code === 1 ? 'Permissão de GPS negada. Ative a localização nas configurações.' :
            err.code === 2 ? 'Não foi possível obter sua localização. Tente novamente.' :
                             'Tempo esgotado ao obter localização.'
          reject(new Error(msg))
        },
        { timeout: 10000, maximumAge: 30000, enableHighAccuracy: true }
      )
    })
  }
}

export function useGeolocalizacao() {
  const [estado, setEstado] = useState('ocioso') // ocioso | verificando | aprovado | reprovado | erro | desabilitado

  const verificar = useCallback(({ clubeLat, clubeLng, raioMetros, habilitado }) => {
    return new Promise(async (resolve, reject) => {
      // Geolocalização desabilitada pelo clube → libera direto
      if (!habilitado || clubeLat == null || clubeLng == null) {
        setEstado('desabilitado')
        resolve({ aprovado: true, motivo: null })
        return
      }

      setEstado('verificando')

      try {
        const coords = await obterPosicao()
        const distancia = calcularDistancia(
          coords.latitude,
          coords.longitude,
          clubeLat,
          clubeLng
        )

        if (distancia <= raioMetros) {
          setEstado('aprovado')
          resolve({ aprovado: true, distancia: Math.round(distancia) })
        } else {
          setEstado('reprovado')
          reject(new Error(
            `Você está a ${Math.round(distancia)}m do clube. Check-in permitido apenas dentro de ${raioMetros}m.`
          ))
        }
      } catch (err) {
        setEstado('erro')
        reject(err)
      }
    })
  }, [])

  return { estado, verificar }
}
