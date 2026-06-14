/**
 * Utilitários para torneios, ligas, barragens e rankings.
 */

export const FORMATO_LABELS = {
  eliminatorio:    'Eliminatório',
  liga:            'Liga',
  grupos_mata_mata:'Grupos + Mata-Mata',
  ranking:         'Ranking',
  barragem:        'Barragem',
}

export const STATUS_LABELS = {
  inscricoes:   'Inscrições abertas',
  em_andamento: 'Em andamento',
  finalizado:   'Finalizado',
}

export const QUEM_LANCA_LABELS = {
  admin:             'Só o Admin',
  admin_funcionario: 'Admin ou Funcionário',
  jogador:           'Os próprios jogadores',
  qualquer:          'Qualquer um',
}

export const FASES_LABEL = {
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semi:    'Semifinal',
  final:   'Final',
  liga:    'Liga',
  grupos:  'Fase de Grupos',
  ranking: 'Ranking',
}

/**
 * Calcula tabela de classificação (liga ou grupo round-robin).
 * @param {Array} partidas - partidas do torneio (ou do grupo)
 * @param {Array} inscricoes - inscrições do torneio (ou do grupo)
 * @param {Object} torneio - configurações de pontuação
 */
export function calcularTabela(partidas, inscricoes, torneio) {
  const pts_v = torneio.pontos_vitoria  ?? 3
  const pts_e = torneio.pontos_empate   ?? 1
  const pts_d = torneio.pontos_derrota  ?? 0

  const tabela = {}

  inscricoes.forEach(i => {
    tabela[i.usuarioId] = { usuarioId: i.usuarioId, j: 0, v: 0, e: 0, d: 0, pts: 0 }
  })

  partidas
    .filter(p => p.status === 'finalizada' && p.vencedorId !== null)
    .forEach(p => {
      const j1 = tabela[p.jogador1Id]
      const j2 = tabela[p.jogador2Id]
      if (!j1 || !j2) return

      j1.j++; j2.j++

      if (p.vencedorId === 0) {
        // empate
        j1.e++; j1.pts += pts_e
        j2.e++; j2.pts += pts_e
      } else if (p.vencedorId === p.jogador1Id) {
        j1.v++; j1.pts += pts_v
        j2.d++; j2.pts += pts_d
      } else {
        j2.v++; j2.pts += pts_v
        j1.d++; j1.pts += pts_d
      }
    })

  return Object.values(tabela).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.v   !== a.v)   return b.v   - a.v
    return b.j - a.j
  })
}

/**
 * Calcula ranking contínuo com pontos acumulados.
 */
export function calcularRanking(partidas, inscricoes, torneio) {
  const pts_v = torneio.pontos_vitoria  ?? 10
  const pts_e = torneio.pontos_empate   ?? 4
  const pts_d = torneio.pontos_derrota  ?? 1

  const ranking = {}
  inscricoes.forEach(i => {
    ranking[i.usuarioId] = { usuarioId: i.usuarioId, j: 0, v: 0, pts: 0 }
  })

  partidas
    .filter(p => p.status === 'finalizada')
    .sort((a, b) => a.data?.localeCompare(b.data ?? '') ?? 0)
    .forEach(p => {
      if (!ranking[p.jogador1Id]) ranking[p.jogador1Id] = { usuarioId: p.jogador1Id, j: 0, v: 0, pts: 0 }
      if (!ranking[p.jogador2Id]) ranking[p.jogador2Id] = { usuarioId: p.jogador2Id, j: 0, v: 0, pts: 0 }

      const j1 = ranking[p.jogador1Id]
      const j2 = ranking[p.jogador2Id]

      j1.j++; j2.j++

      if (p.vencedorId === 0) {
        j1.pts += pts_e; j2.pts += pts_e
      } else if (p.vencedorId === p.jogador1Id) {
        j1.v++; j1.pts += pts_v; j2.pts += pts_d
      } else if (p.vencedorId === p.jogador2Id) {
        j2.v++; j2.pts += pts_v; j1.pts += pts_d
      }
    })

  return Object.values(ranking).sort((a, b) => b.pts - a.pts || b.v - a.v)
}

/**
 * Gera chaveamento eliminatório a partir de lista de usuáriosIds ordenada por seed.
 * Retorna array de partidas prontas para inserir no store.
 */
export function gerarChaveamentoEliminatorio(torneioId, usuarioIds) {
  const n = usuarioIds.length
  // Próxima potência de 2
  const bracket = Math.pow(2, Math.ceil(Math.log2(n)))
  const fase = bracket === 2 ? 'final' : bracket === 4 ? 'semi' : bracket === 8 ? 'quartas' : 'oitavas'

  const partidas = []
  // Seed mais alto vs mais baixo (1 vs 8, 2 vs 7, ...)
  const seeds = [...usuarioIds]
  while (seeds.length < bracket) seeds.push(null) // byes

  for (let i = 0; i < bracket / 2; i++) {
    const j1 = seeds[i]
    const j2 = seeds[bracket - 1 - i]
    partidas.push({
      torneioId,
      grupoId: null,
      fase,
      rodada: 1,
      jogador1Id: j1,
      jogador2Id: j2,
      placar1: null,
      placar2: null,
      vencedorId: j2 === null ? j1 : null, // bye automático
      status: j2 === null ? 'finalizada' : 'aguardando',
      data: null,
      horario: null,
    })
  }
  return partidas
}

/**
 * Gera partidas round-robin para um conjunto de jogadores.
 * Cada jogador joga contra todos os outros 1 vez.
 */
export function gerarRoundRobin(torneioId, grupoId, usuarioIds, fase = 'liga') {
  const partidas = []
  let rodada = 1
  for (let i = 0; i < usuarioIds.length; i++) {
    for (let j = i + 1; j < usuarioIds.length; j++) {
      partidas.push({
        torneioId,
        grupoId,
        fase,
        rodada,
        jogador1Id: usuarioIds[i],
        jogador2Id: usuarioIds[j],
        placar1: null,
        placar2: null,
        vencedorId: null,
        status: 'aguardando',
        data: null,
        horario: null,
      })
      rodada++
    }
  }
  return partidas
}

/**
 * Verifica se o usuário pode lançar resultado neste torneio.
 */
export function podeLinçarResultado(torneio, user, jogador1Id, jogador2Id) {
  if (!user || !torneio) return false
  const perfil = user.perfil
  const qlr = torneio.quem_lanca_resultado ?? 'admin'

  if (qlr === 'admin')             return perfil === 'admin'
  if (qlr === 'admin_funcionario') return ['admin', 'funcionario'].includes(perfil)
  if (qlr === 'jogador')           return [jogador1Id, jogador2Id].includes(user.id)
  if (qlr === 'qualquer')          return true
  return false
}
