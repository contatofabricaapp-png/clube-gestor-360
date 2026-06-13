import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { Card } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import { getStatusEmTempoReal, formatDateBR } from '../../lib/utils.js'

const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function dataHoje() {
  const d = new Date()
  return `${DIAS_PT[d.getDay()]}, ${d.getDate()} ${MESES_PT[d.getMonth()]}`
}

export default function SocioHome() {
  const { user } = useAuth()
  const { state } = useStore()
  const navigate = useNavigate()
  const [avisoClosed, setAvisoClosed] = useState(false)

  const { modulos, recursos, aulas, reservas, filas, config } = state

  const modulosAtivos = modulos.filter(m => m.ativo)

  const getFilaCount = (moduloId) =>
    filas.filter(f => f.moduloId === moduloId && f.status === 'Aguardando').length

  const getStats = (moduloId) => {
    const recs = recursos.filter(r => r.moduloId === moduloId)
    const statuses = recs.map(r => ({ recurso: r, real: getStatusEmTempoReal(r, aulas, reservas) }))
    const livres = statuses.filter(s => s.real.status === 'Livre').length
    const naoLivres = statuses.filter(s => s.real.status !== 'Livre')
    const todasBloqueadas = livres === 0 && recs.length > 0 &&
      naoLivres.every(s => ['Manutencao', 'Interditada', 'Limpeza'].includes(s.real.status))
    const statusBloqueio = todasBloqueadas
      ? (naoLivres.some(s => s.real.status === 'Interditada') ? 'Interditada' :
         naoLivres.some(s => s.real.status === 'Manutencao')  ? 'Manutencao'  : 'Limpeza')
      : null
    const motivoBloqueio = todasBloqueadas
      ? (naoLivres.find(s => s.real.motivo)?.real.motivo ?? null)
      : null
    return { total: recs.length, livres, todasBloqueadas, statusBloqueio, motivoBloqueio }
  }

  const usuarioAtual = state.usuarios.find(u => u.matricula === user?.matricula) || user
  const estaBloqueado = usuarioAtual.bloqueado_ate && new Date(usuarioAtual.bloqueado_ate) > new Date()
  const temAviso = estaBloqueado || (!estaBloqueado && usuarioAtual.noshow_count > 0)

  // Módulo destaque: mais quadras livres
  const modulosComStats = modulosAtivos.map(m => ({ ...m, ...getStats(m.id) }))
  const moduloDestaque = [...modulosComStats].sort((a, b) => b.livres - a.livres)[0]
  const modulosResto = modulosComStats.filter(m => m.id !== moduloDestaque?.id)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">

        {/* Saudação */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Olá, {usuarioAtual.nome?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 text-sm">{dataHoje()} — O que você quer reservar hoje?</p>
        </div>

        {/* Banner colapsável de aviso */}
        {temAviso && !avisoClosed && (
          <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
            estaBloqueado
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <span className="text-lg mt-0.5 shrink-0">{estaBloqueado ? '🚫' : '⚠️'}</span>
            <div className="flex-1 min-w-0">
              {estaBloqueado ? (
                <>
                  <p className="font-semibold text-red-800 text-sm">Conta bloqueada</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Bloqueado até {formatDateBR(usuarioAtual.bloqueado_ate)} ({config.punicao_noshow_limite} no-shows).
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-800 text-sm">Atenção com no-shows</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {usuarioAtual.noshow_count}/{config.punicao_noshow_limite} no-shows acumulados. Mais{' '}
                    {config.punicao_noshow_limite - usuarioAtual.noshow_count} e você será bloqueado por{' '}
                    {config.punicao_dias_bloqueio} dias.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setAvisoClosed(true)}
              className="text-slate-400 hover:text-slate-600 shrink-0 text-lg leading-none"
              aria-label="Fechar aviso"
            >
              ×
            </button>
          </div>
        )}

        {/* Card destaque */}
        {moduloDestaque && (
          <ModuloCard
            modulo={moduloDestaque}
            destaque
            disabled={estaBloqueado || moduloDestaque.todasBloqueadas}
            naFila={getFilaCount(moduloDestaque.id)}
            onClick={() => navigate(`/socio/reserva/${moduloDestaque.id}`)}
          />
        )}

        {/* Grade dos demais módulos */}
        {modulosResto.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {modulosResto.map(modulo => (
              <ModuloCard
                key={modulo.id}
                modulo={modulo}
                destaque={false}
                disabled={estaBloqueado || modulo.todasBloqueadas}
                naFila={getFilaCount(modulo.id)}
                onClick={() => navigate(`/socio/reserva/${modulo.id}`)}
              />
            ))}
          </div>
        )}

      </main>

      <BottomNav />
    </div>
  )
}

// ── Card de módulo (destaque ou normal) ─────────────────────────────────────
function ModuloCard({ modulo, destaque, disabled, naFila, onClick }) {
  const { total, livres, todasBloqueadas, statusBloqueio, motivoBloqueio } = modulo

  const corBloqueio = statusBloqueio === 'Interditada' ? 'red'
    : statusBloqueio === 'Manutencao' ? 'amber' : 'slate'
  const labelBloqueio = statusBloqueio === 'Interditada' ? 'Interditado'
    : statusBloqueio === 'Manutencao' ? 'Em Manutenção' : 'Em Limpeza'
  const iconeBloqueio = statusBloqueio === 'Interditada' ? '🔴'
    : statusBloqueio === 'Manutencao' ? '🟡' : '⚪'

  const tipoFila = modulo.tipo_fila === 'checkin' ? '🎟️ Check-in' : '📅 Agendamento'

  const cardBase = `overflow-hidden transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`

  if (destaque) {
    return (
      <Card
        className={`${cardBase} border-2 ${
          !disabled && livres > 0 ? 'border-teal-400 shadow-md' : 'border-slate-200'
        } p-5`}
        onClick={disabled ? undefined : onClick}
      >
        <div className="flex items-center gap-4">
          <span className={`text-5xl ${todasBloqueadas ? 'grayscale opacity-50' : ''}`}>
            {modulo.icone}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800">{modulo.nome}</h3>
              {!todasBloqueadas && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                  {tipoFila}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
            </p>

            {todasBloqueadas ? (
              <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                corBloqueio === 'red'   ? 'bg-red-50 text-red-700'   :
                corBloqueio === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {iconeBloqueio} {labelBloqueio}
                {motivoBloqueio && ` · ${motivoBloqueio}`}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                {total > 0 && (
                  <span className="flex items-center gap-1 text-xs">
                    <span className={`w-2 h-2 rounded-full ${livres > 0 ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <span className="text-slate-600 font-medium">{livres}/{total} livres</span>
                  </span>
                )}
                {naFila > 0 && (
                  <span className="text-xs text-purple-600 font-medium">⏳ {naFila} na fila</span>
                )}
              </div>
            )}
          </div>
          {!disabled && (
            <span className="text-teal-500 text-xl shrink-0">→</span>
          )}
        </div>
      </Card>
    )
  }

  // Card compacto (grade)
  return (
    <Card
      className={`${cardBase} p-4 text-center`}
      onClick={disabled ? undefined : onClick}
    >
      <span className={`text-4xl mb-2 block ${todasBloqueadas ? 'grayscale opacity-50' : ''}`}>
        {modulo.icone}
      </span>
      <h3 className="font-semibold text-slate-800 text-sm">{modulo.nome}</h3>
      <p className="text-xs text-slate-500 mt-0.5">
        {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
      </p>

      {/* Badge de tipo */}
      {!todasBloqueadas && (
        <span className="mt-1.5 inline-block text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
          {tipoFila}
        </span>
      )}

      {todasBloqueadas ? (
        <div className={`mt-2 rounded-lg px-2 py-1.5 ${
          corBloqueio === 'red'   ? 'bg-red-50'   :
          corBloqueio === 'amber' ? 'bg-amber-50' : 'bg-slate-100'
        }`}>
          <p className={`text-xs font-semibold ${
            corBloqueio === 'red'   ? 'text-red-700'   :
            corBloqueio === 'amber' ? 'text-amber-700' : 'text-slate-600'
          }`}>
            {iconeBloqueio} {labelBloqueio}
          </p>
          {motivoBloqueio && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{motivoBloqueio}</p>
          )}
        </div>
      ) : (
        <div className="mt-2 space-y-0.5">
          {total > 0 && (
            <div className="flex items-center justify-center gap-1">
              <span className={`w-2 h-2 rounded-full ${livres > 0 ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className="text-xs text-slate-500">{livres}/{total} livres</span>
            </div>
          )}
          {naFila > 0 && (
            <p className="text-xs text-purple-500">⏳ {naFila} na fila</p>
          )}
        </div>
      )}
    </Card>
  )
}
