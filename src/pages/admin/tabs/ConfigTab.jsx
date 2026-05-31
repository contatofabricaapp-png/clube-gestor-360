import { useState } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Button, Toggle, Badge } from '../../../components/ui/index.jsx'
import { Input, Select } from '../../../components/ui/forms.jsx'
import { Notification } from '../../../components/ui/index.jsx'

const PIX_TIPOS = [
  { value: 'CPF',     label: 'CPF' },
  { value: 'CNPJ',   label: 'CNPJ' },
  { value: 'Email',  label: 'E-mail' },
  { value: 'Celular',label: 'Celular' },
  { value: 'Aleatória', label: 'Chave Aleatória' },
]

const TIPO_FILA_OPTS = [
  { value: 'checkin',     label: 'Check-in (walk-in, sem escolher quadra)' },
  { value: 'agendamento', label: 'Agendamento (escolhe quadra e horário)' },
]

export default function ConfigTab() {
  const { state, dispatch } = useStore()
  const { config, modulos } = state

  const [cfg, setCfg]         = useState({ ...config })
  const [notif, setNotif]     = useState(null)
  const [secao, setSecao]     = useState('clube')

  const set = (k, v) => setCfg(f => ({ ...f, [k]: v }))

  const salvarConfig = () => {
    dispatch({ type: 'SALVAR_CONFIG', payload: cfg })
    setNotif({ msg: 'Configurações salvas!', type: 'success' })
  }

  const salvarModulo = (modulo, campo, valor) => {
    dispatch({
      type: 'SALVAR_MODULO',
      payload: { ...modulo, [campo]: valor },
    })
  }

  const secoes = [
    { id: 'clube',   label: '🏢 Clube' },
    { id: 'pix',     label: '💳 PIX' },
    { id: 'noshow',  label: '⚠️ No-Show' },
    { id: 'geo',     label: '📍 Localização' },
    { id: 'modulos', label: '🎾 Módulos' },
  ]

  return (
    <div className="space-y-4">
      {notif && <Notification message={notif.msg} type={notif.type} onClose={() => setNotif(null)} />}

      {/* Navegação lateral em pills */}
      <div className="flex gap-2 flex-wrap">
        {secoes.map(s => (
          <button
            key={s.id}
            onClick={() => setSecao(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              secao === s.id
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Clube ── */}
      {secao === 'clube' && (
        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-slate-700">Dados do Clube</h3>
          <Input
            label="Nome do clube"
            value={cfg.nome_clube}
            onChange={e => set('nome_clube', e.target.value)}
          />
          <div className="pt-2">
            <Button variant="primary" onClick={salvarConfig}>Salvar</Button>
          </div>
        </Card>
      )}

      {/* ── PIX ── */}
      {secao === 'pix' && (
        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-slate-700">Configuração PIX</h3>
          <p className="text-xs text-slate-500">
            Usado nas telas de pagamento de reservas pagas (Quiosque, Salão de Festas).
          </p>
          <Select
            label="Tipo de chave"
            value={cfg.pix_tipo}
            onChange={e => set('pix_tipo', e.target.value)}
            options={PIX_TIPOS}
          />
          <Input
            label="Chave PIX"
            value={cfg.pix_chave}
            onChange={e => set('pix_chave', e.target.value)}
            placeholder="Ex: contato@clube.com.br"
          />
          <div className="pt-2">
            <Button variant="primary" onClick={salvarConfig}>Salvar</Button>
          </div>
        </Card>
      )}

      {/* ── No-Show ── */}
      {secao === 'noshow' && (
        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-slate-700">Regras de No-Show</h3>
          <Input
            label="Limite de no-shows para bloqueio"
            type="number"
            min={1}
            value={cfg.punicao_noshow_limite}
            onChange={e => set('punicao_noshow_limite', Number(e.target.value))}
          />
          <Input
            label="Dias de bloqueio após atingir o limite"
            type="number"
            min={1}
            value={cfg.punicao_dias_bloqueio}
            onChange={e => set('punicao_dias_bloqueio', Number(e.target.value))}
          />
          <p className="text-xs text-slate-500">
            Após {cfg.punicao_noshow_limite} no-shows, o sócio é bloqueado automaticamente por {cfg.punicao_dias_bloqueio} dias.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={salvarConfig}>Salvar</Button>
          </div>
        </Card>
      )}

      {/* ── Geolocalização ── */}
      {secao === 'geo' && (
        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-slate-700">Check-in por Geolocalização</h3>
          <Toggle
            checked={cfg.checkin_geolocalizacao}
            onChange={v => set('checkin_geolocalizacao', v)}
            label="Exigir GPS no check-in do sócio"
          />
          {cfg.checkin_geolocalizacao && (
            <>
              <Input
                label="Raio máximo para check-in (metros)"
                type="number"
                min={10}
                value={cfg.raio_checkin_metros}
                onChange={e => set('raio_checkin_metros', Number(e.target.value))}
              />
              <Input
                label="Latitude do clube"
                type="number"
                step="0.000001"
                value={cfg.clube_lat ?? ''}
                onChange={e => set('clube_lat', e.target.value ? Number(e.target.value) : null)}
                placeholder="Ex: -23.550520"
              />
              <Input
                label="Longitude do clube"
                type="number"
                step="0.000001"
                value={cfg.clube_lng ?? ''}
                onChange={e => set('clube_lng', e.target.value ? Number(e.target.value) : null)}
                placeholder="Ex: -46.633309"
              />
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
                💡 Deixe latitude e longitude em branco para desabilitar a validação GPS (útil para testes).
                Encontre as coordenadas do clube no Google Maps: clique com botão direito no local → copie as coordenadas.
              </p>
            </>
          )}
          <div className="pt-2">
            <Button variant="primary" onClick={salvarConfig}>Salvar</Button>
          </div>
        </Card>
      )}

      {/* ── Módulos ── */}
      {secao === 'modulos' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Alterações nos módulos têm efeito imediato em todas as telas.
          </p>
          {modulos.map(m => (
            <Card key={m.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{m.icone}</span>
                  <div>
                    <p className="font-bold text-slate-800">{m.nome}</p>
                    <p className="text-xs text-slate-500">
                      {m.gratuito ? 'Gratuito' : `R$ ${m.valor}`} · {typeof m.duracao === 'number' ? `${m.duracao} min` : m.duracao}
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={m.ativo}
                  onChange={v => salvarModulo(m, 'ativo', v)}
                />
              </div>

              {m.ativo && (
                <div className="border-t border-slate-100 pt-3 space-y-3">

                  {/* Tipo de fila */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Tipo de fila</label>
                    <div className="flex gap-2">
                      {['checkin', 'agendamento'].map(t => (
                        <button
                          key={t}
                          onClick={() => salvarModulo(m, 'tipo_fila', t)}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            m.tipo_fila === t
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          {t === 'checkin' ? '🎟️ Check-in' : '📅 Agendamento'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fila habilitada */}
                  <Toggle
                    checked={m.fila_habilitada}
                    onChange={v => salvarModulo(m, 'fila_habilitada', v)}
                    label="Fila de espera habilitada"
                  />

                  {/* Duração */}
                  {typeof m.duracao === 'number' && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-slate-600 w-32">Duração (min)</label>
                      <input
                        type="number"
                        min={15}
                        step={15}
                        value={m.duracao}
                        onChange={e => salvarModulo(m, 'duracao', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-teal-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Valor (só módulos pagos) */}
                  {!m.gratuito && (
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-medium text-slate-600 w-32">Valor (R$)</label>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={m.valor}
                        onChange={e => salvarModulo(m, 'valor', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-teal-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Antecedência máxima */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 w-32">Antecedência máx. (h)</label>
                    <input
                      type="number"
                      min={1}
                      value={m.antecedencia_maxima}
                      onChange={e => salvarModulo(m, 'antecedencia_maxima', Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-teal-500 outline-none"
                    />
                  </div>

                  {/* Janela de cancelamento */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 w-32">Cancelamento até (h antes)</label>
                    <input
                      type="number"
                      min={0}
                      value={m.janela_cancelamento}
                      onChange={e => salvarModulo(m, 'janela_cancelamento', Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-teal-500 outline-none"
                    />
                  </div>

                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
