import { useState } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Button, Badge } from '../../../components/ui/index.jsx'
import { Input, Select } from '../../../components/ui/forms.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import {
  FORMATO_LABELS, STATUS_LABELS, QUEM_LANCA_LABELS, FASES_LABEL,
  calcularTabela, calcularRanking,
  gerarChaveamentoEliminatorio, gerarRoundRobin,
} from '../../../lib/torneios.js'
import { formatDateBR } from '../../../lib/utils.js'

const FORMATO_OPTS = Object.entries(FORMATO_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTS  = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))
const QUEM_OPTS    = Object.entries(QUEM_LANCA_LABELS).map(([value, label]) => ({ value, label }))

const STATUS_BADGE = {
  inscricoes:   'info',
  em_andamento: 'success',
  finalizado:   'default',
}

const VAZIO_TORNEIO = {
  id: null, nome: '', moduloId: '', formato: 'eliminatorio', status: 'inscricoes',
  dataInicio: '', dataFim: '', descricao: '', maxInscritos: 8,
  inscricoes_abertas: true, quem_lanca_resultado: 'admin_funcionario',
  pontos_vitoria: 3, pontos_empate: 1, pontos_derrota: 0,
  jogadores_por_grupo: 4, promovidos_por_grupo: 2, rebaixados_por_grupo: 1,
}

export default function TorneiosTab() {
  const { state, dispatch } = useStore()
  const { torneios, grupos, inscricoes, partidas, usuarios, modulos } = state

  const [view, setView]               = useState('lista')   // lista | detalhe
  const [torneioSel, setTorneioSel]   = useState(null)
  const [subView, setSubView]         = useState('info')    // info | inscritos | grupos | partidas | tabela
  const [modalTorneio, setModalTorneio] = useState(false)
  const [modalResultado, setModalResultado] = useState(null) // partida selecionada
  const [modalPartida, setModalPartida] = useState(false)
  const [modalAddInscrito, setModalAddInscrito] = useState(false)
  const [form, setForm]               = useState(VAZIO_TORNEIO)
  const [erros, setErros]             = useState({})
  const [resultadoForm, setResultadoForm] = useState({ placar1: '', placar2: '', vencedorId: '' })
  const [novaPartidaForm, setNovaPartidaForm] = useState({ jogador1Id: '', jogador2Id: '', data: '', horario: '', fase: 'liga', rodada: '' })
  const [addInscritoId, setAddInscritoId] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getNome = (uid) => usuarios.find(u => u.id === uid)?.nome ?? '—'
  const getModulo = (mid) => modulos.find(m => m.id === mid)

  // ── Helpers do torneio selecionado ────────────────────────────────────────
  const inscritos = torneioSel
    ? inscricoes.filter(i => i.torneioId === torneioSel.id && i.status === 'confirmada')
    : []

  const gruposTorneio = torneioSel
    ? grupos.filter(g => g.torneioId === torneioSel.id).sort((a, b) => a.ordem - b.ordem)
    : []

  const partidasTorneio = torneioSel
    ? partidas.filter(p => p.torneioId === torneioSel.id).sort((a, b) => (a.rodada ?? 0) - (b.rodada ?? 0))
    : []

  // ── Abrir / fechar torneio ─────────────────────────────────────────────────
  const abrirDetalhe = (t) => { setTorneioSel(t); setView('detalhe'); setSubView('info') }
  const voltarLista  = ()  => { setView('lista'); setTorneioSel(null) }

  // ── Salvar torneio ─────────────────────────────────────────────────────────
  const validar = () => {
    const e = {}
    if (!form.nome.trim())  e.nome     = 'Informe o nome'
    if (!form.moduloId)     e.moduloId = 'Selecione o módulo'
    if (!form.dataInicio)   e.dataInicio = 'Informe a data de início'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const salvarTorneio = () => {
    if (!validar()) return
    const payload = {
      ...form,
      moduloId:         Number(form.moduloId),
      maxInscritos:     form.maxInscritos ? Number(form.maxInscritos) : null,
      pontos_vitoria:   Number(form.pontos_vitoria),
      pontos_empate:    Number(form.pontos_empate),
      pontos_derrota:   Number(form.pontos_derrota),
      jogadores_por_grupo:  Number(form.jogadores_por_grupo),
      promovidos_por_grupo: Number(form.promovidos_por_grupo),
      rebaixados_por_grupo: Number(form.rebaixados_por_grupo),
    }
    dispatch({ type: 'SALVAR_TORNEIO', payload })
    setModalTorneio(false)
    // Atualiza torneioSel se estava editando
    if (form.id && torneioSel?.id === form.id) setTorneioSel({ ...torneioSel, ...payload })
  }

  // ── Gerar partidas ─────────────────────────────────────────────────────────
  const gerarPartidas = () => {
    if (!torneioSel) return
    const ids = inscritos.map(i => i.usuarioId)

    let novas = []
    if (torneioSel.formato === 'eliminatorio') {
      novas = gerarChaveamentoEliminatorio(torneioSel.id, ids)
    } else if (torneioSel.formato === 'liga') {
      novas = gerarRoundRobin(torneioSel.id, null, ids, 'liga')
    } else if (torneioSel.formato === 'barragem' || torneioSel.formato === 'grupos_mata_mata') {
      gruposTorneio.forEach(g => {
        const idsGrupo = inscritos.filter(i => i.grupoId === g.id).map(i => i.usuarioId)
        if (idsGrupo.length >= 2) {
          novas = [...novas, ...gerarRoundRobin(torneioSel.id, g.id, idsGrupo, 'grupos')]
        }
      })
    } else if (torneioSel.formato === 'ranking') {
      // ranking não gera partidas automáticas — admin adiciona uma a uma
      alert('No ranking, adicione as partidas manualmente conforme são jogadas.')
      return
    }

    if (novas.length === 0) {
      alert('Nenhuma partida gerada. Verifique se há inscritos e grupos configurados.')
      return
    }
    dispatch({ type: 'GERAR_PARTIDAS', payload: { torneioId: torneioSel.id, partidas: novas } })
    setSubView('partidas')
  }

  // ── Lançar resultado ───────────────────────────────────────────────────────
  const abrirResultado = (p) => {
    setModalResultado(p)
    setResultadoForm({ placar1: p.placar1 ?? '', placar2: p.placar2 ?? '', vencedorId: p.vencedorId ?? '' })
  }

  const salvarResultado = () => {
    dispatch({
      type: 'LANCAR_RESULTADO',
      payload: {
        partidaId:  modalResultado.id,
        placar1:    resultadoForm.placar1 || null,
        placar2:    resultadoForm.placar2 || null,
        vencedorId: resultadoForm.vencedorId ? Number(resultadoForm.vencedorId) : null,
      },
    })
    setModalResultado(null)
  }

  // ── Adicionar partida manual (ranking / extras) ────────────────────────────
  const salvarNovaPartida = () => {
    if (!novaPartidaForm.jogador1Id || !novaPartidaForm.jogador2Id) return
    dispatch({
      type: 'SALVAR_PARTIDA',
      payload: {
        id: null,
        torneioId: torneioSel.id,
        grupoId: null,
        fase: novaPartidaForm.fase || 'liga',
        rodada: novaPartidaForm.rodada ? Number(novaPartidaForm.rodada) : null,
        jogador1Id: Number(novaPartidaForm.jogador1Id),
        jogador2Id: Number(novaPartidaForm.jogador2Id),
        placar1: null, placar2: null, vencedorId: null,
        status: 'aguardando',
        data: novaPartidaForm.data || null,
        horario: novaPartidaForm.horario || null,
      },
    })
    setModalPartida(false)
    setNovaPartidaForm({ jogador1Id: '', jogador2Id: '', data: '', horario: '', fase: 'liga', rodada: '' })
  }

  // ── Adicionar inscrito manualmente ─────────────────────────────────────────
  const adicionarInscrito = () => {
    if (!addInscritoId) return
    dispatch({ type: 'INSCREVER_NO_TORNEIO', payload: { torneioId: torneioSel.id, usuarioId: Number(addInscritoId) } })
    setModalAddInscrito(false)
    setAddInscritoId('')
  }

  // ── Tabela / Ranking ───────────────────────────────────────────────────────
  const tabelaGeral = torneioSel && (torneioSel.formato === 'liga' || torneioSel.formato === 'ranking')
    ? torneioSel.formato === 'ranking'
      ? calcularRanking(partidasTorneio, inscritos, torneioSel)
      : calcularTabela(partidasTorneio, inscritos, torneioSel)
    : null

  const modulosOpts = [
    { value: '', label: '— Selecione —' },
    ...modulos.filter(m => m.ativo).map(m => ({ value: m.id, label: `${m.icone} ${m.nome}` })),
  ]

  const inscritosOpts = [
    { value: '', label: '— Selecione —' },
    ...inscritos.map(i => ({ value: i.usuarioId, label: getNome(i.usuarioId) })),
  ]

  const naoInscritos = usuarios.filter(u =>
    u.perfil === 'socio' && u.status === 'Ativo' &&
    !inscritos.find(i => i.usuarioId === u.id)
  )

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER — Lista
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'lista') return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-700 text-sm">
          Torneios & Ligas
          <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {torneios.length}
          </span>
        </h3>
        <Button variant="primary" size="sm" onClick={() => { setForm(VAZIO_TORNEIO); setErros({}); setModalTorneio(true) }}>
          + Novo
        </Button>
      </div>

      {torneios.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">Nenhum torneio cadastrado</Card>
      ) : (
        torneios.map(t => {
          const mod = getModulo(t.moduloId)
          const qtdInscritos = inscricoes.filter(i => i.torneioId === t.id && i.status === 'confirmada').length
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0" onClick={() => abrirDetalhe(t)} style={{ cursor: 'pointer' }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base">{mod?.icone ?? '🏆'}</span>
                    <p className="font-bold text-slate-800 text-sm">{t.nome}</p>
                    <Badge variant={STATUS_BADGE[t.status] ?? 'default'} size="sm">
                      {STATUS_LABELS[t.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {FORMATO_LABELS[t.formato]} · {qtdInscritos} inscrito{qtdInscritos !== 1 ? 's' : ''}
                    {t.maxInscritos ? ` / ${t.maxInscritos}` : ''}
                  </p>
                  {t.dataInicio && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateBR(t.dataInicio)}{t.dataFim ? ` → ${formatDateBR(t.dataFim)}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setForm({ ...t, moduloId: String(t.moduloId) }); setErros({}); setModalTorneio(true) }}
                    className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                  >✏️</button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVER_TORNEIO', payload: { torneioId: t.id } })}
                    className="p-2 hover:bg-red-50 active:bg-red-100 rounded-lg text-red-400 transition-colors"
                  >🗑️</button>
                </div>
              </div>
            </Card>
          )
        })
      )}

      {/* Modal criar/editar torneio */}
      <Modal isOpen={modalTorneio} title={form.id ? 'Editar Torneio' : 'Novo Torneio'} onClose={() => setModalTorneio(false)}>
        <div className="space-y-4">
          <Input label="Nome" value={form.nome} onChange={e => set('nome', e.target.value)} error={erros.nome} />
          <Select label="Modalidade" value={form.moduloId} onChange={e => set('moduloId', e.target.value)} options={modulosOpts} error={erros.moduloId} />
          <Select label="Formato" value={form.formato} onChange={e => set('formato', e.target.value)} options={FORMATO_OPTS} />
          <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)} options={STATUS_OPTS} />
          <Select label="Quem lança resultado" value={form.quem_lanca_resultado} onChange={e => set('quem_lanca_resultado', e.target.value)} options={QUEM_OPTS} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data início" type="date" value={form.dataInicio} onChange={e => set('dataInicio', e.target.value)} error={erros.dataInicio} />
            <Input label="Data fim" type="date" value={form.dataFim} onChange={e => set('dataFim', e.target.value)} />
          </div>
          <Input label="Máx. inscritos (opcional)" type="number" min={2} value={form.maxInscritos ?? ''} onChange={e => set('maxInscritos', e.target.value)} />
          <Input label="Descrição / Regulamento" value={form.descricao} onChange={e => set('descricao', e.target.value)} />

          {/* Pontuação (liga, barragem, grupos) */}
          {['liga', 'barragem', 'grupos_mata_mata', 'ranking'].includes(form.formato) && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
              <p className="text-xs font-semibold text-slate-600">Pontuação</p>
              <div className="grid grid-cols-3 gap-2">
                <Input label="Vitória" type="number" min={0} value={form.pontos_vitoria} onChange={e => set('pontos_vitoria', e.target.value)} />
                <Input label="Empate" type="number" min={0} value={form.pontos_empate} onChange={e => set('pontos_empate', e.target.value)} />
                <Input label="Derrota" type="number" min={0} value={form.pontos_derrota} onChange={e => set('pontos_derrota', e.target.value)} />
              </div>
            </div>
          )}

          {/* Grupos / Barragem */}
          {['barragem', 'grupos_mata_mata'].includes(form.formato) && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
              <p className="text-xs font-semibold text-slate-600">Configuração de grupos</p>
              <div className="grid grid-cols-3 gap-2">
                <Input label="Jogadores/grupo" type="number" min={2} value={form.jogadores_por_grupo} onChange={e => set('jogadores_por_grupo', e.target.value)} />
                <Input label="Promovidos" type="number" min={0} value={form.promovidos_por_grupo} onChange={e => set('promovidos_por_grupo', e.target.value)} />
                <Input label="Rebaixados" type="number" min={0} value={form.rebaixados_por_grupo} onChange={e => set('rebaixados_por_grupo', e.target.value)} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.inscricoes_abertas} onChange={e => set('inscricoes_abertas', e.target.checked)} className="w-4 h-4 accent-teal-600" />
              <span className="text-sm text-slate-700">Inscrições abertas para sócios</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalTorneio(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={salvarTorneio}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER — Detalhe do torneio
  // ════════════════════════════════════════════════════════════════════════════
  const mod = getModulo(torneioSel.moduloId)
  const SUB_VIEWS = [
    { id: 'info',     label: 'Info' },
    { id: 'inscritos',label: 'Inscritos' },
    ...(['barragem', 'grupos_mata_mata'].includes(torneioSel.formato) ? [{ id: 'grupos', label: 'Grupos' }] : []),
    { id: 'partidas', label: 'Partidas' },
    ...(['liga', 'barragem', 'grupos_mata_mata', 'ranking'].includes(torneioSel.formato) ? [{ id: 'tabela', label: torneioSel.formato === 'ranking' ? 'Ranking' : 'Tabela' }] : []),
  ]

  return (
    <div className="space-y-4">
      {/* Cabeçalho detalhe */}
      <div className="flex items-center gap-3">
        <button onClick={voltarLista} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">← </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{mod?.icone} {torneioSel.nome}</p>
          <p className="text-xs text-slate-500">{FORMATO_LABELS[torneioSel.formato]} · {STATUS_LABELS[torneioSel.status]}</p>
        </div>
        <Badge variant={STATUS_BADGE[torneioSel.status] ?? 'default'} size="sm">{STATUS_LABELS[torneioSel.status]}</Badge>
      </div>

      {/* Sub-abas */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {SUB_VIEWS.map(sv => (
          <button
            key={sv.id}
            onClick={() => setSubView(sv.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              subView === sv.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sv.label}
          </button>
        ))}
      </div>

      {/* ── Info ── */}
      {subView === 'info' && (
        <div className="space-y-3">
          <Card className="p-4 space-y-2">
            {torneioSel.descricao && <p className="text-sm text-slate-600">{torneioSel.descricao}</p>}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><span className="font-medium text-slate-700">Formato:</span> {FORMATO_LABELS[torneioSel.formato]}</div>
              <div><span className="font-medium text-slate-700">Resultado por:</span> {QUEM_LANCA_LABELS[torneioSel.quem_lanca_resultado]}</div>
              <div><span className="font-medium text-slate-700">Início:</span> {torneioSel.dataInicio ? formatDateBR(torneioSel.dataInicio) : '—'}</div>
              <div><span className="font-medium text-slate-700">Fim:</span> {torneioSel.dataFim ? formatDateBR(torneioSel.dataFim) : '—'}</div>
              <div><span className="font-medium text-slate-700">Inscritos:</span> {inscritos.length}{torneioSel.maxInscritos ? ` / ${torneioSel.maxInscritos}` : ''}</div>
              <div><span className="font-medium text-slate-700">Partidas:</span> {partidasTorneio.length}</div>
            </div>
          </Card>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" size="sm" onClick={gerarPartidas}>⚡ Gerar Partidas</Button>
            <Button variant="secondary" size="sm" onClick={() => { setForm({ ...torneioSel, moduloId: String(torneioSel.moduloId) }); setErros({}); setModalTorneio(true) }}>✏️ Editar</Button>
          </div>
        </div>
      )}

      {/* ── Inscritos ── */}
      {subView === 'inscritos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{inscritos.length} inscrito{inscritos.length !== 1 ? 's' : ''}</p>
            <Button variant="primary" size="sm" onClick={() => setModalAddInscrito(true)}>+ Adicionar</Button>
          </div>
          {inscritos.length === 0 ? (
            <Card className="p-6 text-center text-slate-400 text-sm">Nenhum inscrito ainda</Card>
          ) : (
            inscritos.map((ins, idx) => (
              <Card key={ins.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{getNome(ins.usuarioId)}</p>
                    {ins.grupoId && (
                      <p className="text-xs text-slate-400">{grupos.find(g => g.id === ins.grupoId)?.nome}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'CANCELAR_INSCRICAO', payload: { inscricaoId: ins.id } })}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-400 text-xs transition-colors"
                >✕</button>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Grupos ── */}
      {subView === 'grupos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{gruposTorneio.length} grupo{gruposTorneio.length !== 1 ? 's' : ''}</p>
            <Button variant="primary" size="sm" onClick={() => {
              const ordem = gruposTorneio.length + 1
              const letra = String.fromCharCode(64 + ordem)
              dispatch({ type: 'SALVAR_GRUPO', payload: { id: null, torneioId: torneioSel.id, nome: `Grupo ${letra}`, ordem } })
            }}>+ Grupo</Button>
          </div>
          {gruposTorneio.length === 0 ? (
            <Card className="p-6 text-center text-slate-400 text-sm">Nenhum grupo criado</Card>
          ) : (
            gruposTorneio.map(g => {
              const membros = inscritos.filter(i => i.grupoId === g.id)
              const semGrupo = inscritos.filter(i => !i.grupoId)
              return (
                <Card key={g.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-700 text-sm">{g.nome}</p>
                    <div className="flex gap-1">
                      <Badge variant="slate" size="sm">{membros.length} jogadores</Badge>
                      <button onClick={() => dispatch({ type: 'REMOVER_GRUPO', payload: { grupoId: g.id } })} className="p-1 hover:bg-red-50 rounded text-red-400 text-xs">🗑️</button>
                    </div>
                  </div>
                  {membros.length === 0 ? (
                    <p className="text-xs text-slate-400">Nenhum jogador neste grupo</p>
                  ) : (
                    <div className="space-y-1.5">
                      {membros.map(ins => (
                        <div key={ins.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{getNome(ins.usuarioId)}</span>
                          <button onClick={() => dispatch({ type: 'ATRIBUIR_GRUPO', payload: { inscricaoId: ins.id, grupoId: null } })} className="text-xs text-slate-400 hover:text-red-500">remover</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {semGrupo.length > 0 && (
                    <div className="border-t border-slate-100 pt-2">
                      <p className="text-xs text-slate-400 mb-1.5">Adicionar ao grupo:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {semGrupo.map(ins => (
                          <button
                            key={ins.id}
                            onClick={() => dispatch({ type: 'ATRIBUIR_GRUPO', payload: { inscricaoId: ins.id, grupoId: g.id } })}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs rounded-lg transition-colors"
                          >
                            + {getNome(ins.usuarioId)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* ── Partidas ── */}
      {subView === 'partidas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{partidasTorneio.length} partida{partidasTorneio.length !== 1 ? 's' : ''}</p>
            <Button variant="primary" size="sm" onClick={() => setModalPartida(true)}>+ Partida</Button>
          </div>
          {partidasTorneio.length === 0 ? (
            <Card className="p-6 text-center text-slate-400 text-sm">
              Nenhuma partida. Clique em "Gerar Partidas" na aba Info.
            </Card>
          ) : (
            partidasTorneio.map(p => {
              const grupo = p.grupoId ? grupos.find(g => g.id === p.grupoId) : null
              return (
                <Card key={p.id} className={`p-3 border-l-4 ${p.status === 'finalizada' ? 'border-l-teal-400' : p.status === 'aguardando' ? 'border-l-slate-200' : 'border-l-amber-400'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <Badge variant="slate" size="sm">{FASES_LABEL[p.fase] ?? p.fase}</Badge>
                        {grupo && <Badge variant="info" size="sm">{grupo.nome}</Badge>}
                        {p.data && <span className="text-xs text-slate-400">{formatDateBR(p.data)}{p.horario ? ` ${p.horario}` : ''}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${p.vencedorId === p.jogador1Id ? 'text-teal-700' : 'text-slate-700'}`}>
                          {getNome(p.jogador1Id)}
                        </span>
                        <span className="text-xs text-slate-400">vs</span>
                        <span className={`text-sm font-semibold ${p.vencedorId === p.jogador2Id ? 'text-teal-700' : 'text-slate-700'}`}>
                          {p.jogador2Id ? getNome(p.jogador2Id) : <span className="text-slate-300">BYE</span>}
                        </span>
                      </div>
                      {p.placar1 && (
                        <p className="text-xs text-slate-500 mt-0.5">{p.placar1}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant={p.status === 'finalizada' ? 'success' : 'slate'} size="sm">
                        {p.status === 'finalizada' ? 'Final.' : 'Ag.'}
                      </Badge>
                      <button
                        onClick={() => abrirResultado(p)}
                        className="p-2 hover:bg-teal-50 rounded-lg text-teal-600 text-sm transition-colors"
                        title="Lançar resultado"
                      >📝</button>
                      <button
                        onClick={() => dispatch({ type: 'REMOVER_PARTIDA', payload: { partidaId: p.id } })}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-400 text-sm transition-colors"
                      >🗑️</button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* ── Tabela / Ranking ── */}
      {subView === 'tabela' && (
        <div className="space-y-3">
          {['barragem', 'grupos_mata_mata'].includes(torneioSel.formato) ? (
            gruposTorneio.map(g => {
              const partidasGrupo = partidasTorneio.filter(p => p.grupoId === g.id)
              const inscritosGrupo = inscritos.filter(i => i.grupoId === g.id)
              const tabela = calcularTabela(partidasGrupo, inscritosGrupo, torneioSel)
              return (
                <div key={g.id} className="space-y-2">
                  <p className="text-sm font-bold text-slate-700">{g.nome}</p>
                  <TabelaClassificacao tabela={tabela} getNome={getNome}
                    promovidos={torneioSel.promovidos_por_grupo}
                    rebaixados={torneioSel.rebaixados_por_grupo}
                    formato={torneioSel.formato}
                  />
                </div>
              )
            })
          ) : (
            <TabelaClassificacao tabela={tabelaGeral ?? []} getNome={getNome}
              promovidos={null} rebaixados={null}
              formato={torneioSel.formato}
            />
          )}
        </div>
      )}

      {/* Modal lançar resultado */}
      {modalResultado && (
        <Modal isOpen={!!modalResultado} title="Lançar Resultado" onClose={() => setModalResultado(null)} size="sm">
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="font-bold text-slate-800">{getNome(modalResultado.jogador1Id)}</p>
              <p className="text-xs text-slate-400 my-1">vs</p>
              <p className="font-bold text-slate-800">{getNome(modalResultado.jogador2Id)}</p>
            </div>
            <Input label="Placar / Resultado" placeholder="Ex: 6-3 6-2" value={resultadoForm.placar1} onChange={e => setResultadoForm(f => ({ ...f, placar1: e.target.value }))} />
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
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      resultadoForm.vencedorId === opt.id
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
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

      {/* Modal nova partida */}
      <Modal isOpen={modalPartida} title="Nova Partida" onClose={() => setModalPartida(false)}>
        <div className="space-y-4">
          <Select label="Jogador 1" value={novaPartidaForm.jogador1Id} onChange={e => setNovaPartidaForm(f => ({ ...f, jogador1Id: e.target.value }))} options={inscritosOpts} />
          <Select label="Jogador 2" value={novaPartidaForm.jogador2Id} onChange={e => setNovaPartidaForm(f => ({ ...f, jogador2Id: e.target.value }))} options={inscritosOpts} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data" type="date" value={novaPartidaForm.data} onChange={e => setNovaPartidaForm(f => ({ ...f, data: e.target.value }))} />
            <Input label="Horário" type="time" value={novaPartidaForm.horario} onChange={e => setNovaPartidaForm(f => ({ ...f, horario: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalPartida(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={salvarNovaPartida}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal adicionar inscrito */}
      <Modal isOpen={modalAddInscrito} title="Adicionar Inscrito" onClose={() => setModalAddInscrito(false)} size="sm">
        <div className="space-y-4">
          <Select
            label="Sócio"
            value={addInscritoId}
            onChange={e => setAddInscritoId(e.target.value)}
            options={[
              { value: '', label: '— Selecione —' },
              ...naoInscritos.map(u => ({ value: u.id, label: u.nome })),
            ]}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalAddInscrito(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={adicionarInscrito} disabled={!addInscritoId}>Adicionar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Componente de tabela de classificação reutilizável
function TabelaClassificacao({ tabela, getNome, promovidos, rebaixados, formato }) {
  if (tabela.length === 0) return (
    <Card className="p-6 text-center text-slate-400 text-sm">Nenhuma partida finalizada ainda</Card>
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-3 py-2 text-slate-500 font-semibold w-6">#</th>
            <th className="text-left px-3 py-2 text-slate-500 font-semibold">Jogador</th>
            <th className="text-center px-2 py-2 text-slate-500 font-semibold">J</th>
            <th className="text-center px-2 py-2 text-slate-500 font-semibold">V</th>
            <th className="text-center px-2 py-2 text-slate-500 font-semibold">D</th>
            <th className="text-center px-2 py-2 text-slate-600 font-bold">{formato === 'ranking' ? 'Pts' : 'Pts'}</th>
          </tr>
        </thead>
        <tbody>
          {tabela.map((row, idx) => {
            const isPromovido = promovidos && idx < promovidos
            const isRebaixado = rebaixados && idx >= tabela.length - rebaixados
            return (
              <tr key={row.usuarioId} className={`border-b border-slate-50 ${isPromovido ? 'bg-teal-50' : isRebaixado ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2 text-slate-400 font-bold">{idx + 1}</td>
                <td className="px-3 py-2">
                  <span className={`font-semibold ${isPromovido ? 'text-teal-700' : isRebaixado ? 'text-red-600' : 'text-slate-800'}`}>
                    {getNome(row.usuarioId)}
                  </span>
                  {isPromovido && <span className="ml-1 text-xs text-teal-500">↑</span>}
                  {isRebaixado && <span className="ml-1 text-xs text-red-400">↓</span>}
                </td>
                <td className="px-2 py-2 text-center text-slate-500">{row.j}</td>
                <td className="px-2 py-2 text-center text-slate-500">{row.v}</td>
                <td className="px-2 py-2 text-center text-slate-500">{row.d}</td>
                <td className="px-2 py-2 text-center font-bold text-teal-700">{row.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {(promovidos || rebaixados) && (
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-4 text-xs">
          {promovidos > 0 && <span className="text-teal-600">↑ Promovido</span>}
          {rebaixados > 0 && <span className="text-red-500">↓ Rebaixado</span>}
        </div>
      )}
    </div>
  )
}
