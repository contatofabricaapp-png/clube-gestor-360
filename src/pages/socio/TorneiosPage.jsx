import { useState } from 'react'
import { useStore } from '../../store/useStore.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Card, Badge, Button } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import {
  FORMATO_LABELS, STATUS_LABELS, QUEM_LANCA_LABELS, FASES_LABEL,
  calcularTabela, calcularRanking, podeLinçarResultado,
} from '../../lib/torneios.js'
import { formatDateBR } from '../../lib/utils.js'
import Modal from '../../components/ui/Modal.jsx'
import { Input } from '../../components/ui/forms.jsx'

const STATUS_BADGE = {
  inscricoes:   'info',
  em_andamento: 'success',
  finalizado:   'default',
}

const FORMATO_ICONE = {
  eliminatorio:    '🏆',
  liga:            '📊',
  grupos_mata_mata:'⚽',
  ranking:         '📈',
  barragem:        '🔄',
}

export default function TorneiosPage() {
  const { state, dispatch } = useStore()
  const { user } = useAuth()
  const { torneios, grupos, inscricoes, partidas, usuarios, modulos } = state

  const [view, setView]       = useState('lista')
  const [torneioSel, setTorneioSel] = useState(null)
  const [subView, setSubView] = useState('info')
  const [filtro, setFiltro]   = useState('todos')   // todos | inscricoes | em_andamento
  const [modalResultado, setModalResultado] = useState(null)
  const [resultadoForm, setResultadoForm]   = useState({ placar1: '', vencedorId: '' })

  const getNome = (uid) => usuarios.find(u => u.id === uid)?.nome ?? '—'
  const getModulo = (mid) => modulos.find(m => m.id === mid)

  const torneiosFiltrados = torneios.filter(t => {
    if (filtro === 'inscricoes')   return t.status === 'inscricoes'
    if (filtro === 'em_andamento') return t.status === 'em_andamento'
    return true
  })

  const inscritos = torneioSel
    ? inscricoes.filter(i => i.torneioId === torneioSel.id && i.status === 'confirmada')
    : []

  const gruposTorneio = torneioSel
    ? grupos.filter(g => g.torneioId === torneioSel.id).sort((a, b) => a.ordem - b.ordem)
    : []

  const partidasTorneio = torneioSel
    ? partidas.filter(p => p.torneioId === torneioSel.id).sort((a, b) => (a.rodada ?? 0) - (b.rodada ?? 0))
    : []

  const estaInscrito = torneioSel
    ? !!inscritos.find(i => i.usuarioId === user?.id)
    : false

  const minhasPartidas = torneioSel
    ? partidasTorneio.filter(p => p.jogador1Id === user?.id || p.jogador2Id === user?.id)
    : []

  const abrirDetalhe = (t) => {
    setTorneioSel(t)
    setView('detalhe')
    setSubView(t.status === 'em_andamento' ? 'partidas' : 'info')
  }

  const inscrever = () => {
    dispatch({ type: 'INSCREVER_NO_TORNEIO', payload: { torneioId: torneioSel.id, usuarioId: user.id } })
  }

  const cancelarInscricao = () => {
    const ins = inscritos.find(i => i.usuarioId === user.id)
    if (ins) dispatch({ type: 'CANCELAR_INSCRICAO', payload: { inscricaoId: ins.id } })
  }

  const abrirResultado = (p) => {
    setModalResultado(p)
    setResultadoForm({ placar1: p.placar1 ?? '', vencedorId: '' })
  }

  const salvarResultado = () => {
    dispatch({
      type: 'LANCAR_RESULTADO',
      payload: {
        partidaId:  modalResultado.id,
        placar1:    resultadoForm.placar1 || null,
        placar2:    null,
        vencedorId: resultadoForm.vencedorId ? Number(resultadoForm.vencedorId) : null,
      },
    })
    setModalResultado(null)
  }

  // Tabela geral (liga/ranking)
  const tabelaGeral = torneioSel && ['liga', 'ranking'].includes(torneioSel.formato)
    ? torneioSel.formato === 'ranking'
      ? calcularRanking(partidasTorneio, inscritos, torneioSel)
      : calcularTabela(partidasTorneio, inscritos, torneioSel)
    : null

  const SUB_VIEWS = torneioSel ? [
    { id: 'info',     label: 'Info' },
    { id: 'partidas', label: 'Partidas' },
    ...(['barragem', 'grupos_mata_mata'].includes(torneioSel.formato) ? [{ id: 'grupos', label: 'Grupos' }] : []),
    ...(['liga', 'barragem', 'grupos_mata_mata', 'ranking'].includes(torneioSel.formato) ? [{ id: 'tabela', label: torneioSel.formato === 'ranking' ? 'Ranking' : 'Tabela' }] : []),
    ...(['eliminatorio', 'grupos_mata_mata'].includes(torneioSel.formato) ? [{ id: 'chave', label: 'Chaveamento' }] : []),
  ] : []

  // ════════════════════════════════════════════════════════════════════════════
  // LISTA
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'lista') return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header titulo="Torneios & Ligas" subtitulo="Competições do clube" />

      <main className="flex-1 p-4 pb-24 space-y-4">
        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { id: 'todos',       label: 'Todos' },
            { id: 'inscricoes',  label: 'Inscrições' },
            { id: 'em_andamento',label: 'Em andamento' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filtro === f.id ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {torneiosFiltrados.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-3xl mb-3">🏆</p>
            <p className="text-slate-500 text-sm">Nenhum torneio encontrado</p>
          </Card>
        ) : (
          torneiosFiltrados.map(t => {
            const mod = getModulo(t.moduloId)
            const qtd = inscricoes.filter(i => i.torneioId === t.id && i.status === 'confirmada').length
            const inscrito = !!inscricoes.find(i => i.torneioId === t.id && i.usuarioId === user?.id && i.status === 'confirmada')
            return (
              <Card
                key={t.id}
                className="p-4 active:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => abrirDetalhe(t)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl flex-shrink-0">
                      {FORMATO_ICONE[t.formato]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{t.nome}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {mod?.icone} {mod?.nome} · {FORMATO_LABELS[t.formato]}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {qtd} inscrito{qtd !== 1 ? 's' : ''}
                        {t.maxInscritos ? ` / ${t.maxInscritos}` : ''}
                        {t.dataFim ? ` · até ${formatDateBR(t.dataFim)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge variant={STATUS_BADGE[t.status] ?? 'default'} size="sm">
                      {STATUS_LABELS[t.status]}
                    </Badge>
                    {inscrito && <Badge variant="teal" size="sm">Inscrito ✓</Badge>}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </main>
      <BottomNav />
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // DETALHE
  // ════════════════════════════════════════════════════════════════════════════
  const mod = getModulo(torneioSel.moduloId)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      {/* Sub-header com voltar */}
      <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => setView('lista')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors text-sm">← Voltar</button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{torneioSel.nome}</p>
          <p className="text-xs text-slate-400">{mod?.icone} {FORMATO_LABELS[torneioSel.formato]}</p>
        </div>
        <Badge variant={STATUS_BADGE[torneioSel.status] ?? 'default'} size="sm">{STATUS_LABELS[torneioSel.status]}</Badge>
      </div>

      <main className="flex-1 p-4 pb-24 space-y-4">
        {/* Botão de inscrição */}
        {torneioSel.status === 'inscricoes' && torneioSel.inscricoes_abertas && (
          estaInscrito ? (
            <Card className="p-3 bg-teal-50 border-teal-200 flex items-center justify-between">
              <span className="text-sm text-teal-700 font-medium">✓ Você está inscrito</span>
              <button onClick={cancelarInscricao} className="text-xs text-red-500 hover:underline">Cancelar</button>
            </Card>
          ) : (
            <button
              onClick={inscrever}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-2xl text-sm transition-colors"
            >
              Inscrever-se neste torneio
            </button>
          )
        )}

        {/* Sub-abas */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {SUB_VIEWS.map(sv => (
            <button
              key={sv.id}
              onClick={() => setSubView(sv.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                subView === sv.id ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {sv.label}
            </button>
          ))}
        </div>

        {/* ── Info ── */}
        {subView === 'info' && (
          <div className="space-y-3">
            <Card className="p-4 space-y-3">
              {torneioSel.descricao && (
                <p className="text-sm text-slate-600 leading-relaxed">{torneioSel.descricao}</p>
              )}
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div><span className="text-slate-400">Formato</span><p className="font-medium text-slate-700">{FORMATO_LABELS[torneioSel.formato]}</p></div>
                <div><span className="text-slate-400">Resultado por</span><p className="font-medium text-slate-700">{QUEM_LANCA_LABELS[torneioSel.quem_lanca_resultado]}</p></div>
                <div><span className="text-slate-400">Início</span><p className="font-medium text-slate-700">{torneioSel.dataInicio ? formatDateBR(torneioSel.dataInicio) : '—'}</p></div>
                <div><span className="text-slate-400">Fim</span><p className="font-medium text-slate-700">{torneioSel.dataFim ? formatDateBR(torneioSel.dataFim) : '—'}</p></div>
                <div><span className="text-slate-400">Inscritos</span><p className="font-medium text-slate-700">{inscritos.length}{torneioSel.maxInscritos ? ` / ${torneioSel.maxInscritos}` : ''}</p></div>
                <div><span className="text-slate-400">Partidas</span><p className="font-medium text-slate-700">{partidasTorneio.length}</p></div>
              </div>
            </Card>

            {/* Minhas partidas neste torneio */}
            {minhasPartidas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Minhas partidas</p>
                {minhasPartidas.map(p => (
                  <PartidaCard key={p.id} p={p} getNome={getNome} grupos={grupos} user={user} torneio={torneioSel} onResultado={abrirResultado} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Partidas ── */}
        {subView === 'partidas' && (
          <div className="space-y-2">
            {partidasTorneio.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 text-sm">Nenhuma partida agendada ainda</Card>
            ) : (
              partidasTorneio.map(p => (
                <PartidaCard key={p.id} p={p} getNome={getNome} grupos={grupos} user={user} torneio={torneioSel} onResultado={abrirResultado} />
              ))
            )}
          </div>
        )}

        {/* ── Tabela / Ranking ── */}
        {subView === 'tabela' && (
          <div className="space-y-4">
            {['barragem', 'grupos_mata_mata'].includes(torneioSel.formato) ? (
              gruposTorneio.map(g => {
                const partidasGrupo = partidasTorneio.filter(p => p.grupoId === g.id)
                const inscritosGrupo = inscritos.filter(i => i.grupoId === g.id)
                const tabela = calcularTabela(partidasGrupo, inscritosGrupo, torneioSel)
                return (
                  <div key={g.id} className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">{g.nome}</p>
                    <TabelaSocio tabela={tabela} getNome={getNome} userId={user?.id}
                      promovidos={torneioSel.promovidos_por_grupo}
                      rebaixados={torneioSel.rebaixados_por_grupo}
                    />
                  </div>
                )
              })
            ) : (
              <TabelaSocio tabela={tabelaGeral ?? []} getNome={getNome} userId={user?.id}
                promovidos={null} rebaixados={null}
              />
            )}
          </div>
        )}

        {/* ── Grupos ── */}
        {subView === 'grupos' && (
          <div className="space-y-4">
            {gruposTorneio.map(g => {
              const membros = inscritos.filter(i => i.grupoId === g.id)
              return (
                <Card key={g.id} className="p-4 space-y-2">
                  <p className="font-bold text-slate-700 text-sm">{g.nome}</p>
                  {membros.length === 0 ? (
                    <p className="text-xs text-slate-400">Aguardando sorteio</p>
                  ) : (
                    membros.map((ins, idx) => (
                      <div key={ins.id} className={`flex items-center gap-2 py-1.5 ${ins.usuarioId === user?.id ? 'font-bold text-teal-700' : 'text-slate-700'}`}>
                        <span className="text-xs text-slate-400 w-4">{idx + 1}.</span>
                        <span className="text-sm">{getNome(ins.usuarioId)}</span>
                        {ins.usuarioId === user?.id && <Badge variant="teal" size="sm">Você</Badge>}
                      </div>
                    ))
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* ── Chaveamento eliminatório ── */}
        {subView === 'chave' && (
          <div className="space-y-3">
            {['quartas', 'oitavas', 'semi', 'final'].map(fase => {
              const ps = partidasTorneio.filter(p => p.fase === fase)
              if (!ps.length) return null
              return (
                <div key={fase} className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{FASES_LABEL[fase]}</p>
                  {ps.map(p => (
                    <PartidaCard key={p.id} p={p} getNome={getNome} grupos={grupos} user={user} torneio={torneioSel} onResultado={abrirResultado} />
                  ))}
                </div>
              )
            })}
            {partidasTorneio.filter(p => ['quartas','oitavas','semi','final'].includes(p.fase)).length === 0 && (
              <Card className="p-8 text-center text-slate-400 text-sm">Chaveamento não gerado ainda</Card>
            )}
          </div>
        )}
      </main>

      {/* Modal lançar resultado */}
      {modalResultado && (
        <Modal isOpen={!!modalResultado} title="Lançar Resultado" onClose={() => setModalResultado(null)} size="sm">
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="font-bold text-slate-800">{getNome(modalResultado.jogador1Id)}</p>
              <p className="text-xs text-slate-400 my-1">vs</p>
              <p className="font-bold text-slate-800">{getNome(modalResultado.jogador2Id)}</p>
            </div>
            <Input label="Placar (ex: 6-3 6-2)" placeholder="6-3 6-2" value={resultadoForm.placar1} onChange={e => setResultadoForm(f => ({ ...f, placar1: e.target.value }))} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Vencedor</label>
              <div className="flex gap-2">
                {[
                  { id: modalResultado.jogador1Id, label: getNome(modalResultado.jogador1Id) },
                  { id: modalResultado.jogador2Id, label: getNome(modalResultado.jogador2Id) },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setResultadoForm(f => ({ ...f, vencedorId: opt.id }))}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      resultadoForm.vencedorId === opt.id
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setModalResultado(null)}>Cancelar</Button>
              <Button variant="primary" className="flex-1" onClick={salvarResultado} disabled={!resultadoForm.vencedorId}>Salvar</Button>
            </div>
          </div>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}

// ── Componente de card de partida ─────────────────────────────────────────────
function PartidaCard({ p, getNome, grupos, user, torneio, onResultado }) {
  const grupo = p.grupoId ? grupos.find(g => g.id === p.grupoId) : null
  const isMinhaPartida = p.jogador1Id === user?.id || p.jogador2Id === user?.id
  const posso = torneio ? podeLinçarResultado(torneio, user, p.jogador1Id, p.jogador2Id) : false

  return (
    <Card className={`p-3 ${isMinhaPartida ? 'border-teal-200 bg-teal-50/30' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <Badge variant="slate" size="sm">{FASES_LABEL[p.fase] ?? p.fase}</Badge>
            {grupo && <Badge variant="info" size="sm">{grupo.nome}</Badge>}
            {p.data && <span className="text-xs text-slate-400">{formatDateBR(p.data)}{p.horario ? ` ${p.horario}` : ''}</span>}
          </div>
          <div className="space-y-1">
            <div className={`flex items-center justify-between ${p.vencedorId === p.jogador1Id ? 'font-bold' : ''}`}>
              <span className={`text-sm ${p.jogador1Id === user?.id ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>
                {getNome(p.jogador1Id)}
                {p.jogador1Id === user?.id && ' (você)'}
              </span>
              {p.vencedorId === p.jogador1Id && <span className="text-xs text-teal-600 font-bold">✓ Venceu</span>}
            </div>
            <div className={`flex items-center justify-between ${p.vencedorId === p.jogador2Id ? 'font-bold' : ''}`}>
              <span className={`text-sm ${p.jogador2Id === user?.id ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>
                {p.jogador2Id ? getNome(p.jogador2Id) : <span className="text-slate-300">BYE</span>}
                {p.jogador2Id === user?.id && ' (você)'}
              </span>
              {p.vencedorId === p.jogador2Id && <span className="text-xs text-teal-600 font-bold">✓ Venceu</span>}
            </div>
          </div>
          {p.placar1 && <p className="text-xs text-slate-400 mt-1">Placar: {p.placar1}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Badge variant={p.status === 'finalizada' ? 'success' : 'slate'} size="sm">
            {p.status === 'finalizada' ? 'Finalizada' : 'Aguardando'}
          </Badge>
          {posso && p.status !== 'finalizada' && p.jogador2Id && (
            <button
              onClick={() => onResultado(p)}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
            >
              Resultado
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

// ── Tabela simplificada para sócio ───────────────────────────────────────────
function TabelaSocio({ tabela, getNome, userId, promovidos, rebaixados }) {
  if (tabela.length === 0) return (
    <Card className="p-6 text-center text-slate-400 text-sm">Nenhuma partida finalizada ainda</Card>
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-3 py-2 text-slate-500 w-6">#</th>
            <th className="text-left px-3 py-2 text-slate-500">Jogador</th>
            <th className="text-center px-2 py-2 text-slate-500">J</th>
            <th className="text-center px-2 py-2 text-slate-500">V</th>
            <th className="text-center px-2 py-2 text-slate-600 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {tabela.map((row, idx) => {
            const isEu = row.usuarioId === userId
            const isPromovido = promovidos && idx < promovidos
            const isRebaixado = rebaixados && idx >= tabela.length - rebaixados
            return (
              <tr key={row.usuarioId} className={`border-b border-slate-50 ${isEu ? 'bg-teal-50' : isPromovido ? 'bg-emerald-50/50' : isRebaixado ? 'bg-red-50/50' : ''}`}>
                <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                <td className="px-3 py-2.5">
                  <span className={`font-semibold ${isEu ? 'text-teal-700' : isRebaixado ? 'text-red-600' : 'text-slate-800'}`}>
                    {getNome(row.usuarioId)}
                    {isEu && ' ★'}
                    {isPromovido && !isEu && <span className="ml-1 text-emerald-500 text-xs">↑</span>}
                    {isRebaixado && !isEu && <span className="ml-1 text-red-400 text-xs">↓</span>}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-center text-slate-500">{row.j}</td>
                <td className="px-2 py-2.5 text-center text-slate-500">{row.v}</td>
                <td className="px-2 py-2.5 text-center font-bold text-teal-700">{row.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {(promovidos || rebaixados) && (
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs">
          {promovidos > 0 && <span className="text-emerald-600">↑ Promovido</span>}
          {rebaixados > 0 && <span className="text-red-500">↓ Rebaixado</span>}
        </div>
      )}
    </div>
  )
}
