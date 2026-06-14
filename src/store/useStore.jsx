import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'
import {
  initialModulos,
  initialRecursos,
  initialAulas,
  initialUsuarios,
  initialConfig,
  initialReservas,
  initialFilas,
  initialTorneios,
  initialGrupos,
  initialInscricoes,
  initialPartidas,
} from '../lib/dados'
import { hoje, calcularHoraFim } from '../lib/utils'

// ─── Estado inicial ───────────────────────────────────────────────────────────

const estadoInicial = {
  config:     initialConfig,
  modulos:    initialModulos,
  recursos:   initialRecursos,
  aulas:      initialAulas,
  usuarios:   initialUsuarios,
  reservas:   initialReservas,
  filas:      initialFilas,
  torneios:   initialTorneios,
  grupos:     initialGrupos,
  inscricoes: initialInscricoes,
  partidas:   initialPartidas,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    // Reservas ─────────────────────────────────────────────────────────────────

    case 'FAZER_RESERVA': {
      const { usuarioId, recursoId, moduloId, data, horaInicio, duracao, tipo } = action.payload
      const horaFim = calcularHoraFim(horaInicio, duracao)
      const novaReserva = {
        id: Date.now(),
        usuarioId,
        recursoId,
        moduloId,
        data,
        horaInicio,
        horaFim,
        tipo,        // 'agendamento' | 'checkin'
        status: 'Pendente',
        criadaEm: new Date().toISOString(),
        comprovantePix: null,
      }
      return { ...state, reservas: [...state.reservas, novaReserva] }
    }

    case 'CANCELAR_RESERVA': {
      return {
        ...state,
        reservas: state.reservas.map(r =>
          r.id === action.payload.reservaId ? { ...r, status: 'Cancelada' } : r
        ),
      }
    }

    case 'INICIAR_RESERVA': {
      const { reservaId, moduloId } = action.payload
      const modulo = state.modulos.find(m => m.id === moduloId)
      const duracaoTotal = (modulo?.duracao || 60) + 5 // +5 aquecimento
      return {
        ...state,
        reservas: state.reservas.map(r =>
          r.id === reservaId
            ? { ...r, status: 'Em Andamento', iniciadaEm: new Date().toISOString(), duracaoSegundos: duracaoTotal * 60 }
            : r
        ),
      }
    }

    case 'ENCERRAR_RESERVA': {
      return {
        ...state,
        reservas: state.reservas.map(r =>
          r.id === action.payload.reservaId ? { ...r, status: 'Finalizada', encerradaEm: new Date().toISOString() } : r
        ),
      }
    }

    case 'ESTENDER_RESERVA': {
      return {
        ...state,
        reservas: state.reservas.map(r =>
          r.id === action.payload.reservaId
            ? { ...r, duracaoSegundos: (r.duracaoSegundos || 0) + 60 * 60 }
            : r
        ),
      }
    }

    case 'REGISTRAR_NOSHOW': {
      const { reservaId, usuarioId } = action.payload
      const usuario = state.usuarios.find(u => u.id === usuarioId)
      const novoCount = (usuario?.noshow_count || 0) + 1
      const config = state.config
      const deveBloqueiar = novoCount >= config.punicao_noshow_limite

      const dataDesbloqueio = deveBloqueiar
        ? new Date(Date.now() + config.punicao_dias_bloqueio * 86400000).toISOString().split('T')[0]
        : usuario?.bloqueado_ate

      return {
        ...state,
        reservas: state.reservas.map(r =>
          r.id === reservaId ? { ...r, status: 'No-Show' } : r
        ),
        usuarios: state.usuarios.map(u =>
          u.id === usuarioId
            ? {
                ...u,
                noshow_count: novoCount,
                status: deveBloqueiar ? 'Bloqueado' : u.status,
                bloqueado_ate: dataDesbloqueio,
              }
            : u
        ),
      }
    }

    case 'UPLOAD_COMPROVANTE': {
      return {
        ...state,
        reservas: state.reservas.map(r =>
          r.id === action.payload.reservaId
            ? { ...r, comprovantePix: action.payload.url, status: 'Confirmada' }
            : r
        ),
      }
    }

    // Fila ─────────────────────────────────────────────────────────────────────

    case 'ENTRAR_FILA': {
      const { usuarioId, moduloId, recursoId } = action.payload
      const entrada = {
        id: Date.now(),
        usuarioId,
        moduloId,
        recursoId,  // null = qualquer quadra
        data: hoje(),
        entradaEm: new Date().toISOString(),
        status: 'Aguardando',
      }
      return { ...state, filas: [...state.filas, entrada] }
    }

    case 'SAIR_FILA': {
      return {
        ...state,
        filas: state.filas.map(f =>
          f.id === action.payload.filaId ? { ...f, status: 'Cancelado' } : f
        ),
      }
    }

    case 'LIMPAR_FILA': {
      const { moduloId } = action.payload
      return {
        ...state,
        filas: state.filas.map(f =>
          f.status === 'Aguardando' && (moduloId == null || f.moduloId === moduloId)
            ? { ...f, status: 'Cancelado' }
            : f
        ),
      }
    }

    case 'CHAMAR_DA_FILA': {
      return {
        ...state,
        filas: state.filas.map(f =>
          f.id === action.payload.filaId ? { ...f, status: 'Chamado', chamadoEm: new Date().toISOString() } : f
        ),
      }
    }

    // Recursos ─────────────────────────────────────────────────────────────────

    case 'ATUALIZAR_STATUS_RECURSO': {
      return {
        ...state,
        recursos: state.recursos.map(r =>
          r.id === action.payload.recursoId
            ? { ...r, status: action.payload.status, motivo: action.payload.motivo ?? r.motivo }
            : r
        ),
      }
    }

    case 'ATUALIZAR_STATUS_EM_MASSA': {
      const { moduloId, status, motivo } = action.payload
      return {
        ...state,
        recursos: state.recursos.map(r =>
          (moduloId == null || r.moduloId === moduloId)
            ? { ...r, status, motivo: motivo ?? null }
            : r
        ),
      }
    }

    case 'SALVAR_RECURSO': {
      const existe = state.recursos.find(r => r.id === action.payload.id)
      return {
        ...state,
        recursos: existe
          ? state.recursos.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r)
          : [...state.recursos, { ...action.payload, id: Date.now() }],
      }
    }

    case 'REMOVER_RECURSO': {
      return {
        ...state,
        recursos: state.recursos.filter(r => r.id !== action.payload.recursoId),
      }
    }

    // Aulas ────────────────────────────────────────────────────────────────────

    case 'SALVAR_AULA': {
      const existe = state.aulas.find(a => a.id === action.payload.id)
      return {
        ...state,
        aulas: existe
          ? state.aulas.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a)
          : [...state.aulas, { ...action.payload, id: Date.now() }],
      }
    }

    case 'REMOVER_AULA': {
      return {
        ...state,
        aulas: state.aulas.filter(a => a.id !== action.payload.aulaId),
      }
    }

    // Usuários ─────────────────────────────────────────────────────────────────

    case 'SALVAR_USUARIO': {
      const existe = state.usuarios.find(u => u.id === action.payload.id)
      return {
        ...state,
        usuarios: existe
          ? state.usuarios.map(u => u.id === action.payload.id ? { ...u, ...action.payload } : u)
          : [...state.usuarios, { ...action.payload, id: Date.now() }],
      }
    }

    case 'BLOQUEAR_USUARIO': {
      const { usuarioId, ate } = action.payload
      return {
        ...state,
        usuarios: state.usuarios.map(u =>
          u.id === usuarioId ? { ...u, status: 'Bloqueado', bloqueado_ate: ate } : u
        ),
      }
    }

    case 'DESBLOQUEAR_USUARIO': {
      return {
        ...state,
        usuarios: state.usuarios.map(u =>
          u.id === action.payload.usuarioId
            ? { ...u, status: 'Ativo', bloqueado_ate: null, noshow_count: 0 }
            : u
        ),
      }
    }

    // Módulos ──────────────────────────────────────────────────────────────────

    case 'SALVAR_MODULO': {
      return {
        ...state,
        modulos: state.modulos.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      }
    }

    // Config ───────────────────────────────────────────────────────────────────

    case 'SALVAR_CONFIG': {
      return { ...state, config: { ...state.config, ...action.payload } }
    }

    // Torneios ─────────────────────────────────────────────────────────────────

    case 'SALVAR_TORNEIO': {
      const existe = state.torneios.find(t => t.id === action.payload.id)
      return {
        ...state,
        torneios: existe
          ? state.torneios.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t)
          : [...state.torneios, { ...action.payload, id: Date.now() }],
      }
    }

    case 'REMOVER_TORNEIO': {
      const { torneioId } = action.payload
      return {
        ...state,
        torneios:   state.torneios.filter(t => t.id !== torneioId),
        grupos:     state.grupos.filter(g => g.torneioId !== torneioId),
        inscricoes: state.inscricoes.filter(i => i.torneioId !== torneioId),
        partidas:   state.partidas.filter(p => p.torneioId !== torneioId),
      }
    }

    case 'INSCREVER_NO_TORNEIO': {
      const { torneioId, usuarioId } = action.payload
      // Não duplicar
      const jaInscrito = state.inscricoes.find(
        i => i.torneioId === torneioId && i.usuarioId === usuarioId && i.status === 'confirmada'
      )
      if (jaInscrito) return state
      const nova = {
        id: Date.now(),
        torneioId,
        usuarioId,
        grupoId: null,
        status: 'confirmada',
        seed: null,
        criadaEm: new Date().toISOString(),
      }
      return { ...state, inscricoes: [...state.inscricoes, nova] }
    }

    case 'CANCELAR_INSCRICAO': {
      return {
        ...state,
        inscricoes: state.inscricoes.map(i =>
          i.id === action.payload.inscricaoId ? { ...i, status: 'cancelada' } : i
        ),
      }
    }

    case 'SALVAR_GRUPO': {
      const existe = state.grupos.find(g => g.id === action.payload.id)
      return {
        ...state,
        grupos: existe
          ? state.grupos.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g)
          : [...state.grupos, { ...action.payload, id: Date.now() }],
      }
    }

    case 'REMOVER_GRUPO': {
      return {
        ...state,
        grupos: state.grupos.filter(g => g.id !== action.payload.grupoId),
        inscricoes: state.inscricoes.map(i =>
          i.grupoId === action.payload.grupoId ? { ...i, grupoId: null } : i
        ),
      }
    }

    case 'ATRIBUIR_GRUPO': {
      // atribui inscricaoId ao grupoId
      return {
        ...state,
        inscricoes: state.inscricoes.map(i =>
          i.id === action.payload.inscricaoId ? { ...i, grupoId: action.payload.grupoId } : i
        ),
      }
    }

    case 'GERAR_PARTIDAS': {
      // Remove partidas antigas do torneio e insere as novas
      const { torneioId, partidas } = action.payload
      return {
        ...state,
        partidas: [
          ...state.partidas.filter(p => p.torneioId !== torneioId),
          ...partidas.map((p, i) => ({ ...p, id: Date.now() + i })),
        ],
      }
    }

    case 'LANCAR_RESULTADO': {
      const { partidaId, placar1, placar2, vencedorId } = action.payload
      return {
        ...state,
        partidas: state.partidas.map(p =>
          p.id === partidaId
            ? { ...p, placar1, placar2, vencedorId, status: 'finalizada' }
            : p
        ),
      }
    }

    case 'SALVAR_PARTIDA': {
      const existe = state.partidas.find(p => p.id === action.payload.id)
      return {
        ...state,
        partidas: existe
          ? state.partidas.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p)
          : [...state.partidas, { ...action.payload, id: Date.now() }],
      }
    }

    case 'REMOVER_PARTIDA': {
      return {
        ...state,
        partidas: state.partidas.filter(p => p.id !== action.payload.partidaId),
      }
    }

    // Carregamento inicial do PocketBase ─────────────────────────────────────────

    case 'SET_MODULOS': {
      const modulos = action.payload.map(m => ({
        ...m,
        duracao: isNaN(Number(m.duracao)) ? m.duracao : Number(m.duracao),
      }))
      return { ...state, modulos }
    }

    case 'SET_RECURSOS': {
      const recursos = action.payload.map(r => ({
        ...r,
        moduloId: r.modulo,  // relation field do PocketBase retorna o ID
      }))
      return { ...state, recursos }
    }

    case 'SET_AULAS': {
      const aulas = action.payload.map(a => ({
        ...a,
        recursoId:  a.recurso,
        diasSemana: Array.isArray(a.diasSemana) ? a.diasSemana : JSON.parse(a.diasSemana || '[]'),
      }))
      return { ...state, aulas }
    }

    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } }

    // Disparado pelo Realtime do PocketBase — recarrega dados do servidor
    case 'SYNC_REALTIME':
      return state

    default:
      return state
  }
}

// ─── Context + Provider ───────────────────────────────────────────────────────

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!pb) return  // sem credenciais → usa dados demo
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      const [modulos, recursos, aulas, configList] = await Promise.all([
        pb.collection('modulos').getFullList({ sort: 'ordem' }),
        pb.collection('recursos').getFullList({ sort: 'nome' }),
        pb.collection('aulas').getFullList(),
        pb.collection('config').getFullList({ limit: 1 }),
      ])

      if (modulos.length)   dispatch({ type: 'SET_MODULOS',  payload: modulos  })
      if (recursos.length)  dispatch({ type: 'SET_RECURSOS', payload: recursos })
      if (aulas.length)     dispatch({ type: 'SET_AULAS',    payload: aulas    })
      if (configList.length) dispatch({ type: 'SET_CONFIG',  payload: configList[0] })
    } catch {
      // falha silenciosa — mantém dados demo
    } finally {
      setCarregando(false)
    }
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, carregando }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return ctx
}
