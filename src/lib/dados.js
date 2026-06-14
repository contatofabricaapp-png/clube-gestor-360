// Dados iniciais — serão substituídos por Supabase na Fase 2

export const STATUS_RECURSOS = {
  Livre:       { cor: 'emerald', icone: '🟢', label: 'Livre',       descricao: 'Disponível para uso'   },
  Ocupada:     { cor: 'blue',    icone: '🔵', label: 'Ocupada',     descricao: 'Em uso no momento'     },
  Manutencao:  { cor: 'amber',   icone: '🟡', label: 'Manutenção',  descricao: 'Reparo programado'     },
  Reservada:   { cor: 'purple',  icone: '🟣', label: 'Reservada',   descricao: 'Evento/Torneio/Aula'   },
  Interditada: { cor: 'red',     icone: '🔴', label: 'Interditada', descricao: 'Imprópria para uso'    },
  Limpeza:     { cor: 'slate',   icone: '⚪', label: 'Limpeza',     descricao: 'Em limpeza'            },
}

export const TEMPO_AQUECIMENTO = 5
export const TEMPO_EXTENSAO = 60

export const DIAS_SEMANA = [
  { id: 0, nome: 'Domingo',  curto: 'Dom' },
  { id: 1, nome: 'Segunda',  curto: 'Seg' },
  { id: 2, nome: 'Terça',    curto: 'Ter' },
  { id: 3, nome: 'Quarta',   curto: 'Qua' },
  { id: 4, nome: 'Quinta',   curto: 'Qui' },
  { id: 5, nome: 'Sexta',    curto: 'Sex' },
  { id: 6, nome: 'Sábado',   curto: 'Sáb' },
]

export const initialConfig = {
  nome_clube: 'Clube Esportivo Horizonte',
  pix_chave: 'contato@clubehorizonte.com.br',
  pix_tipo: 'Email',
  punicao_noshow_limite: 3,
  punicao_dias_bloqueio: 7,
  checkin_geolocalizacao: true,   // exige GPS no check-in
  raio_checkin_metros: 50,         // raio máximo para check-in (metros)
  clube_lat: null,                 // latitude do clube (definir no admin)
  clube_lng: null,                 // longitude do clube (definir no admin)
}

export const initialModulos = [
  { id: 1, nome: 'Tênis',          icone: '🎾', ativo: true,  gratuito: true,  valor: 0,   duracao: 60,      antecedencia_maxima: 48,  janela_cancelamento: 2,  fila_habilitada: true,  tipo_fila: 'checkin',     antecedencia_fila: 30 },
  { id: 6, nome: 'Beach Tennis',   icone: '🏖️', ativo: true,  gratuito: true,  valor: 0,   duracao: 60,      antecedencia_maxima: 48,  janela_cancelamento: 2,  fila_habilitada: true,  tipo_fila: 'checkin',     antecedencia_fila: 30 },
  { id: 2, nome: 'Futebol',        icone: '⚽', ativo: true,  gratuito: true,  valor: 0,   duracao: 90,      antecedencia_maxima: 72,  janela_cancelamento: 4,  fila_habilitada: true,  tipo_fila: 'agendamento', antecedencia_fila: 60 },
  { id: 3, nome: 'Quiosque',       icone: '🏠', ativo: true,  gratuito: false, valor: 350, duracao: 'Diária', antecedencia_maxima: 720, janela_cancelamento: 48, fila_habilitada: false, tipo_fila: 'checkin',     antecedencia_fila: 0  },
  { id: 4, nome: 'Salão de Festas',icone: '🎉', ativo: true,  gratuito: false, valor: 800, duracao: 'Diária', antecedencia_maxima: 720, janela_cancelamento: 72, fila_habilitada: false, tipo_fila: 'checkin',     antecedencia_fila: 0  },
  { id: 5, nome: 'Piscina',        icone: '🏊', ativo: false, gratuito: true,  valor: 0,   duracao: 120,     antecedencia_maxima: 24,  janela_cancelamento: 1,  fila_habilitada: false, tipo_fila: 'checkin',     antecedencia_fila: 15 },
]

export const initialRecursos = [
  // Tênis
  { id: 1,  moduloId: 1, nome: 'Quadra de Tênis 01', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 2,  moduloId: 1, nome: 'Quadra de Tênis 02', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 3,  moduloId: 1, nome: 'Quadra de Tênis 03', capacidade: 4,   status: 'Manutencao',  motivo: 'Troca de rede prevista para sexta' },
  { id: 4,  moduloId: 1, nome: 'Quadra de Tênis 04', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 5,  moduloId: 1, nome: 'Quadra de Tênis 05', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 6,  moduloId: 1, nome: 'Quadra de Tênis 06', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 7,  moduloId: 1, nome: 'Quadra de Tênis 07', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 8,  moduloId: 1, nome: 'Quadra de Tênis 08', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 9,  moduloId: 1, nome: 'Quadra de Tênis 09', capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 10, moduloId: 1, nome: 'Quadra de Tênis 10', capacidade: 4,   status: 'Livre',       motivo: null },
  // Beach Tennis
  { id: 11, moduloId: 6, nome: 'Quadra Beach 01',    capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 12, moduloId: 6, nome: 'Quadra Beach 02',    capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 13, moduloId: 6, nome: 'Quadra Beach 03',    capacidade: 4,   status: 'Livre',       motivo: null },
  { id: 14, moduloId: 6, nome: 'Quadra Beach 04',    capacidade: 4,   status: 'Livre',       motivo: null },
  // Futebol
  { id: 15, moduloId: 2, nome: 'Campo Society 01',   capacidade: 14,  status: 'Livre',       motivo: null },
  { id: 16, moduloId: 2, nome: 'Campo Society 02',   capacidade: 14,  status: 'Interditada', motivo: 'Gramado molhado - chuva forte' },
  // Quiosques
  { id: 17, moduloId: 3, nome: 'Quiosque 01',        capacidade: 30,  status: 'Livre',       motivo: null },
  { id: 18, moduloId: 3, nome: 'Quiosque 02',        capacidade: 25,  status: 'Livre',       motivo: null },
  // Salão
  { id: 19, moduloId: 4, nome: 'Salão Principal',    capacidade: 150, status: 'Livre',       motivo: null },
]

export const initialAulas = [
  { id: 1, recursoId: 1,  diasSemana: [1, 3], horaInicio: '18:00', horaFim: '20:00', professor: 'Daniel', nome: 'Treino Performance', status: 'ativo' },
  { id: 2, recursoId: 2,  diasSemana: [2, 4], horaInicio: '09:00', horaFim: '11:00', professor: 'Moacyr', nome: 'Aula Iniciante',     status: 'ativo' },
  { id: 3, recursoId: 11, diasSemana: [5],    horaInicio: '17:00', horaFim: '19:00', professor: 'Xitão',  nome: 'Beach Pro',          status: 'ativo' },
]

export const initialUsuarios = [
  { id: 1, nome: 'Admin Master',    matricula: 'ADM001',  senha: '1234', perfil: 'admin',       status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 2, nome: 'João Recepção',   matricula: 'FUNC001', senha: '1234', perfil: 'funcionario', status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 3, nome: 'Maria Silva',     matricula: 'SOC001',  senha: '1234', perfil: 'socio',       status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 4, nome: 'Carlos Santos',   matricula: 'SOC002',  senha: '1234', perfil: 'socio',       status: 'Bloqueado', noshow_count: 2, bloqueado_ate: '2025-12-31' },
  { id: 5, nome: 'Ana Oliveira',    matricula: 'SOC003',  senha: '1234', perfil: 'socio',       status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 6, nome: 'Pedro Costa',     matricula: 'SOC004',  senha: '1234', perfil: 'socio',       status: 'Ativo',     noshow_count: 1, bloqueado_ate: null         },
  { id: 7, nome: 'Lucia Ferreira',  matricula: 'SOC005',  senha: '1234', perfil: 'socio',       status: 'Cancelado', noshow_count: 0, bloqueado_ate: null         },
  { id: 8,  nome: 'Roberto Lima',      matricula: 'SOC006',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 9,  nome: 'Fernanda Rocha',    matricula: 'SOC007',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 10, nome: 'Marcos Almeida',    matricula: 'SOC008',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 11, nome: 'Juliana Mendes',    matricula: 'SOC009',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 12, nome: 'Rafael Souza',      matricula: 'SOC010',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 13, nome: 'Patrícia Nunes',    matricula: 'SOC011',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 14, nome: 'Bruno Carvalho',    matricula: 'SOC012',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 15, nome: 'Camila Ribeiro',    matricula: 'SOC013',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 16, nome: 'Diego Martins',     matricula: 'SOC014',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 17, nome: 'Larissa Gomes',     matricula: 'SOC015',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 18, nome: 'Thiago Barbosa',    matricula: 'SOC016',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 19, nome: 'Aline Castro',      matricula: 'SOC017',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 20, nome: 'Felipe Dias',       matricula: 'SOC018',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 21, nome: 'Renata Pinto',      matricula: 'SOC019',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 22, nome: 'Gustavo Melo',      matricula: 'SOC020',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 23, nome: 'Vanessa Teixeira',  matricula: 'SOC021',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 24, nome: 'Leonardo Freitas',  matricula: 'SOC022',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 25, nome: 'Isabela Correia',   matricula: 'SOC023',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 26, nome: 'Rodrigo Nascimento',matricula: 'SOC024',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 27, nome: 'Tatiane Moreira',   matricula: 'SOC025',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 28, nome: 'Vinícius Lopes',    matricula: 'SOC026',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 29, nome: 'Priscila Azevedo',  matricula: 'SOC027',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 30, nome: 'Anderson Rocha',    matricula: 'SOC028',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 31, nome: 'Sabrina Faria',     matricula: 'SOC029',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 32, nome: 'Henrique Cunha',    matricula: 'SOC030',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 33, nome: 'Mônica Cardoso',    matricula: 'SOC031',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
  { id: 34, nome: 'Alexandre Batista', matricula: 'SOC032',  senha: '1234', perfil: 'socio', status: 'Ativo', noshow_count: 0, bloqueado_ate: null },
]

// ── Helpers de data/hora para dados demo ──────────────────────────────────────
const _hoje = () => new Date().toISOString().split('T')[0]
const _hora = (offsetMin = 0) => {
  const d = new Date(Date.now() + offsetMin * 60000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
const _iso = (offsetMin = 0) => new Date(Date.now() + offsetMin * 60000).toISOString()

// Quadras ocupadas no momento (para demo da Lousa)
export const initialReservas = [
  // Quadra 01 — Em Andamento há 12 min, 65 min de duração total
  {
    id: 201, usuarioId: 5, recursoId: 1, moduloId: 1,
    data: _hoje(), horaInicio: _hora(-12), horaFim: _hora(53),
    tipo: 'checkin', status: 'Em Andamento',
    criadaEm: _iso(-15), comprovantePix: null,
    iniciadaEm: _iso(-12), duracaoSegundos: 65 * 60,
  },
  // Quadra 02 — Em Andamento há 35 min, últimos minutos
  {
    id: 202, usuarioId: 6, recursoId: 2, moduloId: 1,
    data: _hoje(), horaInicio: _hora(-35), horaFim: _hora(30),
    tipo: 'checkin', status: 'Em Andamento',
    criadaEm: _iso(-38), comprovantePix: null,
    iniciadaEm: _iso(-35), duracaoSegundos: 65 * 60,
  },
  // Quadra 05 — Pendente, aguardando START
  {
    id: 203, usuarioId: 8, recursoId: 5, moduloId: 1,
    data: _hoje(), horaInicio: _hora(0), horaFim: _hora(65),
    tipo: 'checkin', status: 'Pendente',
    criadaEm: _iso(-3), comprovantePix: null,
  },
]

// Fila de espera inicial (para demo da Lousa) — 25 no Tênis
const _filaIds  = [3,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]
export const initialFilas = _filaIds.map((uid, i) => ({
  id: 100 + i + 1,
  usuarioId: uid,
  moduloId: 1,
  recursoId: null,
  data: _hoje(),
  entradaEm: _iso(-(25 - i) * 2),
  status: 'Aguardando',
}))

// ── Torneios / Ligas / Ranking ────────────────────────────────────────────────

// quem_lanca_resultado: 'admin' | 'admin_funcionario' | 'jogador' | 'qualquer'
export const initialTorneios = [
  {
    id: 1,
    nome: 'Torneio de Verão 2025',
    moduloId: 1,
    formato: 'eliminatorio',
    status: 'em_andamento',
    dataInicio: '2025-01-10',
    dataFim: '2025-02-28',
    descricao: 'Torneio eliminatório simples de tênis. Melhor de 3 sets.',
    maxInscritos: 8,
    inscricoes_abertas: false,
    quem_lanca_resultado: 'admin_funcionario',
    pontos_vitoria: 3,
    pontos_empate: 1,
    pontos_derrota: 0,
    jogadores_por_grupo: 4,
    promovidos_por_grupo: 2,
    rebaixados_por_grupo: 1,
  },
  {
    id: 2,
    nome: 'Liga de Tênis 1º Semestre',
    moduloId: 1,
    formato: 'liga',
    status: 'em_andamento',
    dataInicio: '2025-01-01',
    dataFim: '2025-06-30',
    descricao: 'Todos jogam contra todos. Pontuação: vitória 3pts, empate 1pt.',
    maxInscritos: 12,
    inscricoes_abertas: false,
    quem_lanca_resultado: 'admin_funcionario',
    pontos_vitoria: 3,
    pontos_empate: 1,
    pontos_derrota: 0,
    jogadores_por_grupo: 4,
    promovidos_por_grupo: 2,
    rebaixados_por_grupo: 1,
  },
  {
    id: 3,
    nome: 'Barragem Tênis — Divisão A',
    moduloId: 1,
    formato: 'barragem',
    status: 'inscricoes',
    dataInicio: '2025-07-01',
    dataFim: '2025-07-31',
    descricao: 'Barragem com 3 grupos de 4 jogadores. Os 2 primeiros sobem; o último cai.',
    maxInscritos: 12,
    inscricoes_abertas: true,
    quem_lanca_resultado: 'jogador',
    pontos_vitoria: 3,
    pontos_empate: 1,
    pontos_derrota: 0,
    jogadores_por_grupo: 4,
    promovidos_por_grupo: 2,
    rebaixados_por_grupo: 1,
  },
  {
    id: 4,
    nome: 'Ranking Geral de Tênis',
    moduloId: 1,
    formato: 'ranking',
    status: 'em_andamento',
    dataInicio: '2025-01-01',
    dataFim: null,
    descricao: 'Ranking contínuo baseado em partidas avulsas. Pontos acumulados ao longo do ano.',
    maxInscritos: null,
    inscricoes_abertas: true,
    quem_lanca_resultado: 'qualquer',
    pontos_vitoria: 10,
    pontos_empate: 4,
    pontos_derrota: 1,
    jogadores_por_grupo: null,
    promovidos_por_grupo: null,
    rebaixados_por_grupo: null,
  },
  {
    id: 5,
    nome: 'Copa Beach Tennis',
    moduloId: 6,
    formato: 'grupos_mata_mata',
    status: 'inscricoes',
    dataInicio: '2025-08-01',
    dataFim: '2025-08-31',
    descricao: 'Fase de grupos seguida de eliminatório. Top 2 de cada grupo avançam.',
    maxInscritos: 16,
    inscricoes_abertas: true,
    quem_lanca_resultado: 'admin_funcionario',
    pontos_vitoria: 3,
    pontos_empate: 1,
    pontos_derrota: 0,
    jogadores_por_grupo: 4,
    promovidos_por_grupo: 2,
    rebaixados_por_grupo: 0,
  },
]

// Grupos (para barragem e grupos_mata_mata)
export const initialGrupos = [
  { id: 1, torneioId: 3, nome: 'Grupo A', ordem: 1 },
  { id: 2, torneioId: 3, nome: 'Grupo B', ordem: 2 },
  { id: 3, torneioId: 3, nome: 'Grupo C', ordem: 3 },
  { id: 4, torneioId: 5, nome: 'Grupo A', ordem: 1 },
  { id: 5, torneioId: 5, nome: 'Grupo B', ordem: 2 },
  { id: 6, torneioId: 5, nome: 'Grupo C', ordem: 3 },
  { id: 7, torneioId: 5, nome: 'Grupo D', ordem: 4 },
]

// Inscrições
export const initialInscricoes = [
  // Torneio 1 — eliminatório (8 inscritos)
  { id: 101, torneioId: 1, usuarioId: 3,  grupoId: null, status: 'confirmada', seed: 1, criadaEm: '2025-01-05T10:00:00Z' },
  { id: 102, torneioId: 1, usuarioId: 5,  grupoId: null, status: 'confirmada', seed: 2, criadaEm: '2025-01-05T10:05:00Z' },
  { id: 103, torneioId: 1, usuarioId: 6,  grupoId: null, status: 'confirmada', seed: 3, criadaEm: '2025-01-05T10:10:00Z' },
  { id: 104, torneioId: 1, usuarioId: 8,  grupoId: null, status: 'confirmada', seed: 4, criadaEm: '2025-01-05T10:15:00Z' },
  { id: 105, torneioId: 1, usuarioId: 9,  grupoId: null, status: 'confirmada', seed: 5, criadaEm: '2025-01-05T10:20:00Z' },
  { id: 106, torneioId: 1, usuarioId: 10, grupoId: null, status: 'confirmada', seed: 6, criadaEm: '2025-01-05T10:25:00Z' },
  { id: 107, torneioId: 1, usuarioId: 11, grupoId: null, status: 'confirmada', seed: 7, criadaEm: '2025-01-05T10:30:00Z' },
  { id: 108, torneioId: 1, usuarioId: 12, grupoId: null, status: 'confirmada', seed: 8, criadaEm: '2025-01-05T10:35:00Z' },
  // Torneio 2 — liga (6 inscritos)
  { id: 201, torneioId: 2, usuarioId: 3,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2024-12-20T10:00:00Z' },
  { id: 202, torneioId: 2, usuarioId: 5,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2024-12-20T10:05:00Z' },
  { id: 203, torneioId: 2, usuarioId: 6,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2024-12-20T10:10:00Z' },
  { id: 204, torneioId: 2, usuarioId: 8,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2024-12-20T10:15:00Z' },
  { id: 205, torneioId: 2, usuarioId: 9,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2024-12-20T10:20:00Z' },
  { id: 206, torneioId: 2, usuarioId: 10, grupoId: null, status: 'confirmada', seed: null, criadaEm: '2024-12-20T10:25:00Z' },
  // Torneio 4 — ranking (inscrição aberta, vários sócios)
  { id: 401, torneioId: 4, usuarioId: 3,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:00:00Z' },
  { id: 402, torneioId: 4, usuarioId: 5,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:05:00Z' },
  { id: 403, torneioId: 4, usuarioId: 6,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:10:00Z' },
  { id: 404, torneioId: 4, usuarioId: 8,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:15:00Z' },
  { id: 405, torneioId: 4, usuarioId: 9,  grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:20:00Z' },
  { id: 406, torneioId: 4, usuarioId: 10, grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:25:00Z' },
  { id: 407, torneioId: 4, usuarioId: 11, grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:30:00Z' },
  { id: 408, torneioId: 4, usuarioId: 12, grupoId: null, status: 'confirmada', seed: null, criadaEm: '2025-01-02T08:35:00Z' },
]

// Partidas demo
export const initialPartidas = [
  // ── Torneio 1 — eliminatório 8 jogadores ──────────────────────────────────
  // Quartas (rodada 1)
  { id: 1001, torneioId: 1, grupoId: null, fase: 'quartas', rodada: 1, jogador1Id: 3,  jogador2Id: 12, placar1: '6-3 6-2', placar2: null, vencedorId: 3,  status: 'finalizada', data: '2025-01-15', horario: '10:00' },
  { id: 1002, torneioId: 1, grupoId: null, fase: 'quartas', rodada: 1, jogador1Id: 5,  jogador2Id: 11, placar1: '6-4 7-5', placar2: null, vencedorId: 5,  status: 'finalizada', data: '2025-01-15', horario: '11:00' },
  { id: 1003, torneioId: 1, grupoId: null, fase: 'quartas', rodada: 1, jogador1Id: 6,  jogador2Id: 10, placar1: '3-6 6-3 7-5', placar2: null, vencedorId: 6, status: 'finalizada', data: '2025-01-16', horario: '10:00' },
  { id: 1004, torneioId: 1, grupoId: null, fase: 'quartas', rodada: 1, jogador1Id: 8,  jogador2Id: 9,  placar1: '6-1 6-0', placar2: null, vencedorId: 8,  status: 'finalizada', data: '2025-01-16', horario: '11:00' },
  // Semifinais (rodada 2)
  { id: 1005, torneioId: 1, grupoId: null, fase: 'semi',    rodada: 2, jogador1Id: 3,  jogador2Id: 5,  placar1: '7-5 6-4', placar2: null, vencedorId: 3,  status: 'finalizada', data: '2025-01-22', horario: '10:00' },
  { id: 1006, torneioId: 1, grupoId: null, fase: 'semi',    rodada: 2, jogador1Id: 6,  jogador2Id: 8,  placar1: null,       placar2: null, vencedorId: null, status: 'aguardando', data: '2025-01-22', horario: '14:00' },
  // Final (rodada 3)
  { id: 1007, torneioId: 1, grupoId: null, fase: 'final',   rodada: 3, jogador1Id: 3,  jogador2Id: null, placar1: null, placar2: null, vencedorId: null, status: 'aguardando', data: '2025-02-05', horario: '16:00' },

  // ── Torneio 2 — liga 6 jogadores (rodada corrida) ────────────────────────
  { id: 2001, torneioId: 2, grupoId: null, fase: 'liga', rodada: 1, jogador1Id: 3,  jogador2Id: 5,  placar1: '6-3 6-1', placar2: null, vencedorId: 3,  status: 'finalizada', data: '2025-01-05', horario: '09:00' },
  { id: 2002, torneioId: 2, grupoId: null, fase: 'liga', rodada: 1, jogador1Id: 6,  jogador2Id: 8,  placar1: '4-6 6-2 7-5', placar2: null, vencedorId: 6, status: 'finalizada', data: '2025-01-05', horario: '10:00' },
  { id: 2003, torneioId: 2, grupoId: null, fase: 'liga', rodada: 1, jogador1Id: 9,  jogador2Id: 10, placar1: '6-4 6-4', placar2: null, vencedorId: 9,  status: 'finalizada', data: '2025-01-05', horario: '11:00' },
  { id: 2004, torneioId: 2, grupoId: null, fase: 'liga', rodada: 2, jogador1Id: 3,  jogador2Id: 6,  placar1: '6-2 6-3', placar2: null, vencedorId: 3,  status: 'finalizada', data: '2025-01-12', horario: '09:00' },
  { id: 2005, torneioId: 2, grupoId: null, fase: 'liga', rodada: 2, jogador1Id: 5,  jogador2Id: 9,  placar1: '3-6 6-4 6-2', placar2: null, vencedorId: 5, status: 'finalizada', data: '2025-01-12', horario: '10:00' },
  { id: 2006, torneioId: 2, grupoId: null, fase: 'liga', rodada: 2, jogador1Id: 8,  jogador2Id: 10, placar1: null, placar2: null, vencedorId: null, status: 'aguardando', data: '2025-01-19', horario: '09:00' },
  { id: 2007, torneioId: 2, grupoId: null, fase: 'liga', rodada: 3, jogador1Id: 3,  jogador2Id: 8,  placar1: null, placar2: null, vencedorId: null, status: 'aguardando', data: '2025-01-26', horario: '09:00' },
  { id: 2008, torneioId: 2, grupoId: null, fase: 'liga', rodada: 3, jogador1Id: 5,  jogador2Id: 10, placar1: null, placar2: null, vencedorId: null, status: 'aguardando', data: '2025-01-26', horario: '10:00' },
  { id: 2009, torneioId: 2, grupoId: null, fase: 'liga', rodada: 3, jogador1Id: 6,  jogador2Id: 9,  placar1: null, placar2: null, vencedorId: null, status: 'aguardando', data: '2025-01-26', horario: '11:00' },

  // ── Torneio 4 — ranking (partidas avulsas) ────────────────────────────────
  { id: 4001, torneioId: 4, grupoId: null, fase: 'ranking', rodada: null, jogador1Id: 3,  jogador2Id: 5,  placar1: '6-4 6-2', placar2: null, vencedorId: 3,  status: 'finalizada', data: '2025-01-10', horario: null },
  { id: 4002, torneioId: 4, grupoId: null, fase: 'ranking', rodada: null, jogador1Id: 6,  jogador2Id: 8,  placar1: '6-3 7-5', placar2: null, vencedorId: 6,  status: 'finalizada', data: '2025-01-12', horario: null },
  { id: 4003, torneioId: 4, grupoId: null, fase: 'ranking', rodada: null, jogador1Id: 5,  jogador2Id: 9,  placar1: '4-6 6-3 7-5', placar2: null, vencedorId: 5, status: 'finalizada', data: '2025-01-14', horario: null },
  { id: 4004, torneioId: 4, grupoId: null, fase: 'ranking', rodada: null, jogador1Id: 3,  jogador2Id: 6,  placar1: '7-5 6-4', placar2: null, vencedorId: 3,  status: 'finalizada', data: '2025-01-18', horario: null },
  { id: 4005, torneioId: 4, grupoId: null, fase: 'ranking', rodada: null, jogador1Id: 10, jogador2Id: 11, placar1: '6-1 6-2', placar2: null, vencedorId: 10, status: 'finalizada', data: '2025-01-20', horario: null },
  { id: 4006, torneioId: 4, grupoId: null, fase: 'ranking', rodada: null, jogador1Id: 8,  jogador2Id: 12, placar1: '6-4 3-6 6-2', placar2: null, vencedorId: 8, status: 'finalizada', data: '2025-01-22', horario: null },
]
