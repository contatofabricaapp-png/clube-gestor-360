import { useState, useMemo } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Badge } from '../../../components/ui/index.jsx'
import { hoje, formatDateBR } from '../../../lib/utils.js'

const PERIODOS = [
  { id: '7d',  label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: 'mes', label: 'Mês atual' },
]

const PAGE_SIZE = 20

function dataInicioPeriodo(periodo) {
  const agora = new Date()
  if (periodo === '7d')  { const d = new Date(agora); d.setDate(d.getDate() - 6);  return d.toISOString().split('T')[0] }
  if (periodo === '30d') { const d = new Date(agora); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0] }
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`
}

function exportarCSV(linhas) {
  const cabecalho = ['Data', 'Quadra', 'Módulo', 'Sócio', 'Horário', 'Status', 'Valor (R$)']
  const rows = linhas.map(r => [r.data, r.quadra, r.modulo, r.socio, r.horario, r.status, r.valor])
  const csv  = [cabecalho, ...rows].map(l => l.join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `relatorio-reservas-${hoje()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

const STATUS_BADGE = {
  'Confirmada':           'info',
  'Em Andamento':         'success',
  'Finalizada':           'default',
  'Pendente':             'warning',
  'Cancelada':            'slate',
  'No-Show':              'danger',
  'Aguardando Pagamento': 'amber',
}

export default function RelatoriosTab() {
  const { state } = useStore()
  const { reservas, recursos, usuarios, modulos } = state
  const [periodo, setPeriodo] = useState('30d')
  const [pagina, setPagina]   = useState(1)

  const dataInicio = dataInicioPeriodo(periodo)
  const hoje_      = hoje()

  const reservasPeriodo = useMemo(() =>
    reservas.filter(r => r.data >= dataInicio && r.data <= hoje_),
    [reservas, dataInicio]
  )

  const getUsuario = (id) => usuarios.find(u => u.id === id)
  const getRecurso = (id) => recursos.find(r => r.id === id)
  const getModulo  = (id) => modulos.find(m => m.id === id)

  function calcularValor(r) {
    const mod = getModulo(r.moduloId)
    if (!mod || mod.gratuito) return 0
    if (mod.duracao === 'Diária') return mod.valor
    const [hIni, mIni] = r.horaInicio.split(':').map(Number)
    const [hFim, mFim] = r.horaFim.split(':').map(Number)
    const minutos = (hFim * 60 + mFim) - (hIni * 60 + mIni)
    return ((minutos / 60) * mod.valor).toFixed(2)
  }

  const confirmadas       = reservasPeriodo.filter(r => ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status)).length
  const canceladas        = reservasPeriodo.filter(r => r.status === 'Cancelada').length
  const noShows           = reservasPeriodo.filter(r => r.status === 'No-Show').length
  const receitaEstimada   = reservasPeriodo
    .filter(r => ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status))
    .reduce((acc, r) => acc + Number(calcularValor(r)), 0)

  const taxaConfirmacao   = reservasPeriodo.length > 0
    ? Math.round((confirmadas / reservasPeriodo.length) * 100)
    : 0

  const linhasCSV = reservasPeriodo.map(r => ({
    data:    formatDateBR(r.data),
    quadra:  getRecurso(r.recursoId)?.nome ?? '—',
    modulo:  getModulo(r.moduloId)?.nome ?? '—',
    socio:   getUsuario(r.usuarioId)?.nome ?? '—',
    horario: `${r.horaInicio}–${r.horaFim}`,
    status:  r.status,
    valor:   calcularValor(r),
  }))

  // Paginação
  const reservasOrdenadas = [...reservasPeriodo]
    .sort((a, b) => b.data.localeCompare(a.data) || b.horaInicio.localeCompare(a.horaInicio))
  const totalPaginas   = Math.ceil(reservasOrdenadas.length / PAGE_SIZE)
  const reservasPagina = reservasOrdenadas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  // Mini-gráfico de barras (últimos 7 dias de reservas confirmadas)
  const barras = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })
    const max = Math.max(1, ...dias.map(dia => reservas.filter(r => r.data === dia && ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status)).length))
    return dias.map(dia => ({
      dia,
      n:   reservas.filter(r => r.data === dia && ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status)).length,
      pct: Math.round((reservas.filter(r => r.data === dia && ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status)).length / max) * 100),
    }))
  }, [reservas])

  const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="space-y-5">

      {/* Filtro de período */}
      <div className="flex gap-2">
        {PERIODOS.map(p => (
          <button
            key={p.id}
            onClick={() => { setPeriodo(p.id); setPagina(1) }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              periodo === p.id
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Receita em destaque */}
      <Card className="p-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div>
          <p className="text-xs text-purple-400 font-medium uppercase tracking-wide mb-1">Receita estimada</p>
          <p className="text-4xl font-bold text-purple-700">
            {receitaEstimada > 0
              ? `R$ ${receitaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : <span className="text-2xl text-purple-300">Sem dados</span>}
          </p>
          <p className="text-xs text-purple-400 mt-1">{confirmadas} reservas confirmadas</p>
        </div>
        <span className="text-5xl opacity-60">💰</span>
      </Card>

      {/* KPIs secundários */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-teal-600">{reservasPeriodo.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{canceladas + noShows}</p>
          <p className="text-xs text-slate-400 mt-0.5">Perdas</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{taxaConfirmacao}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Confirmação</p>
        </Card>
      </div>

      {/* Mini-gráfico últimos 7 dias */}
      <Card className="p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-600">Confirmadas — últimos 7 dias</p>
        <div className="flex items-end gap-1.5 h-16">
          {barras.map(({ dia, n, pct }) => {
            const d = new Date(dia + 'T12:00:00')
            return (
              <div key={dia} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
                  <div
                    className="w-full rounded-t-lg bg-teal-400 transition-all"
                    style={{ height: `${Math.max(pct, 4)}%`, minHeight: n > 0 ? 4 : 0 }}
                    title={`${n} reserva(s)`}
                  />
                </div>
                <span className="text-xs text-slate-400">{DIAS_PT[d.getDay()]}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tabela + exportar + paginação */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm">
            Reservas <span className="text-slate-400 font-normal">({reservasPeriodo.length})</span>
          </h3>
          <button
            onClick={() => exportarCSV(linhasCSV)}
            disabled={linhasCSV.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            📥 CSV
          </button>
        </div>

        {reservasPeriodo.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-sm">
            Nenhuma reserva no período selecionado
          </Card>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Data</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Quadra</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Sócio</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Horário</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Status</th>
                    <th className="text-right px-3 py-2 font-semibold text-slate-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasPagina.map(r => {
                    const rec   = getRecurso(r.recursoId)
                    const u     = getUsuario(r.usuarioId)
                    const valor = calcularValor(r)
                    return (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{formatDateBR(r.data)}</td>
                        <td className="px-3 py-2 text-slate-700 max-w-[120px] truncate">{rec?.nome ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-700 max-w-[100px] truncate">{u?.nome ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{r.horaInicio}–{r.horaFim}</td>
                        <td className="px-3 py-2">
                          <Badge variant={STATUS_BADGE[r.status] ?? 'default'} size="sm">{r.status}</Badge>
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700 whitespace-nowrap">
                          {Number(valor) > 0
                            ? `R$ ${Number(valor).toLocaleString('pt-BR')}`
                            : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {(pagina - 1) * PAGE_SIZE + 1}–{Math.min(pagina * PAGE_SIZE, reservasOrdenadas.length)} de {reservasOrdenadas.length}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
