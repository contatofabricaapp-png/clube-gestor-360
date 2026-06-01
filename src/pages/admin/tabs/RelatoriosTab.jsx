import { useState, useMemo } from 'react'
import { useStore } from '../../../store/useStore.jsx'
import { Card, Badge } from '../../../components/ui/index.jsx'
import { hoje, formatDateBR } from '../../../lib/utils.js'

const PERIODOS = [
  { id: '7d',  label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
  { id: 'mes', label: 'Mês atual' },
]

function dataInicioPeriodo(periodo) {
  const agora = new Date()
  if (periodo === '7d') {
    const d = new Date(agora); d.setDate(d.getDate() - 6); return d.toISOString().split('T')[0]
  }
  if (periodo === '30d') {
    const d = new Date(agora); d.setDate(d.getDate() - 29); return d.toISOString().split('T')[0]
  }
  // mes atual
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`
}

function exportarCSV(linhas) {
  const cabecalho = ['Data', 'Quadra', 'Módulo', 'Sócio', 'Horário', 'Status', 'Valor (R$)']
  const rows = linhas.map(r => [r.data, r.quadra, r.modulo, r.socio, r.horario, r.status, r.valor])
  const csv = [cabecalho, ...rows].map(l => l.join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-reservas-${hoje()}.csv`
  a.click()
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

  const dataInicio = dataInicioPeriodo(periodo)
  const hoje_ = hoje()

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

  const confirmadas = reservasPeriodo.filter(r => ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status)).length
  const canceladas  = reservasPeriodo.filter(r => r.status === 'Cancelada').length
  const noShows     = reservasPeriodo.filter(r => r.status === 'No-Show').length

  const receitaEstimada = reservasPeriodo
    .filter(r => ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status))
    .reduce((acc, r) => acc + Number(calcularValor(r)), 0)

  const totalSlots = recursos.length
  const taxaOcupacao = totalSlots > 0
    ? Math.round((confirmadas / Math.max(reservasPeriodo.length, 1)) * 100)
    : 0

  const linhasCSV = reservasPeriodo.map(r => ({
    data:     formatDateBR(r.data),
    quadra:   getRecurso(r.recursoId)?.nome ?? '—',
    modulo:   getModulo(r.moduloId)?.nome ?? '—',
    socio:    getUsuario(r.usuarioId)?.nome ?? '—',
    horario:  `${r.horaInicio}–${r.horaFim}`,
    status:   r.status,
    valor:    calcularValor(r),
  }))

  return (
    <div className="space-y-5">

      {/* Filtro de período */}
      <div className="flex gap-2 flex-wrap">
        {PERIODOS.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
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

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-teal-600">{reservasPeriodo.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total de reservas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{confirmadas}</p>
          <p className="text-xs text-slate-500 mt-1">Confirmadas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{canceladas}</p>
          <p className="text-xs text-slate-500 mt-1">Canceladas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{noShows}</p>
          <p className="text-xs text-slate-500 mt-1">No-shows</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{taxaOcupacao}%</p>
          <p className="text-xs text-slate-500 mt-1">Taxa de confirmação</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {receitaEstimada > 0 ? `R$ ${receitaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Receita estimada</p>
        </Card>
      </div>

      {/* Tabela + exportar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm">
            Reservas do período ({reservasPeriodo.length})
          </h3>
          <button
            onClick={() => exportarCSV(linhasCSV)}
            disabled={linhasCSV.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            📥 Exportar CSV
          </button>
        </div>

        {reservasPeriodo.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-sm">
            Nenhuma reserva no período selecionado
          </Card>
        ) : (
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
                {[...reservasPeriodo]
                  .sort((a, b) => b.data.localeCompare(a.data) || b.horaInicio.localeCompare(a.horaInicio))
                  .map(r => {
                    const rec = getRecurso(r.recursoId)
                    const u   = getUsuario(r.usuarioId)
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
                          {Number(valor) > 0 ? `R$ ${Number(valor).toLocaleString('pt-BR')}` : <span className="text-slate-400">—</span>}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
