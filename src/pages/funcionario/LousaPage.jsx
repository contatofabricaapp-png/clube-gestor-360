import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { Card, Button, Badge } from '../../components/ui/index.jsx'
import { StatusRecursoBadge } from '../../components/ui/StatusBadges.jsx'
import Header from '../../components/layout/Header.jsx'
import {
  hoje, formatDateBR, formatarTempo,
  getStatusEmTempoReal, getHoraAtualExata
} from '../../lib/utils.js'
import { TEMPO_AQUECIMENTO, STATUS_RECURSOS } from '../../lib/dados.js'

export default function LousaPage() {
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const [moduloFiltro, setModuloFiltro] = useState(null)
  const [tick, setTick] = useState(0)

  // Atualiza o timer a cada segundo
  useEffect(() => {
    const i = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const { modulos, recursos, reservas, usuarios, filas, aulas } = state

  const modulosAtivos = modulos.filter(m => m.ativo)

  const recursosExibidos = moduloFiltro
    ? recursos.filter(r => r.moduloId === moduloFiltro)
    : recursos.filter(r => modulosAtivos.some(m => m.id === r.moduloId))

  const totalFila = filas.filter(f => f.status === 'Aguardando' && f.data === hoje()).length

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getUsuario    = id => usuarios.find(u => u.id === id)
  const getModulo     = id => modulos.find(m => m.id === id)

  const getReservaAtual = recursoId =>
    reservas.find(r =>
      r.recursoId === recursoId &&
      r.data === hoje() &&
      ['Pendente', 'Confirmada', 'Em Andamento', 'Aguardando Pagamento'].includes(r.status)
    )

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
    // Chama da fila e cria reserva automática no nome do sócio
    dispatch({ type: 'CHAMAR_DA_FILA', payload: { filaId: filaItem.id } })
    const modulo = getModulo(recurso.moduloId)
    dispatch({
      type: 'FAZER_RESERVA',
      payload: {
        usuarioId: filaItem.usuarioId,
        recursoId: recurso.id,
        moduloId:  recurso.moduloId,
        data:      hoje(),
        horaInicio: getHoraAtualExata(),
        duracao:   (modulo?.duracao || 60) + TEMPO_AQUECIMENTO,
        tipo:      'checkin',
      }
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">📋 Lousa Digital</h2>
            <p className="text-sm text-slate-400">Controle em tempo real</p>
          </div>
          <Badge variant="info">{formatDateBR(hoje())}</Badge>
        </div>

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

        {/* Banner de fila */}
        {totalFila > 0 && (
          <div className="bg-purple-900/50 border border-purple-600 rounded-xl p-3 flex items-center gap-2">
            <span>⏳</span>
            <span className="font-medium text-purple-200">{totalFila} pessoa(s) aguardando na fila</span>
          </div>
        )}

        {/* Cards das quadras */}
        <div className="space-y-3">
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

            return (
              <div key={recurso.id} className={`bg-slate-800 rounded-2xl border p-4 space-y-3 ${
                reserva?.status === 'Em Andamento' ? 'border-teal-500' :
                reserva          ? 'border-slate-600' :
                !podeUsar        ? 'border-slate-700 opacity-70' :
                'border-slate-700'
              }`}>

                {/* Header do card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{modulo?.icone}</span>
                    <div>
                      <h3 className="font-bold text-white">{recurso.nome}</h3>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <StatusRecursoBadge status={statusReal.status} size="sm" />
                        {filaRec.length > 0 && podeUsar && (
                          <Badge variant="purple" size="sm">⏳ {filaRec.length} na fila</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quadra com status manual (manutenção, interditada...) */}
                {!podeUsar && !reserva && !aulaAgora && (
                  <div className="text-center py-4 rounded-xl bg-slate-700">
                    <p className="text-2xl">{STATUS_RECURSOS[statusReal.status]?.icone}</p>
                    <p className="font-medium text-slate-200">{STATUS_RECURSOS[statusReal.status]?.label}</p>
                    {statusReal.motivo && <p className="text-xs text-slate-400 mt-1">{statusReal.motivo}</p>}
                  </div>
                )}

                {/* Aula em andamento */}
                {aulaAgora && !reserva && (
                  <div className="bg-purple-900/40 border border-purple-600 rounded-xl p-3 text-center">
                    <p className="text-purple-300 font-semibold">📚 Aula em Andamento</p>
                    <p className="text-purple-200 text-sm">{aulaAgora.nome} • {aulaAgora.professor}</p>
                    <p className="text-purple-400 text-xs">{aulaAgora.horaInicio} – {aulaAgora.horaFim}</p>
                  </div>
                )}

                {/* Reserva ativa */}
                {reserva && (
                  <div className="space-y-3">
                    <div className="bg-slate-700 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">👤 {usuario?.nome}</p>
                          <p className="text-sm text-slate-400">{reserva.horaInicio} – {reserva.horaFim}</p>
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

                      {/* Timer */}
                      {tempo !== null && (
                        <div className={`text-center py-3 rounded-xl ${
                          tempo < 300 ? 'bg-red-900/50 animate-timer-warning' :
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

                    {/* Botões de controle */}
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
                  <div className="text-center py-4 bg-emerald-900/30 rounded-xl">
                    <p className="text-emerald-400 font-semibold">✓ Livre</p>
                    {filaRec.length > 0 && (
                      <Button variant="purple" size="sm" className="mt-2" onClick={() => handleChamarFila(filaRec[0], recurso)}>
                        Chamar da Fila
                      </Button>
                    )}
                  </div>
                )}

                {/* Painel da fila */}
                {filaRec.length > 0 && podeUsar && !aulaAgora && (
                  <div className="border-t border-slate-700 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-purple-400">⏳ Fila ({filaRec.length})</p>
                    {filaRec.slice(0, 3).map((f, i) => {
                      const u = getUsuario(f.usuarioId)
                      return (
                        <div key={f.id} className="flex items-center justify-between bg-slate-700 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="text-sm text-slate-200">{u?.nome}</span>
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
    </div>
  )
}
