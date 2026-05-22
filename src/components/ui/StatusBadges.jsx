import { Badge } from './index.jsx'
import { STATUS_RECURSOS } from '../../lib/dados'

export const StatusRecursoBadge = ({ status, size = 'md' }) => {
  const cfg = STATUS_RECURSOS[status] || STATUS_RECURSOS['Livre']
  return <Badge variant={cfg.cor} size={size}>{cfg.icone} {cfg.label}</Badge>
}

export const StatusReservaBadge = ({ status }) => {
  const config = {
    'Pendente':              { variant: 'warning', label: 'Aguardando Check-in'    },
    'Confirmada':            { variant: 'info',    label: 'Confirmada'             },
    'Em Andamento':          { variant: 'success', label: 'Em Andamento'           },
    'Finalizada':            { variant: 'default', label: 'Finalizada'             },
    'Cancelada':             { variant: 'danger',  label: 'Cancelada'              },
    'No-Show':               { variant: 'danger',  label: 'No-Show'               },
    'Aguardando Pagamento':  { variant: 'purple',  label: 'Aguardando Pagamento'   },
  }
  const { variant, label } = config[status] || { variant: 'default', label: status }
  return <Badge variant={variant}>{label}</Badge>
}
