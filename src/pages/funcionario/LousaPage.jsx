import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { useRealtime } from '../../hooks/useRealtime.js'
import { Button, Badge } from '../../components/ui/index.jsx'
import { StatusRecursoBadge } from '../../components/ui/StatusBadges.jsx'
import Modal from '../../components/ui/Modal.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import {
  hoje, formatDateBR, formatarTempo,
  getStatusEmTempoReal, getHoraAtualExata
} from '../../lib/utils.js'
import { TEMPO_AQUECIMENTO, STATUS_RECURSOS } from '../../lib/dados.js'

// Borda esquerda por status do recurso
const STATUS_CARD_BORDER = {
  'Em Andamento': 'border-l-teal-400',
  'Ocupada':      'border-l-blue-400',
  'Livre':        'border-l-emerald-500',
  'Manutencao':   'border-l-amber-400',
  'Interditada':  'border-l-red-500',
  'Limpeza':      'border-l-slate-400',
}

export default function LousaPage() {
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const [moduloFiltro, setModuloFiltro] = useState(null)

  useRealtime('reservas', () => dispatch({ type: 'SYNC_REALTIME' }))
  const [tick, setTick] = useState(0)
  const [checkinModal, setCheckinModal] = useState(null)
  const [buscaSocio, setBuscaSocio]     = useState('')
  const [statusModal, setStatusModal]   = useState(null)
  const [novoStatus, setNovoStatus]     = useState('')
  const [motivoStatus, setMotivoStatus] = useState('')
  const [massaModal, setMassaModal]     = useState(false)
  const [massaModulo, setMassaModulo]   = useState(null)
  const [massaStatus, setMassaStatus]   = useState('Interditada')
  const [massaMotivo, setMassaMotivo]   = useState('')
  const [limparFilaModal, setLimparFilaModal] = useState(false)

  useEffect(() => {
    const i = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const { modulos, recursos, reservas, usuarios, filas, aulas } = state
  const modulosAtivos = modulos.filter(m => m.ativo)

  const recursosExibidos = moduloFiltro
    ? recursos.filter(r => r.moduloId === moduloFiltro)
    : recursos.filter(r => modulosAtivos.some(m => m.id === r.moduloId))

  const totalFila = filas.filter(f =>
    f.status === 'Aguardando' &&
    f.data === hoje() &&
    (moduloFiltro == null || f.moduloId === moduloFiltro)
  ).length

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getUsuario = id => usuarios.find(u => u.id === id)
  const getModulo  = id => modulos.find(m => m.id === id)

  const getReservaAtual = recursoId => {
    const horaAtual = getHoraAtualExata()
    return reservas.find(r =>
      r.recursoId === recursoId &&
      r.data === hoje() &&
      ['Pendente', 'Confirmada', 'Em Andamento', 'Aguardando Pagamento'].includes(r.status) &&
      (r.status === 'Em Andamento' || r.horaFim > horaAtual)
    )
  }

  const getFilaRecurso = rec =>
    filas
      .filter(f =>
        f.moduloId === rec.moduloId &&
        f.status === 'Aguardando' &&
        f.data === hoje() &&
        (f.recursoId == null || f.recursoId === rec.id)
      )
      .sort((a, b) => new Date(a.entradaEm) - new Date(b.entradaEm))

  const calcTempoRestante = r => {
    if (!r.iniciadaEm || !r.duracaoSegundos) return null
    return Math.max(0, r.duracaoSegundos - Math.floor((new Date() - new Date(r.iniciadaEm)) / 1000))
  }

  const getFaseTempo = r => {
    if (!r.iniciadaEm) return 'aguardando'
    const passMin = (new Date() - new Date(r.iniciadaEm)) / 60000
    return passMin < TEMPO_AQUECIMENTO ? 'aquecimento' : 'jogo'
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function handleStart(reservaId, moduloId) {
    dispatch({ type: 'INICIAR_RESERVA', payload: { reservaId, moduloId } })
  }
  function handleEncerrar(reservaId) {
    dispatch({ type: 'ENCERRAR_RESERVA', payload: { reservaId } })
  }
  function handleEstender(reservaId) {
    dispatch({ type: 'ESTENDER_RESERVA', payload: { reservaId } })
  }
  function handleNoShow(reservaId, usuarioId) {
    dispatch({ type: 'REGISTRAR_NOSHOW', payload: { reservaId, usuarioId } })
  }
  function handleAprovarPagamento(reservaId) {
    dispatch({ type: 'UPLOAD_COMPROVANTE', payload: { reservaId, url: 'aprovado-manual' } })
  }
  function handleChamarFila(filaItem, recurso) {
    dispatch({ type: 'CHAMAR_DA_FILA', payload: { filaId: filaItem.id } })
    const modulo = getModulo(recurso.moduloId)
    dispatch({
      type: 'FAZER_RESERVA',
      payload: {
        usuarioId:  filaItem.usuarioId,
        recursoId:  recurso.id,
        moduloId:   recurso.moduloId,
        data:       hoje(),
        horaInicio: getHoraAtualExata(),
        duracao:    (modulo?.duracao || 60) + TEMPO_AQUECIMENTO,
        tipo:       'checkin',
      }
    })
  }
  function handleStatusEmMassa() {
    dispatch({ type: 'ATUALIZAR_STATUS_EM_MASSA', payload: { moduloId: massaModulo, status: massaStatus, motivo: massaMotivo || null } })
    setMassaModal(false)
    setMassaMotivo('')
  }
  function handleAlterarStatus() {
    dispatch({ type: 'ATUALIZAR_STATUS_RECURSO', payload: { recursoId: statusModal.recurso.id, status: novoStatus, motivo: motivoStatus || null } })
    setStatusModal(null)
    setNovoStatus('')
    setMotivoStatus('')
  }
  function handleCheckinManual(usuarioId) {
    const recurso = checkinModal.recurso
    const modulo  = getModulo(recurso.moduloId)
    dispatch({
      type: 'FAZER_RESERVA',
      payload: {
        usuarioId,
        recursoId:  recurso.id,
        moduloId:   recurso.moduloId,
        data:       hoje(),
        horaInicio: getHoraAtualExata(),
        duracao:    (modulo?.duracao || 60) + TEMPO_AQUECIMENTO,
        tipo:       'checkin',
      }
    })
    setCheckinModal(null)
    setBuscaSocio('')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* Header dark próprio */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-10">
        <div>
          <h1 className="text-base font-bold text-white leading-tight">📋 Lousa Digital</h1>
          <p className="text-xs text-slate-400">{formatDateBR(hoje())} · Tempo real</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {totalFila > 0 && (
            <button
              onClick={() => setLimparFilaModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-800/60 border border-purple-700 text-purple-300 text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors"
            >
              ⏳ {totalFila} na fila
            </button>
          )}
          <button
            onClick={() => { setMassaModal(true); setMassaModulo(null); setMassaStatus('Interditada'); setMassaMotivo('') }}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            🌧️ Em Massa
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-24">

        {/* Filtro por módulo */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setModuloFiltro(null)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
              !moduloFiltro ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            Todos
          </button>
          {modulosAtivos.map(m => (
            <button
              key={m.id}
              onClick={() => setModuloFiltro(m.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                moduloFiltro === m.id ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {m.icone} {m.nome}
            </button>
          ))}
        </div>

        {/* Grid de quadras — 1 coluna mobile, 2 colunas desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recursosExibidos.map(recurso => {
            const modulo     = getModulo(recurso.moduloId)
            const reserva    = getReservaAtual(recurso.id)
            const usuario    = reserva ? getUsuario(reserva.usuarioId) : null
            const filaRec    = getFilaRecurso(recurso)
            const statusReal = getStatusEmTempoReal(recurso, aulas, reservas)
            const podeUsar   = statusReal.status === 'Livre'

            const tempo      = reserva ? calcTempoRestante(reserva) : null
            const fase       = reserva ? getFaseTempo(reserva) : null

            const diaSemana  = new Date().getDay()
            const horaAtual  = getHoraAtualExata()
            const aulaAgora  = aulas.find(a =>
              a.recursoId === recurso.id &&
              a.status === 'ativo' &&
              a.diasSemana.includes(diaSemana) &&
              a.horaInicio <= horaAtual &&
              a.horaFim > horaAtual
            )

            // Determina a chave de status para a borda
            const statusBordaKey = reserva?.status === 'Em Andamento' ? 'Em Andamento'
              : reserva ? 'Ocupada'
              : statusReal.status
            const bordaClass = STATUS_CARD_BORDER[statusBordaKey] || 'border-l-slate-600'

            return (
              <div key={recurso.id} className={`bg-slate-800 rounded-2xl border border-slate-700 border-l-4 ${bordaClass} p-4 space-y-3`}>

                {/* Header do card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{modulo?.icone}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate">{recurso.nome}</h3>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <StatusRecursoBadge status={statusReal.status} size="sm" />
                        {filaRec.length > 0 && podeUsar && (
                          <span className="text-xs text-purple-300 bg-purple-800/50 px-1.5 py-0.5 rounded-full">
                            ⏳ {filaRec.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setStatusModal({ recurso }); setNovoStatus(recurso.status); setMotivoStatus(recurso.motivo || '') }}
                    className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
                    title="Alterar status"
                  >
                    ⚙️
                  </button>
                </div>

                {/* Status manual (manutenção, etc) */}
                {!podeUsar && !reserva && !aulaAgora && (
                  <div className="text-center py-4 rounded-xl bg-slate-700">
                    <p className="text-2xl">{STATUS_RECURSOS[statusReal.status]?.icone}</p>
                    <p className="font-medium text-slate-200 text-sm">{STATUS_RECURSOS[statusReal.status]?.label}</p>
                    {statusReal.motivo && <p className="text-xs text-slate-400 mt-1">{statusReal.motivo}</p>}
                  </div>
                )}

                {/* Aula em andamento */}
                {aulaAgora && !reserva && (
                  <div className="bg-purple-900/40 border border-purple-600 rounded-xl p-3 text-center">
                    <p className="text-purple-300 font-semibold text-sm">📚 Aula em Andamento</p>
                    <p className="text-purple-200 text-sm">{aulaAgora.nome} · {aulaAgora.professor}</p>
                    <p className="text-purple-400 text-xs">{aulaAgora.horaInicio} – {aulaAgora.horaFim}</p>
                  </div>
                )}

                {/* Reserva ativa */}
                {reserva && (
                  <div className="space-y-3">
                    <div className="bg-slate-700 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-sm">👤 {usuario?.nome}</p>
                          <p className="text-xs text-slate-400">{reserva.horaInicio} – {reserva.horaFim}</p>
                        </div>
                        <Badge variant={
                          reserva.status === 'Aguardando Pagamento' ? 'purple' :
                          fase === 'aquecimento' ? 'warning' :
                          fase === 'jogo'        ? 'success' : 'info'
                        }>
                          {reserva.status === 'Aguardando Pagamento' ? '💰 Pagamento' :
                           fase === 'aquecimento' ? '🔥 Aquecimento' :
                           fase === 'jogo'        ? '🎾 Em jogo' : '⏸️ Pendente'}
                        </Badge>
                      </div>

                      {tempo !== null && (
                        <div className={`text-center py-3 rounded-xl ${
                          tempo < 300 ? 'bg-red-900/50' :
                          fase === 'aquecimento' ? 'bg-amber-900/50' : 'bg-emerald-900/50'
                        }`}>
                          <p className={`text-4xl font-bold font-mono ${
                            tempo < 300 ? 'text-red-400 animate-timer' :
                            fase === 'aquecimento' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {formatarTempo(tempo)}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {fase === 'aquecimento' ? 'Aquecimento' : 'Tempo restante'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {reserva.status === 'Aguardando Pagamento' && (
                        <Button variant="success" size="sm" className="flex-1" onClick={() => handleAprovarPagamento(reserva.id)}>
                          💰 Aprovar Pagamento
                        </Button>
                      )}
                      {reserva.status === 'Pendente' && (
                        <>
                          <Button variant="success" size="sm" className="flex-1" onClick={() => handleStart(reserva.id, reserva.moduloId)}>
                            ▶ START
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleNoShow(reserva.id, reserva.usuarioId)}>
                            No-Show
                          </Button>
                        </>
                      )}
                      {reserva.status === 'Em Andamento' && (
                        <>
                          <Button variant="blue" size="sm" onClick={() => handleEstender(reserva.id)}>
                            +1h
                          </Button>
                          <Button variant="danger" size="sm" className="flex-1" onClick={() => handleEncerrar(reserva.id)}>
                            Encerrar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Livre */}
                {podeUsar && !reserva && !aulaAgora && (
                  <div className="text-center py-4 bg-emerald-900/30 rounded-xl space-y-2">
                    <p className="text-emerald-400 font-semibold text-sm">✓ Livre</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {filaRec.length > 0 && (
                        <Button variant="purple" size="sm" onClick={() => handleChamarFila(filaRec[0], recurso)}>
                          Chamar da Fila
                        </Button>
                      )}
                      <Button variant="blue" size="sm" onClick={() => { setCheckinModal({ recurso }); setBuscaSocio('') }}>
                        Check-in Manual
                      </Button>
                    </div>
                  </div>
                )}

                {/* Fila por quadra */}
                {filaRec.length > 0 && podeUsar && !aulaAgora && (
                  <div className="border-t border-slate-700 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-purple-400">⏳ Fila ({filaRec.length})</p>
                    {filaRec.slice(0, 3).map((f, i) => {
                      const u = getUsuario(f.usuarioId)
                      return (
                        <div key={f.id} className="flex items-center justify-between bg-slate-700 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm text-slate-200 truncate">{u?.nome}</span>
                          </div>
                          <Button variant="success" size="sm" onClick={() => handleChamarFila(f, recurso)}>
                            Chamar
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            )
          })}
        </div>

      </main>

      <BottomNav />

      {/* Modal: Limpar Fila */}
      {limparFilaModal && (() => {
        const filaAtiva = filas
          .filter(f =>
            f.status === 'Aguardando' &&
            f.data === hoje() &&
            (moduloFiltro == null || f.moduloId === moduloFiltro)
          )
          .sort((a, b) => new Date(a.entradaEm) - new Date(b.entradaEm))

        return (
          <Modal isOpen title="🗑️ Limpar Fila" onClose={() => setLimparFilaModal(false)}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Pessoas que serão removidas da fila
                {moduloFiltro ? ` de ${modulosAtivos.find(m => m.id === moduloFiltro)?.nome}` : ''}:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filaAtiva.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">Nenhuma pessoa na fila.</p>
                ) : filaAtiva.map((f, i) => {
                  const u = getUsuario(f.usuarioId)
                  const m = getModulo(f.moduloId)
                  const mins = Math.round((Date.now() - new Date(f.entradaEm)) / 60000)
                  return (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{u?.nome}</p>
                        <p className="text-xs text-slate-400">{m?.icone} {m?.nome} · {mins < 1 ? '<1' : mins} min</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {filaAtiva.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-amber-700 text-sm font-medium">
                    ⚠️ Ação irreversível. {filaAtiva.length} pessoa(s) serão removidas.
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setLimparFilaModal(false)}>Cancelar</Button>
                {filaAtiva.length > 0 && (
                  <Button variant="danger" className="flex-1" onClick={() => {
                    dispatch({ type: 'LIMPAR_FILA', payload: { moduloId: moduloFiltro } })
                    setLimparFilaModal(false)
                  }}>
                    Remover {filaAtiva.length}
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )
      })()}

      {/* Modal: Alterar Status em Massa */}
      {massaModal && (
        <Modal isOpen title="Alterar Status em Massa" onClose={() => setMassaModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Aplicar em:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMassaModulo(null)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    massaModulo === null ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Todas
                </button>
                {modulosAtivos.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMassaModulo(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      massaModulo === m.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {m.icone} {m.nome}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Novo status:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'Livre',       label: '🟢 Livre',       ativo: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
                  { value: 'Interditada', label: '🔴 Interditada', ativo: 'border-red-500 bg-red-50 text-red-700'             },
                  { value: 'Manutencao',  label: '🟡 Manutenção',  ativo: 'border-amber-500 bg-amber-50 text-amber-700'       },
                  { value: 'Limpeza',     label: '⚪ Limpeza',     ativo: 'border-slate-400 bg-slate-100 text-slate-700'      },
                ].map(({ value, label, ativo }) => (
                  <button key={value} onClick={() => setMassaStatus(value)}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      massaStatus === value ? ativo : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >{label}</button>
                ))}
              </div>
            </div>
            {massaStatus !== 'Livre' && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Motivo (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: chuva forte..."
                  value={massaMotivo}
                  onChange={e => setMassaMotivo(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setMassaModal(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleStatusEmMassa}>Confirmar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Alterar Status Individual */}
      {statusModal && (
        <Modal isOpen title={`Status — ${statusModal.recurso.nome}`} onClose={() => setStatusModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'Livre',       label: '🟢 Livre',       ativo: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
                { value: 'Manutencao',  label: '🟡 Manutenção',  ativo: 'border-amber-500 bg-amber-50 text-amber-700'       },
                { value: 'Interditada', label: '🔴 Interditada', ativo: 'border-red-500 bg-red-50 text-red-700'             },
                { value: 'Limpeza',     label: '⚪ Limpeza',     ativo: 'border-slate-400 bg-slate-100 text-slate-700'      },
              ].map(({ value, label, ativo }) => (
                <button key={value} onClick={() => setNovoStatus(value)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    novoStatus === value ? ativo : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >{label}</button>
              ))}
            </div>
            {novoStatus !== 'Livre' && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Motivo (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: troca de rede..."
                  value={motivoStatus}
                  onChange={e => setMotivoStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStatusModal(null)}>Cancelar</Button>
              <Button className="flex-1" disabled={!novoStatus} onClick={handleAlterarStatus}>Confirmar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Check-in Manual */}
      {checkinModal && (() => {
        const sociosFiltrados = state.usuarios
          .filter(u => u.perfil === 'socio' && u.status === 'Ativo')
          .filter(u => {
            const q = buscaSocio.toLowerCase()
            return !q || u.nome.toLowerCase().includes(q) || u.matricula.toLowerCase().includes(q)
          })
        return (
          <Modal isOpen title={`Check-in Manual — ${checkinModal.recurso.nome}`} onClose={() => setCheckinModal(null)}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome ou matrícula..."
                value={buscaSocio}
                onChange={e => setBuscaSocio(e.target.value)}
                autoFocus
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sociosFiltrados.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">Nenhum sócio encontrado.</p>
                ) : sociosFiltrados.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{u.nome}</p>
                      <p className="text-xs text-slate-400">{u.matricula}</p>
                    </div>
                    <Button variant="success" size="sm" onClick={() => handleCheckinManual(u.id)}>
                      Check-in
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
