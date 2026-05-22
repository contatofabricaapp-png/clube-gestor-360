import { useState, useCallback } from 'react'

// Fórmula de Haversine — distância entre dois pontos GPS em metros
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000 // raio da Terra em metros
  const rad = x => (x * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useGeolocalizacao() {
  const [estado, setEstado] = useState('ocioso') // ocioso | verificando | aprovado | reprovado | erro | desabilitado

  const verificar = useCallback(({ clubeLat, clubeLng, raioMetros, habilitado }) => {
    return new Promise((resolve, reject) => {
      // Geolocalização desabilitada pelo clube → libera direto
      if (!habilitado || clubeLat == null || clubeLng == null) {
        setEstado('desabilitado')
        resolve({ aprovado: true, motivo: null })
        return
      }

      if (!navigator.geolocation) {
        setEstado('erro')
        reject(new Error('GPS não disponível neste dispositivo.'))
        return
      }

      setEstado('verificando')

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const distancia = calcularDistancia(
            pos.coords.latitude,
            pos.coords.longitude,
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
        },
        (err) => {
          setEstado('erro')
          const msg =
            err.code === 1 ? 'Permissão de GPS negada. Ative a localização nas configurações.' :
            err.code === 2 ? 'Não foi possível obter sua localização. Tente novamente.' :
            'Tempo esgotado ao obter localização.'
          reject(new Error(msg))
        },
        { timeout: 10000, maximumAge: 30000, enableHighAccuracy: true }
      )
    })
  }, [])

  return { estado, verificar }
}
