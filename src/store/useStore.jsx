import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  initialModulos,
  initialRecursos,
  initialAulas,
  initialUsuarios,
  initialConfig,
  initialReservas,
  initialFilas,
} from '../lib/dados'
import { hoje, calcularHoraFim } from '../lib/utils'

// ─── Estado inicial ───────────────────────────────────────────────────────────

const estadoInicial = {
  config:   initialConfig,
  modulos:  initialModulos,
  recursos: initialRecursos,
  aulas:    initialAulas,
  usuarios: initialUsuarios,
  reservas: initialReservas,
  filas:    initialFilas,
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

    // Carregamento inicial do Supabase ─────────────────────────────────────────
    // Mapeia snake_case do banco para camelCase usado no frontend

    case 'SET_MODULOS': {
      const modulos = action.payload.map(m => ({
        ...m,
        antecedencia_maxima:  m.antecedencia_maxima,
        janela_cancelamento:  m.janela_cancelamento,
        fila_habilitada:      m.fila_habilitada,
        tipo_fila:            m.tipo_fila,
        antecedencia_fila:    m.antecedencia_fila,
        duracao: isNaN(Number(m.duracao)) ? m.duracao : Number(m.duracao),
      }))
      return { ...state, modulos }
    }

    case 'SET_RECURSOS': {
      const recursos = action.payload.map(r => ({
        ...r,
        moduloId: r.modulo_id,
      }))
      return { ...state, recursos }
    }

    case 'SET_AULAS': {
      const aulas = action.payload.map(a => ({
        ...a,
        recursoId:  a.recurso_id,
        diasSemana: a.dias_semana,
        horaInicio: a.hora_inicio,
        horaFim:    a.hora_fim,
      }))
      return { ...state, aulas }
    }

    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } }

    // Disparado pelo Realtime do Supabase — fase 2 fará refetch; em demo é no-op
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
    if (!supabase) return  // sem credenciais → usa dados demo
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      const [
        { data: modulos },
        { data: recursos },
        { data: aulas },
        { data: config },
      ] = await Promise.all([
        supabase.from('modulos').select('*').order('id'),
        supabase.from('recursos').select('*').order('id'),
        supabase.from('aulas').select('*').order('id'),
        supabase.from('config').select('*').limit(1).single(),
      ])

      if (modulos)  dispatch({ type: 'SET_MODULOS',  payload: modulos  })
      if (recursos) dispatch({ type: 'SET_RECURSOS', payload: recursos })
      if (aulas)    dispatch({ type: 'SET_AULAS',    payload: aulas    })
      if (config)   dispatch({ type: 'SET_CONFIG',   payload: config   })
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
