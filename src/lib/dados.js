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
  { id: 1, nome: 'Admin Master',   matricula: 'ADM001',  senha: '1234', perfil: 'admin',       status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 2, nome: 'João Recepção',  matricula: 'FUNC001', senha: '1234', perfil: 'funcionario', status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 3, nome: 'Maria Silva',    matricula: 'SOC001',  senha: '1234', perfil: 'socio',       status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 4, nome: 'Carlos Santos',  matricula: 'SOC002',  senha: '1234', perfil: 'socio',       status: 'Bloqueado', noshow_count: 2, bloqueado_ate: '2025-12-31' },
  { id: 5, nome: 'Ana Oliveira',   matricula: 'SOC003',  senha: '1234', perfil: 'socio',       status: 'Ativo',     noshow_count: 0, bloqueado_ate: null         },
  { id: 6, nome: 'Pedro Costa',    matricula: 'SOC004',  senha: '1234', perfil: 'socio',       status: 'Ativo',     noshow_count: 1, bloqueado_ate: null         },
  { id: 7, nome: 'Lucia Ferreira', matricula: 'SOC005',  senha: '1234', perfil: 'socio',       status: 'Cancelado', noshow_count: 0, bloqueado_ate: null         },
]
