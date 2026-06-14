import { useState } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Button, Badge } from '../../../components/ui/index.jsx'
import { Input, Select } from '../../../components/ui/forms.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import { DIAS_SEMANA } from '../../../lib/dados.js'

const VAZIO = {
  id: null, recursoId: '', nome: '', professor: '',
  horaInicio: '08:00', horaFim: '10:00', diasSemana: [], status: 'ativo',
}

const diasLabel = (dias) => {
  if (!dias?.length) return 'Nenhum dia'
  if (dias.length === 7) return 'Todos os dias'
  if (dias.length === 5 && [1,2,3,4,5].every(d => dias.includes(d))) return 'Seg–Sex'
  return dias.sort().map(d => DIAS_SEMANA.find(ds => ds.id === d)?.curto).join(', ')
}

export default function AulasTab() {
  const { state, dispatch } = useStore()
  const { aulas, recursos, modulos } = state

  const [modalAberto, setModalAberto] = useState(false)
  const [confirmarId, setConfirmarId] = useState(null)
  const [filtroMod, setFiltroMod]     = useState('todos')
  const [form, setForm]               = useState(VAZIO)
  const [erros, setErros]             = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDia = (diaId) =>
    setForm(f => ({
      ...f,
      diasSemana: f.diasSemana.includes(diaId)
        ? f.diasSemana.filter(d => d !== diaId)
        : [...f.diasSemana, diaId],
    }))

  const getModuloDoRecurso = (recursoId) => {
    const rec = recursos.find(r => r.id === recursoId)
    return rec ? modulos.find(m => m.id === rec.moduloId) : null
  }

  const aulasFiltradas = filtroMod === 'todos'
    ? aulas
    : aulas.filter(a => {
        const rec = recursos.find(r => r.id === a.recursoId)
        return rec?.moduloId === Number(filtroMod)
      })

  // Agrupadas por módulo
  const modulosAtivos = modulos.filter(m => m.ativo)
  const gruposPorModulo = modulosAtivos
    .map(m => ({
      modulo: m,
      itens:  aulasFiltradas.filter(a => {
        const rec = recursos.find(r => r.id === a.recursoId)
        return rec?.moduloId === m.id
      }),
    }))
    .filter(g => g.itens.length > 0)

  const abrirNovo   = ()  => { setForm(VAZIO); setErros({}); setModalAberto(true) }
  const abrirEditar = (a) => { setForm({ ...a }); setErros({}); setModalAberto(true) }

  const validar = () => {
    const e = {}
    if (!form.recursoId)          e.recursoId  = 'Selecione a quadra'
    if (!form.nome.trim())        e.nome        = 'Informe o nome da aula'
    if (!form.professor.trim())   e.professor   = 'Informe o professor'
    if (!form.horaInicio)         e.horaInicio  = 'Informe o horário de início'
    if (!form.horaFim)            e.horaFim     = 'Informe o horário de fim'
    if (form.horaInicio >= form.horaFim) e.horaFim = 'Fim deve ser após o início'
    if (form.diasSemana.length === 0)    e.diasSemana = 'Selecione ao menos 1 dia'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const salvar = () => {
    if (!validar()) return
    dispatch({ type: 'SALVAR_AULA', payload: { ...form, id: form.id ?? null, recursoId: Number(form.recursoId) } })
    setModalAberto(false)
  }

  const remover = (id) => {
    dispatch({ type: 'REMOVER_AULA', payload: { aulaId: id } })
    setConfirmarId(null)
  }

  const recursoOpts = [
    { value: '', label: '— Selecione a quadra —' },
    ...recursos.map(r => {
      const m = modulos.find(m => m.id === r.moduloId)
      return { value: r.id, label: `${m?.icone ?? ''} ${r.nome}` }
    }),
  ]

  return (
    <div className="space-y-4">

      {/* Filtro + botão novo */}
      <div className="flex items-center gap-2">
        <select
          value={filtroMod}
          onChange={e => setFiltroMod(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:border-teal-500 outline-none"
        >
          <option value="todos">Todos os módulos</option>
          {modulosAtivos.map(m => (
            <option key={m.id} value={m.id}>{m.icone} {m.nome}</option>
          ))}
        </select>
        <Button variant="primary" size="sm" onClick={abrirNovo}>+ Nova</Button>
      </div>

      {aulasFiltradas.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">Nenhuma aula cadastrada</Card>
      ) : (
        <div className="space-y-5">
          {gruposPorModulo.map(({ modulo: m, itens }) => (
            <div key={m.id} className="space-y-2">
              {/* Cabeçalho do grupo */}
              <div className="flex items-center gap-2">
                <span className="text-xl">{m.icone}</span>
                <h3 className="font-bold text-slate-700 text-sm">{m.nome}</h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {itens.length} aula{itens.length !== 1 ? 's' : ''}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {itens.map(a => {
                const rec = recursos.find(r => r.id === a.recursoId)
                return (
                  <Card key={a.id} className="p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800 text-sm truncate">{a.nome}</p>
                          <Badge variant={a.status === 'ativo' ? 'success' : 'slate'} size="sm">
                            {a.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          👤 {a.professor} · {rec?.nome ?? '—'}
                        </p>
                        <p className="text-xs text-slate-400">
                          🕐 {a.horaInicio}–{a.horaFim} · {diasLabel(a.diasSemana)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => abrirEditar(a)}
                          className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                          title="Editar"
                        >✏️</button>
                        <button
                          onClick={() => setConfirmarId(a.id)}
                          className="p-2 hover:bg-red-50 active:bg-red-100 rounded-lg text-red-400 transition-colors"
                          title="Remover"
                        >🗑️</button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal isOpen={modalAberto} title={form.id ? 'Editar Aula' : 'Nova Aula'} onClose={() => setModalAberto(false)}>
        <div className="space-y-4">
          <Select label="Quadra" value={form.recursoId} onChange={e => set('recursoId', e.target.value)} options={recursoOpts} error={erros.recursoId} />
          <Input label="Nome da aula" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Treino Performance" error={erros.nome} />
          <Input label="Professor" value={form.professor} onChange={e => set('professor', e.target.value)} placeholder="Ex: Daniel" error={erros.professor} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Início" type="time" value={form.horaInicio} onChange={e => set('horaInicio', e.target.value)} error={erros.horaInicio} />
            <Input label="Fim"    type="time" value={form.horaFim}    onChange={e => set('horaFim',    e.target.value)} error={erros.horaFim} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Dias da semana</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDia(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.diasSemana.includes(d.id) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.curto}
                </button>
              ))}
            </div>
            {erros.diasSemana && <p className="text-sm text-red-500">{erros.diasSemana}</p>}
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={e => set('status', e.target.value)}
            options={[{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }]}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={salvar}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmar exclusão */}
      <Modal isOpen={confirmarId !== null} title="Remover Aula" onClose={() => setConfirmarId(null)} size="sm">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Tem certeza que deseja remover esta aula do sistema?</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmarId(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={() => remover(confirmarId)}>Remover</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
