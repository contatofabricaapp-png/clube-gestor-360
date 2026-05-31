import { useState } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Button, Badge } from '../../../components/ui/index.jsx'
import { Input, Select } from '../../../components/ui/forms.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import { formatDateBR } from '../../../lib/utils.js'

const PERFIL_OPTS = [
  { value: 'socio',       label: 'Sócio' },
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'admin',       label: 'Admin' },
]

const STATUS_OPTS = [
  { value: 'Ativo',     label: 'Ativo' },
  { value: 'Bloqueado', label: 'Bloqueado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const VAZIO = { id: null, nome: '', matricula: '', senha: '', perfil: 'socio', status: 'Ativo' }

const STATUS_BADGE = {
  Ativo:     'success',
  Bloqueado: 'danger',
  Cancelado: 'slate',
}

const PERFIL_BADGE = {
  admin:       'purple',
  funcionario: 'info',
  socio:       'default',
}

export default function UsuariosTab() {
  const { state, dispatch } = useStore()
  const { usuarios, config } = state

  const [busca, setBusca]               = useState('')
  const [filtroPerfil, setFiltroPerfil] = useState('todos')
  const [modalAberto, setModalAberto]   = useState(false)
  const [confirmarId, setConfirmarId]   = useState(null)
  const [bloquearId, setBloquearId]     = useState(null)
  const [diasBloqueio, setDiasBloqueio] = useState(config.punicao_dias_bloqueio)
  const [form, setForm]                 = useState(VAZIO)
  const [erros, setErros]               = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const usuariosFiltrados = usuarios
    .filter(u => filtroPerfil === 'todos' || u.perfil === filtroPerfil)
    .filter(u =>
      !busca ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.matricula.toLowerCase().includes(busca.toLowerCase())
    )

  const abrirNovo = () => {
    setForm(VAZIO)
    setErros({})
    setModalAberto(true)
  }

  const abrirEditar = (u) => {
    setForm({ ...u })
    setErros({})
    setModalAberto(true)
  }

  const validar = () => {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome'
    if (!form.matricula.trim()) e.matricula = 'Informe a matrícula'
    if (!form.id && !form.senha.trim()) e.senha = 'Informe a senha inicial'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const salvar = () => {
    if (!validar()) return
    dispatch({ type: 'SALVAR_USUARIO', payload: { ...form } })
    setModalAberto(false)
  }

  const desbloquear = (id) => {
    dispatch({ type: 'DESBLOQUEAR_USUARIO', payload: { usuarioId: id } })
  }

  const bloquear = () => {
    const ate = new Date(Date.now() + diasBloqueio * 86400000).toISOString().split('T')[0]
    dispatch({ type: 'BLOQUEAR_USUARIO', payload: { usuarioId: bloquearId, ate } })
    setBloquearId(null)
  }

  const zerarNoShows = (id) => {
    const u = usuarios.find(u => u.id === id)
    dispatch({ type: 'SALVAR_USUARIO', payload: { ...u, noshow_count: 0 } })
  }

  return (
    <div className="space-y-4">

      {/* Busca + filtro + novo */}
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={abrirNovo}>+ Novo</Button>
      </div>
      <div className="space-y-2">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou matrícula..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
        />
        <div className="flex gap-2">
          {['todos', 'socio', 'funcionario', 'admin'].map(p => (
            <button
              key={p}
              onClick={() => setFiltroPerfil(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroPerfil === p
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === 'todos' ? 'Todos' : p === 'socio' ? 'Sócios' : p === 'funcionario' ? 'Funcionários' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {usuariosFiltrados.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado</Card>
      ) : (
        usuariosFiltrados.map(u => (
          <Card key={u.id} className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{u.nome}</p>
                  <Badge variant={PERFIL_BADGE[u.perfil]} size="sm">{u.perfil}</Badge>
                  <Badge variant={STATUS_BADGE[u.status] ?? 'default'} size="sm">{u.status}</Badge>
                </div>
                <p className="text-xs text-slate-500">{u.matricula}</p>
                {u.noshow_count > 0 && (
                  <p className="text-xs text-amber-600">⚠️ {u.noshow_count} no-show(s)</p>
                )}
                {u.bloqueado_ate && (
                  <p className="text-xs text-red-500">🔒 Bloqueado até {formatDateBR(u.bloqueado_ate)}</p>
                )}
              </div>
              <button
                onClick={() => abrirEditar(u)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 text-sm flex-shrink-0"
              >✏️</button>
            </div>

            {/* Ações rápidas */}
            <div className="flex gap-2 flex-wrap">
              {u.status === 'Bloqueado' ? (
                <Button variant="success" size="sm" onClick={() => desbloquear(u.id)}>
                  🔓 Desbloquear
                </Button>
              ) : u.perfil === 'socio' ? (
                <Button variant="warning" size="sm" onClick={() => { setBloquearId(u.id); setDiasBloqueio(config.punicao_dias_bloqueio) }}>
                  🔒 Bloquear
                </Button>
              ) : null}
              {u.noshow_count > 0 && (
                <Button variant="secondary" size="sm" onClick={() => zerarNoShows(u.id)}>
                  ↩ Zerar no-shows
                </Button>
              )}
            </div>
          </Card>
        ))
      )}

      {/* Modal criar/editar */}
      <Modal
        isOpen={modalAberto}
        title={form.id ? 'Editar Usuário' : 'Novo Usuário'}
        onClose={() => setModalAberto(false)}
      >
        <div className="space-y-4">
          <Input
            label="Nome completo"
            value={form.nome}
            onChange={e => set('nome', e.target.value)}
            error={erros.nome}
          />
          <Input
            label="Matrícula"
            value={form.matricula}
            onChange={e => set('matricula', e.target.value)}
            error={erros.matricula}
          />
          {!form.id && (
            <Input
              label="Senha inicial"
              type="password"
              value={form.senha}
              onChange={e => set('senha', e.target.value)}
              error={erros.senha}
            />
          )}
          <Select
            label="Perfil"
            value={form.perfil}
            onChange={e => set('perfil', e.target.value)}
            options={PERFIL_OPTS}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={e => set('status', e.target.value)}
            options={STATUS_OPTS}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1" onClick={salvar}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal bloquear */}
      <Modal
        isOpen={bloquearId !== null}
        title="Bloquear Sócio"
        onClose={() => setBloquearId(null)}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Dias de bloqueio"
            type="number"
            min={1}
            value={diasBloqueio}
            onChange={e => setDiasBloqueio(Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            O sócio ficará bloqueado por {diasBloqueio} dia(s) a partir de hoje.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setBloquearId(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={bloquear}>Bloquear</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
