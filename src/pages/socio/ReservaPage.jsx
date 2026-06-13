import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { useGeolocalizacao } from '../../hooks/useGeolocalizacao.js'
import { Card, Button, ProgressSteps } from '../../components/ui/index.jsx'
import { Input } from '../../components/ui/forms.jsx'
import QuadraRadioCard from '../../components/ui/QuadraRadioCard.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import {
  hoje, formatDateBR, calcularHoraFim, gerarHorarios,
  getStatusEmTempoReal, temConflitoHorario, getHoraAtualExata,
  calcularPrevisaoFila,
} from '../../lib/utils.js'
import { TEMPO_AQUECIMENTO } from '../../lib/dados.js'
import { supabase } from '../../lib/supabase.js'

// Steps do agendamento (excluindo pagamento quando gratuito)
const STEPS_PAGAMENTO  = ['Quadra', 'Horário', 'Pagamento', 'Confirmar']
const STEPS_GRATUITO   = ['Quadra', 'Horário', 'Confirmar']
const STEP_INDEX_PAG   = { selecao: 0, horario: 1, pagamento: 2, confirmar: 3 }
const STEP_INDEX_GRAT  = { selecao: 0, horario: 1, confirmar: 2 }

export default function ReservaPage() {
  const { moduloId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const { estado: estadoGeo, verificar: verificarGeo } = useGeolocalizacao()

  const { modulos, recursos, aulas, reservas, filas, config } = state
  const modulo = modulos.find(m => m.id === parseInt(moduloId))

  const [recursoId, setRecursoId] = useState('')
  const [data, setData] = useState(hoje())
  const [horario, setHorario] = useState('')
  const [comprovanteNome, setComprovanteNome] = useState(null)
  const [comprovantePreview, setComprovantePreview] = useState(null) // data URL para preview
  const comprovanteFileRef = useRef(null)
  const [step, setStep] = useState('selecao')
  const [sucesso, setSucesso] = useState(false)
  const [erroGeo, setErroGeo] = useState('')
  const [previsao, setPrevisao] = useState(null)

  if (!modulo) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Módulo não encontrado.</p>
    </div>
  )

  const ehCheckIn    = modulo.fila_habilitada && modulo.tipo_fila === 'checkin'
  const steps        = modulo.gratuito ? STEPS_GRATUITO : STEPS_PAGAMENTO
  const stepIndex    = modulo.gratuito ? STEP_INDEX_GRAT[step] : STEP_INDEX_PAG[step]
  const duracao      = typeof modulo.duracao === 'number' ? modulo.duracao + TEMPO_AQUECIMENTO : 480
  const recursosDoModulo  = recursos.filter(r => r.moduloId === modulo.id)
  const recursoSelecionado = recursosDoModulo.find(r => r.id === parseInt(recursoId))

  const temAtivaNoModulo = () => {
    const temReserva = reservas.some(r =>
      r.usuarioId === user.id &&
      r.moduloId === modulo.id &&
      !['Cancelada', 'No-Show', 'Finalizada'].includes(r.status)
    )
    const temFila = filas.some(f =>
      f.usuarioId === user.id &&
      f.moduloId === modulo.id &&
      f.status === 'Aguardando'
    )
    return temReserva || temFila
  }

  // Dados de cada recurso para os cards radio
  const recursosComStatus = recursosDoModulo.map(r => {
    const statusReal = getStatusEmTempoReal(r, aulas, reservas)
    const diaSemana = new Date().getDay()
    const aulasHoje = aulas.filter(a =>
      a.recursoId === r.id && a.status === 'ativo' && a.diasSemana.includes(diaSemana)
    )
    const disponivel = statusReal.status === 'Livre'
    return { recurso: r, statusReal, aulasHoje, disponivel }
  })

  // Aulas de hoje no recurso selecionado
  const aulasHojeSelecionado = recursoSelecionado
    ? aulas.filter(a => {
        const dia = new Date().getDay()
        return a.recursoId === recursoSelecionado.id && a.status === 'ativo' && a.diasSemana.includes(dia)
      })
    : []

  // Horários livres sem conflito
  const horariosDisponiveis = recursoSelecionado
    ? gerarHorarios().filter(h => {
        const hFim = calcularHoraFim(h, duracao)
        if (parseInt(hFim.split(':')[0]) > 22) return false
        const dt = new Date(data + 'T12:00:00')
        const diaSemana = dt.getDay()
        const conflReserva = reservas.some(r =>
          r.recursoId === recursoSelecionado.id &&
          r.data === data &&
          !['Cancelada', 'No-Show', 'Finalizada'].includes(r.status) &&
          temConflitoHorario(h, hFim, r.horaInicio, r.horaFim)
        )
        const conflAula = aulas.some(a =>
          a.recursoId === recursoSelecionado.id &&
          a.status === 'ativo' &&
          a.diasSemana.includes(diaSemana) &&
          temConflitoHorario(h, hFim, a.horaInicio, a.horaFim)
        )
        return !conflReserva && !conflAula
      })
    : []

  async function uploadComprovante(file) {
    if (!supabase || !file) return null
    try {
      const ext  = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('comprovantes-pix')
        .upload(path, file, { upsert: false })
      if (error) return null
      return path
    } catch { return null }
  }

  async function handleCheckin() {
    if (temAtivaNoModulo()) { setErroGeo('Você já tem uma reserva ou fila ativa neste módulo!'); return }
    setErroGeo('')
    try {
      await verificarGeo({
        clubeLat: config.clube_lat, clubeLng: config.clube_lng,
        raioMetros: config.raio_checkin_metros, habilitado: config.checkin_geolocalizacao,
      })
      const usuarioStore = state.usuarios.find(u => u.matricula === user.matricula)
      const posicao = filas.filter(
        f => f.moduloId === modulo.id && f.status === 'Aguardando' && f.data === hoje()
      ).length + 1
      const estimativa = calcularPrevisaoFila(modulo.id, posicao, reservas, recursos, duracao)
      setPrevisao({ posicao, estimativa })
      dispatch({ type: 'ENTRAR_FILA', payload: { usuarioId: usuarioStore.id, moduloId: modulo.id, recursoId: null } })
      setSucesso(true)
    } catch (err) { setErroGeo(err.message) }
  }

  async function handleConfirmar() {
    if (temAtivaNoModulo()) { alert('Você já tem uma reserva ou fila ativa neste módulo!'); return }
    const usuarioStore = state.usuarios.find(u => u.matricula === user.matricula)
    const pixPath = await uploadComprovante(comprovanteFileRef.current)
    dispatch({
      type: 'FAZER_RESERVA',
      payload: {
        usuarioId: usuarioStore.id, recursoId: parseInt(recursoId), moduloId: modulo.id,
        data, horaInicio: horario, duracao, tipo: 'agendamento', comprovantePix: pixPath,
      }
    })
    setSucesso(true)
  }

  function handleArquivoComprovante(e) {
    const file = e.target.files?.[0] || null
    comprovanteFileRef.current = file
    setComprovanteNome(file?.name || null)
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setComprovantePreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setComprovantePreview(null)
    }
  }

  // ── Tela de sucesso ────────────────────────────────────────────────────────
  if (sucesso) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-5 max-w-sm mx-auto w-full">
        <div className="text-6xl">✅</div>
        <h2 className="text-xl font-bold text-slate-800 text-center">
          {ehCheckIn ? 'Check-in realizado!' : 'Reserva confirmada!'}
        </h2>

        {ehCheckIn && previsao ? (
          <div className="w-full space-y-3">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center space-y-1">
              <p className="text-purple-500 text-sm">Você está em</p>
              <p className="text-5xl font-bold text-purple-700">{previsao.posicao}º</p>
              <p className="text-purple-500 text-sm">lugar na fila</p>
            </div>
            {previsao.estimativa && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center space-y-1">
                <p className="text-teal-500 text-sm">Previsão de chamada</p>
                <p className="text-3xl font-bold text-teal-700">{previsao.estimativa}</p>
                <p className="text-teal-400 text-xs">baseado nos jogos em andamento</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full text-sm text-center text-slate-600">
            {recursoSelecionado?.nome} · {formatDateBR(data)} · {horario}
          </div>
        )}

        {/* Ação primária em destaque */}
        <Button className="w-full" onClick={() => navigate('/socio/reservas')}>
          Ver minhas reservas
        </Button>
        <button
          onClick={() => navigate('/socio')}
          className="text-sm text-slate-400 hover:text-teal-600 transition-colors"
        >
          Voltar ao início
        </button>
      </main>
    </div>
  )

  // ── Layout principal ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-5 pb-24">

        {/* Navegação de volta */}
        <button onClick={() => navigate('/socio')} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors">
          ← Início
        </button>

        {/* Cabeçalho do módulo */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">{modulo.icone}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{modulo.nome}</h2>
            <p className="text-sm text-slate-500">
              {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
              {typeof modulo.duracao === 'number' ? ` · ${modulo.duracao} min` : ` · ${modulo.duracao}`}
            </p>
          </div>
        </div>

        {/* Indicador de progresso — só no fluxo de agendamento */}
        {!ehCheckIn && (
          <ProgressSteps steps={steps} current={stepIndex ?? 0} />
        )}

        {/* ── STEP 1 — Seleção de quadra / check-in ── */}
        {step === 'selecao' && (
          <div className="space-y-4">
            {ehCheckIn ? (
              <Card className="p-4 bg-teal-50 border border-teal-200 space-y-3">
                <h4 className="font-semibold text-teal-800">📍 Check-in Presencial</h4>
                <p className="text-sm text-teal-600">
                  Você entra na fila e será chamado assim que a primeira quadra ficar livre.
                </p>
                <Button
                  className="w-full"
                  disabled={estadoGeo === 'verificando'}
                  onClick={handleCheckin}
                >
                  {estadoGeo === 'verificando' ? '📡 Verificando localização...' : 'Fazer Check-in'}
                </Button>
                {erroGeo && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-medium">⚠️ {erroGeo}</p>
                  </div>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Escolha a quadra:</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {recursosComStatus.map(({ recurso, statusReal, aulasHoje, disponivel }) => (
                    <QuadraRadioCard
                      key={recurso.id}
                      recurso={recurso}
                      statusReal={statusReal}
                      aulasHoje={aulasHoje}
                      selected={recursoId === String(recurso.id)}
                      disabled={!disponivel}
                      onClick={() => { setRecursoId(String(recurso.id)); setHorario('') }}
                    />
                  ))}
                </div>
                <Button className="w-full" disabled={!recursoId} onClick={() => setStep('horario')}>
                  Continuar →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 — Horário ── */}
        {step === 'horario' && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
              <p className="text-sm font-semibold text-teal-800">{recursoSelecionado?.nome}</p>
            </div>

            <Input
              type="date"
              label="Data:"
              value={data}
              min={hoje()}
              onChange={e => { setData(e.target.value); setHorario('') }}
            />

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Horário disponível:</label>
              {horariosDisponiveis.length === 0 ? (
                <div className="text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-xl text-center text-sm">
                  Sem horários disponíveis nesta data.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                  {horariosDisponiveis.map(h => (
                    <button
                      key={h}
                      onClick={() => setHorario(h)}
                      className={`py-3 rounded-xl text-sm font-semibold transition-colors ${
                        horario === h
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep('selecao')}>← Quadra</Button>
              <Button
                className="flex-1"
                disabled={!horario}
                onClick={() => setStep(modulo.gratuito ? 'confirmar' : 'pagamento')}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Pagamento PIX ── */}
        {step === 'pagamento' && (
          <div className="space-y-4">
            <Card className="p-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Valor a pagar</p>
                <p className="text-3xl font-bold text-slate-800">R$ {modulo.valor},00</p>
              </div>
              <span className="text-3xl">💳</span>
            </Card>

            <Card className="p-4 space-y-2">
              <p className="text-xs text-slate-500">Chave PIX ({config.pix_tipo}):</p>
              <code className="bg-slate-50 px-3 py-2.5 rounded-xl text-sm block break-all border border-slate-200 select-all">
                {config.pix_chave}
              </code>
            </Card>

            {/* Upload com preview */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Comprovante de pagamento:
              </label>
              <input
                type="file"
                accept="image/*"
                id="comp"
                className="hidden"
                onChange={handleArquivoComprovante}
              />
              <label
                htmlFor="comp"
                className={`block rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                  comprovantePreview
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 hover:border-teal-400'
                }`}
              >
                {comprovantePreview ? (
                  <div className="p-3 flex items-center gap-3">
                    <img
                      src={comprovantePreview}
                      alt="Preview do comprovante"
                      className="w-16 h-16 object-cover rounded-xl border border-emerald-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-700">✅ Comprovante anexado</p>
                      <p className="text-xs text-slate-400 truncate">{comprovanteNome}</p>
                      <p className="text-xs text-teal-500 mt-1">Toque para trocar</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-slate-400 text-2xl mb-1">📎</p>
                    <p className="text-sm text-slate-500">Toque para anexar imagem</p>
                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, etc.</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep('horario')}>← Horário</Button>
              <Button className="flex-1" disabled={!comprovanteNome} onClick={() => setStep('confirmar')}>
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4 — Confirmação ── */}
        {step === 'confirmar' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800">Confirmar reserva</h3>

            <Card className="p-4 divide-y divide-slate-100">
              {[
                ['Local',    recursoSelecionado?.nome],
                ['Data',     formatDateBR(data)],
                ['Horário',  `${horario} – ${calcularHoraFim(horario, duracao)}`],
                ['Duração',  `${modulo.duracao} min`],
                ['Valor',    modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor},00`],
              ].map(([label, valor]) => (
                <div key={label} className="flex justify-between py-2.5">
                  <span className="text-slate-500 text-sm">{label}:</span>
                  <span className="font-semibold text-sm text-slate-800">{valor}</span>
                </div>
              ))}
            </Card>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(modulo.gratuito ? 'horario' : 'pagamento')}>
                ← Voltar
              </Button>
              <Button className="flex-1" onClick={handleConfirmar}>
                ✓ Confirmar Reserva
              </Button>
            </div>
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  )
}
