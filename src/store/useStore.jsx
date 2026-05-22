import { createContext, useContext, useReducer } from 'react'
import {
  initialModulos,
  initialRecursos,
  initialAulas,
  initialUsuarios,
  initialConfig,
} from '../lib/dados'
import { hoje, calcularHoraFim } from '../lib/utils'

// ─── Estado inicial ───────────────────────────────────────────────────────────

const estadoInicial = {
  config:   initialConfig,
  modulos:  initialModulos,
  recursos: initialRecursos,
  aulas:    initialAulas,
  usuarios: initialUsuarios,
  reservas: [],
  filas:    [],
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

    default:
      return state
  }
}

// ─── Context + Provider ───────────────────────────────────────────────────────

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial)
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider')
  return ctx
}
