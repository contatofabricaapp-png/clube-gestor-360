import { DIAS_SEMANA } from './dados'

export const formatDate = (date) => date.toISOString().split('T')[0]
export const hoje = () => formatDate(new Date())

export const formatDateBR = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

export const formatarTempo = (segundos) => {
  if (segundos <= 0) return '00:00'
  const mins = Math.floor(segundos / 60)
  const secs = segundos % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export const gerarHorarios = () => {
  const h = []
  for (let i = 6; i < 22; i++) {
    h.push(`${String(i).padStart(2, '0')}:00`)
    h.push(`${String(i).padStart(2, '0')}:30`)
  }
  return h
}

export const getHoraAtualArredondada = () => {
  const now = new Date()
  let h = now.getHours()
  let m = now.getMinutes()
  if (m > 30)     { h += 1; m = 0  }
  else if (m > 0) {          m = 30 }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const getHoraAtualExata = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export const calcularHoraFim = (horaInicio, duracaoMin) => {
  const [h, m] = horaInicio.split(':').map(Number)
  const total = h * 60 + m + duracaoMin
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export const temConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  return toMin(h1Inicio) < toMin(h2Fim) && toMin(h1Fim) > toMin(h2Inicio)
}

export const formatDiasSemana = (dias) => {
  if (!dias?.length) return 'Nenhum dia'
  if (dias.length === 7) return 'Todos os dias'
  if (dias.length === 5 && [1,2,3,4,5].every(d => dias.includes(d))) return 'Segunda a Sexta'
  return dias.sort().map(d => DIAS_SEMANA.find(ds => ds.id === d)?.curto).join(', ')
}

// Estima quando o sócio na posição `posicao` será chamado da fila do módulo.
// duracaoMin = duração típica de uma partida no módulo (para calcular ciclos).
// Retorna string "~HH:MM", "agora" ou null.
export function calcularPrevisaoFila(moduloId, posicao, reservas, recursos, duracaoMin = 65) {
  const agora = Date.now()
  const hojeStr = new Date().toISOString().split('T')[0]

  const recursosModulo = recursos.filter(r => r.moduloId === moduloId)
  if (!recursosModulo.length) return null

  const disponibilidades = recursosModulo
    .map(recurso => {
      const r = reservas.find(res =>
        res.recursoId === recurso.id &&
        res.data === hojeStr &&
        ['Em Andamento', 'Pendente', 'Confirmada', 'Aguardando Pagamento'].includes(res.status)
      )
      if (!r) return agora
      if (r.status === 'Em Andamento' && r.iniciadaEm && r.duracaoSegundos) {
        return Math.max(agora, new Date(r.iniciadaEm).getTime() + r.duracaoSegundos * 1000)
      }
      if (r.horaFim) {
        const [h, m] = r.horaFim.split(':').map(Number)
        const d = new Date()
        return Math.max(agora, new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime())
      }
      return agora + 60 * 60 * 1000
    })
    .sort((a, b) => a - b)

  const n = disponibilidades.length
  const ciclo = Math.floor((posicao - 1) / n)
  const indice = (posicao - 1) % n
  const ts = disponibilidades[indice] + ciclo * duracaoMin * 60 * 1000

  if (ts <= agora + 60000) return 'agora'
  const d = new Date(ts)
  return `~${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const getStatusEmTempoReal = (recurso, aulas, reservas) => {
  if (['Manutencao', 'Interditada', 'Limpeza'].includes(recurso.status)) {
    return { status: recurso.status, motivo: recurso.motivo }
  }

  const horaAtual = getHoraAtualExata()
  const diaSemana = new Date().getDay()

  const aulaAgora = aulas.find(a =>
    a.recursoId === recurso.id &&
    a.status === 'ativo' &&
    a.diasSemana.includes(diaSemana) &&
    a.horaInicio <= horaAtual &&
    a.horaFim > horaAtual
  )
  if (aulaAgora) return { status: 'Reservada', motivo: `Aula: ${aulaAgora.nome} (${aulaAgora.professor})` }

  const reservaAgora = reservas.find(r =>
    r.recursoId === recurso.id &&
    ['Em Andamento', 'Confirmada'].includes(r.status) &&
    r.data === hoje() &&
    r.horaInicio <= horaAtual &&
    r.horaFim > horaAtual
  )
  if (reservaAgora) return { status: 'Ocupada', motivo: 'Em uso' }

  return { status: 'Livre', motivo: null }
}
