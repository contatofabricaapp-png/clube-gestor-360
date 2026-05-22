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
  entradaEm: _iso(-(25 - i) * 2), // chegadas a cada 2 min
  status: 'Aguardando',
}))
