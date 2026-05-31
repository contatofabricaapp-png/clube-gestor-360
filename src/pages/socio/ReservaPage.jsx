import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { useGeolocalizacao } from '../../hooks/useGeolocalizacao.js'
import { Card, Button, Badge } from '../../components/ui/index.jsx'
import { Input, Select } from '../../components/ui/forms.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import {
  hoje, formatDateBR, calcularHoraFim, gerarHorarios,
  getStatusEmTempoReal, temConflitoHorario, getHoraAtualExata,
  calcularPrevisaoFila,
} from '../../lib/utils.js'
import { TEMPO_AQUECIMENTO } from '../../lib/dados.js'
import { supabase } from '../../lib/supabase.js'

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
  const [comprovante, setComprovante] = useState(null)   // nome do arquivo (display)
  const comprovanteFileRef = useRef(null)                // File object para upload
  const [step, setStep] = useState('selecao') // selecao | horario | pagamento | confirmar
  const [sucesso, setSucesso] = useState(false)
  const [erroGeo, setErroGeo] = useState('')
  const [previsao, setPrevisao] = useState(null)

  if (!modulo) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Módulo não encontrado.</p>
    </div>
  )

  const duracao = typeof modulo.duracao === 'number' ? modulo.duracao + TEMPO_AQUECIMENTO : 480
  const recursosDoModulo = recursos.filter(r => r.moduloId === modulo.id)
  const recursoSelecionado = recursosDoModulo.find(r => r.id === parseInt(recursoId))

  // Verifica se sócio já tem reserva ou fila ativa
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

  // Opções do select de quadra com status real
  const opcoesRecursos = recursosDoModulo.map(r => {
    const statusReal = getStatusEmTempoReal(r, aulas, reservas)
    const diaSemana = new Date().getDay()
    const aulasHoje = aulas.filter(a =>
      a.recursoId === r.id && a.status === 'ativo' && a.diasSemana.includes(diaSemana)
    )
    let sufixo = ''
    if (statusReal.status !== 'Livre') sufixo = ` (${statusReal.status})`
    else if (aulasHoje.length > 0) sufixo = ` (Aula: ${aulasHoje.map(a => `${a.horaInicio}-${a.horaFim}`).join(', ')})`
    return { value: r.id, label: r.nome + sufixo }
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

  // Faz upload do comprovante para o Supabase Storage; retorna o path ou null
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
    } catch {
      return null
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleCheckin() {
    if (temAtivaNoModulo()) {
      setErroGeo('Você já tem uma reserva ou fila ativa neste módulo!')
      return
    }
    setErroGeo('')
    try {
      await verificarGeo({
        clubeLat:  config.clube_lat,
        clubeLng:  config.clube_lng,
        raioMetros: config.raio_checkin_metros,
        habilitado: config.checkin_geolocalizacao,
      })
      const usuarioStore = state.usuarios.find(u => u.matricula === user.matricula)
      const posicao = filas.filter(
        f => f.moduloId === modulo.id && f.status === 'Aguardando' && f.data === hoje()
      ).length + 1
      const estimativa = calcularPrevisaoFila(modulo.id, posicao, reservas, recursos, duracao)
      setPrevisao({ posicao, estimativa })
      dispatch({
        type: 'ENTRAR_FILA',
        payload: { usuarioId: usuarioStore.id, moduloId: modulo.id, recursoId: null }
      })
      setSucesso(true)
    } catch (err) {
      setErroGeo(err.message)
    }
  }

  async function handleConfirmar() {
    if (temAtivaNoModulo()) {
      alert('Você já tem uma reserva ou fila ativa neste módulo!')
      return
    }
    const usuarioStore = state.usuarios.find(u => u.matricula === user.matricula)

    // Upload do comprovante se houver arquivo selecionado
    const pixPath = await uploadComprovante(comprovanteFileRef.current)

    dispatch({
      type: 'FAZER_RESERVA',
      payload: {
        usuarioId: usuarioStore.id,
        recursoId: parseInt(recursoId),
        moduloId: modulo.id,
        data,
        horaInicio: horario,
        duracao,
        tipo: 'agendamento',
        comprovantePix: pixPath,
      }
    })
    setSucesso(true)
  }

  // ── Tela de sucesso ────────────────────────────────────────────────────────

  if (sucesso) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-6xl">✅</div>
        <h2 className="text-xl font-bold text-slate-800 text-center">
          {step === 'selecao' ? 'Check-in realizado!' : 'Reserva confirmada!'}
        </h2>

        {step === 'selecao' && previsao ? (
          <div className="w-full max-w-xs space-y-3">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center space-y-1">
              <p className="text-purple-500 text-sm">Você está em</p>
              <p className="text-4xl font-bold text-purple-700">{previsao.posicao}º</p>
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
          <p className="text-slate-500 text-center text-sm">
            {step === 'selecao'
              ? 'Você entrou na fila. Aguarde ser chamado.'
              : `${recursoSelecionado?.nome} · ${formatDateBR(data)} · ${horario}`}
          </p>
        )}

        <Button className="w-full max-w-xs" onClick={() => navigate('/socio/reservas')}>Ver minhas reservas</Button>
        <Button variant="secondary" className="w-full max-w-xs" onClick={() => navigate('/socio')}>Voltar ao início</Button>
      </main>
    </div>
  )

  // ── Layout principal ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">

        {/* Cabeçalho do módulo */}
        <button onClick={() => navigate('/socio')} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          ← Voltar
        </button>

        <div className="flex items-center gap-3">
          <span className="text-4xl">{modulo.icone}</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{modulo.nome}</h2>
            <p className="text-sm text-slate-500">
              {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
              {typeof modulo.duracao === 'number' ? ` · ${modulo.duracao}min` : ` · ${modulo.duracao}`}
            </p>
          </div>
        </div>

        {/* STEP 1 — Seleção de quadra */}
        {step === 'selecao' && (
          <div className="space-y-4">

            {/* Check-in OU Agendamento */}
            {modulo.fila_habilitada && modulo.tipo_fila === 'checkin' ? (
              /* Fila pura — sem seleção de quadra */
              <Card className="p-4 bg-teal-50 border border-teal-200 space-y-2">
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
              <div className="space-y-4">
                <Select
                  label="Selecione a quadra:"
                  options={[{ value: '', label: 'Escolha uma quadra...' }, ...opcoesRecursos]}
                  value={recursoId}
                  onChange={e => { setRecursoId(e.target.value); setHorario('') }}
                />
                {aulasHojeSelecionado.length > 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                    <p className="text-sm font-semibold text-purple-800">📚 Aulas hoje nesta quadra:</p>
                    {aulasHojeSelecionado.map(a => (
                      <p key={a.id} className="text-sm text-purple-600">
                        {a.horaInicio}–{a.horaFim}: {a.nome} ({a.professor})
                      </p>
                    ))}
                  </div>
                )}
                <Button className="w-full" disabled={!recursoId} onClick={() => setStep('horario')}>
                  Continuar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Escolha de data e horário */}
        {step === 'horario' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{recursoSelecionado?.nome}</p>

            <Input
              type="date"
              label="Data:"
              value={data}
              min={hoje()}
              onChange={e => { setData(e.target.value); setHorario('') }}
            />

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Horário disponível:</label>
              {horariosDisponiveis.length === 0 ? (
                <p className="text-amber-600 p-4 bg-amber-50 rounded-xl text-center text-sm">
                  Sem horários disponíveis nesta data.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                  {horariosDisponiveis.map(h => (
                    <button
                      key={h}
                      onClick={() => setHorario(h)}
                      className={`p-2 rounded-xl text-sm font-medium transition-colors ${
                        horario === h
                          ? 'bg-teal-500 text-white'
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
              <Button variant="secondary" onClick={() => setStep('selecao')}>Voltar</Button>
              <Button
                className="flex-1"
                disabled={!horario}
                onClick={() => setStep(modulo.gratuito ? 'confirmar' : 'pagamento')}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — Pagamento PIX (módulos pagos) */}
        {step === 'pagamento' && (
          <div className="space-y-4">
            <Card className="p-4 bg-slate-50">
              <p className="text-sm text-slate-500">Valor a pagar:</p>
              <p className="text-3xl font-bold text-slate-800">R$ {modulo.valor},00</p>
            </Card>

            <Card className="p-4 space-y-2">
              <p className="text-sm text-slate-500">Chave PIX ({config.pix_tipo}):</p>
              <code className="bg-slate-100 px-3 py-2 rounded-lg text-sm block break-all">
                {config.pix_chave}
              </code>
            </Card>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Comprovante de pagamento:</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  id="comp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    comprovanteFileRef.current = file
                    setComprovante(file?.name || null)
                  }}
                />
                <label htmlFor="comp" className="cursor-pointer">
                  {comprovante
                    ? <span className="text-emerald-600 font-medium">✅ {comprovante}</span>
                    : <span className="text-slate-400">📎 Clique para anexar imagem</span>
                  }
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep('horario')}>Voltar</Button>
              <Button className="flex-1" disabled={!comprovante} onClick={() => setStep('confirmar')}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — Confirmação */}
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
                <div key={label} className="flex justify-between py-2">
                  <span className="text-slate-500 text-sm">{label}:</span>
                  <span className="font-medium text-sm text-slate-800">{valor}</span>
                </div>
              ))}
            </Card>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(modulo.gratuito ? 'horario' : 'pagamento')}>
                Voltar
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
