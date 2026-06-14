import { useState } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Button, Badge } from '../../../components/ui/index.jsx'
import { Input, Select } from '../../../components/ui/forms.jsx'
import Modal from '../../../components/ui/Modal.jsx'

const STATUS_OPTIONS = [
  { value: 'Livre',       label: '🟢 Livre' },
  { value: 'Manutencao',  label: '🟡 Manutenção' },
  { value: 'Interditada', label: '🔴 Interditada' },
  { value: 'Limpeza',     label: '⚪ Limpeza' },
]

const STATUS_BADGE = {
  Livre:       'success',
  Manutencao:  'warning',
  Interditada: 'danger',
  Limpeza:     'slate',
  Reservada:   'purple',
  Ocupada:     'info',
}

const VAZIO = { id: null, moduloId: '', nome: '', capacidade: 4, status: 'Livre', motivo: '' }

export default function QuadrasTab() {
  const { state, dispatch } = useStore()
  const { recursos, modulos } = state

  const [modalAberto, setModalAberto]   = useState(false)
  const [confirmarId, setConfirmarId]   = useState(null)
  const [filtroModulo, setFiltroModulo] = useState('todos')
  const [form, setForm]                 = useState(VAZIO)
  const [erros, setErros]               = useState({})

  const modulosAtivos = modulos.filter(m => m.ativo)

  const recursosFiltrados = filtroModulo === 'todos'
    ? recursos
    : recursos.filter(r => r.moduloId === Number(filtroModulo))

  // Agrupados por módulo
  const gruposPorModulo = modulosAtivos
    .map(m => ({
      modulo: m,
      itens:  recursosFiltrados.filter(r => r.moduloId === m.id),
    }))
    .filter(g => g.itens.length > 0)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const abrirNovo    = ()  => { setForm(VAZIO); setErros({}); setModalAberto(true) }
  const abrirEditar  = (r) => { setForm({ ...r, motivo: r.motivo ?? '' }); setErros({}); setModalAberto(true) }

  const validar = () => {
    const e = {}
    if (!form.moduloId)            e.moduloId   = 'Selecione o módulo'
    if (!form.nome.trim())         e.nome        = 'Informe o nome'
    if (!form.capacidade || form.capacidade < 1) e.capacidade = 'Informe a capacidade'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const salvar = () => {
    if (!validar()) return
    dispatch({
      type: 'SALVAR_RECURSO',
      payload: { ...form, id: form.id ?? null, moduloId: Number(form.moduloId), capacidade: Number(form.capacidade), motivo: form.motivo || null },
    })
    setModalAberto(false)
  }

  const remover = (id) => {
    dispatch({ type: 'REMOVER_RECURSO', payload: { recursoId: id } })
    setConfirmarId(null)
  }

  const modulosOpts = [
    { value: '', label: '— Selecione o módulo —' },
    ...modulosAtivos.map(m => ({ value: m.id, label: `${m.icone} ${m.nome}` })),
  ]

  return (
    <div className="space-y-4">

      {/* Filtro + botão novo */}
      <div className="flex items-center gap-2">
        <select
          value={filtroModulo}
          onChange={e => setFiltroModulo(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:border-teal-500 outline-none"
        >
          <option value="todos">Todos os módulos</option>
          {modulosAtivos.map(m => (
            <option key={m.id} value={m.id}>{m.icone} {m.nome}</option>
          ))}
        </select>
        <Button variant="primary" size="sm" onClick={abrirNovo}>+ Nova</Button>
      </div>

      {recursosFiltrados.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">Nenhuma quadra cadastrada</Card>
      ) : (
        <div className="space-y-5">
          {gruposPorModulo.map(({ modulo: m, itens }) => (
            <div key={m.id} className="space-y-2">
              {/* Cabeçalho do grupo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.icone}</span>
                  <h3 className="font-bold text-slate-700 text-sm">{m.nome}</h3>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {itens.length} quadra{itens.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-px flex-1 bg-slate-100 mx-3" />
              </div>

              {/* Cards das quadras */}
              {itens.map(r => (
                <Card key={r.id} className="p-3 group">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{r.nome}</p>
                      <p className="text-xs text-slate-500">Cap. {r.capacidade} pessoas</p>
                      {r.motivo && <p className="text-xs text-slate-400 truncate mt-0.5">{r.motivo}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={STATUS_BADGE[r.status] ?? 'default'} size="sm">
                        {r.status === 'Manutencao' ? 'Manutenção' : r.status}
                      </Badge>
                      <button
                        onClick={() => abrirEditar(r)}
                        className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                        title="Editar"
                      >✏️</button>
                      <button
                        onClick={() => setConfirmarId(r.id)}
                        className="p-2 hover:bg-red-50 active:bg-red-100 rounded-lg text-red-400 transition-colors"
                        title="Remover"
                      >🗑️</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Modal editar/criar */}
      <Modal isOpen={modalAberto} title={form.id ? 'Editar Quadra' : 'Nova Quadra'} onClose={() => setModalAberto(false)}>
        <div className="space-y-4">
          <Select label="Módulo" value={form.moduloId} onChange={e => set('moduloId', e.target.value)} options={modulosOpts} error={erros.moduloId} />
          <Input label="Nome da quadra" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Quadra de Tênis 01" error={erros.nome} />
          <Input label="Capacidade (pessoas)" type="number" min={1} value={form.capacidade} onChange={e => set('capacidade', e.target.value)} error={erros.capacidade} />
          <Select label="Status inicial" value={form.status} onChange={e => set('status', e.target.value)} options={STATUS_OPTIONS} />
          <Input label="Motivo (opcional)" value={form.motivo} onChange={e => set('motivo', e.target.value)} placeholder="Ex: Reforma prevista para junho" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={salvar}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmar exclusão */}
      <Modal isOpen={confirmarId !== null} title="Remover Quadra" onClose={() => setConfirmarId(null)} size="sm">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Tem certeza que deseja remover esta quadra? As reservas e aulas existentes que referenciam ela podem ficar sem vínculo.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmarId(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={() => remover(confirmarId)}>Remover</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
