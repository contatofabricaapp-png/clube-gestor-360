# PocketBase — Collections

Crie estas collections no painel do PocketBase (/_/#/collections).

---

## users (Auth collection — nativa do PocketBase)

> Use a collection de autenticação nativa. Adicione os campos extras abaixo.
> O login é feito com `matricula` como identity (configure em Auth Settings → Username).

Campos extras além dos padrão (id, email, password, created, updated):

| Campo | Tipo | Opções |
|-------|------|--------|
| nome | text | required |
| matricula | text | required, unique |
| perfil | select | required · valores: admin, funcionario, socio |
| status | select | default: Ativo · valores: Ativo, Bloqueado, Cancelado |
| noshow_count | number | default: 0 |
| bloqueado_ate | date | optional |

**Auth Settings:** em "Username" marque "Identificar por username" e defina `matricula` como campo de identidade. Ou use email no formato `matricula@clube.local`.

---

## modulos

| Campo | Tipo | Opções |
|-------|------|--------|
| nome | text | required |
| icone | text | |
| ativo | bool | default: true |
| gratuito | bool | default: true |
| valor | number | default: 0 |
| duracao | text | ex: "60" ou "Diária" |
| antecedencia_maxima | number | horas |
| janela_cancelamento | number | horas |
| fila_habilitada | bool | default: false |
| tipo_fila | select | valores: checkin, agendamento |
| antecedencia_fila | number | minutos |
| ordem | number | para ordenação na UI |

---

## recursos

| Campo | Tipo | Opções |
|-------|------|--------|
| modulo | relation → modulos | required |
| nome | text | required |
| capacidade | number | |
| status | select | valores: Livre, Ocupada, Manutencao, Reservada, Interditada, Limpeza · default: Livre |
| motivo | text | optional |

---

## reservas

| Campo | Tipo | Opções |
|-------|------|--------|
| usuario | relation → users | required |
| recurso | relation → recursos | required |
| modulo | relation → modulos | required |
| data | text | formato YYYY-MM-DD |
| horaInicio | text | formato HH:MM |
| horaFim | text | formato HH:MM |
| tipo | select | valores: checkin, agendamento |
| status | select | valores: Pendente, Confirmada, Em Andamento, Finalizada, Cancelada, No-Show, Aguardando Pagamento |
| comprovantePix | file | optional, max 5MB |
| iniciadaEm | date | optional |
| encerradaEm | date | optional |
| duracaoSegundos | number | optional |

---

## filas

| Campo | Tipo | Opções |
|-------|------|--------|
| usuario | relation → users | required |
| modulo | relation → modulos | required |
| recurso | relation → recursos | optional |
| data | text | formato YYYY-MM-DD |
| entradaEm | date | required |
| status | select | valores: Aguardando, Chamado, Cancelado, Atendido · default: Aguardando |
| chamadoEm | date | optional |

---

## aulas

| Campo | Tipo | Opções |
|-------|------|--------|
| recurso | relation → recursos | required |
| diasSemana | json | array de números 0-6 (0=Dom, 6=Sáb) |
| horaInicio | text | formato HH:MM |
| horaFim | text | formato HH:MM |
| professor | text | |
| nome | text | |
| status | select | valores: ativo, inativo · default: ativo |

---

## config

> Uma única linha por clube.

| Campo | Tipo | Opções |
|-------|------|--------|
| nome_clube | text | |
| pix_chave | text | |
| pix_tipo | select | valores: CPF, CNPJ, Email, Telefone, Aleatória |
| punicao_noshow_limite | number | default: 3 |
| punicao_dias_bloqueio | number | default: 7 |
| checkin_geolocalizacao | bool | default: true |
| raio_checkin_metros | number | default: 50 |
| clube_lat | number | optional |
| clube_lng | number | optional |

---

## API Rules (permissões)

Configure em cada collection → API Rules:

| Collection | List/Search | View | Create | Update | Delete |
|------------|-------------|------|--------|--------|--------|
| modulos | @request.auth.id != "" | @request.auth.id != "" | @request.auth.record.perfil = "admin" | @request.auth.record.perfil = "admin" | @request.auth.record.perfil = "admin" |
| recursos | @request.auth.id != "" | @request.auth.id != "" | @request.auth.record.perfil = "admin" | @request.auth.record.perfil = "admin" \|\| @request.auth.record.perfil = "funcionario" | @request.auth.record.perfil = "admin" |
| reservas | @request.auth.id != "" | @request.auth.id != "" | @request.auth.id != "" | @request.auth.id != "" | @request.auth.record.perfil = "admin" |
| filas | @request.auth.id != "" | @request.auth.id != "" | @request.auth.id != "" | @request.auth.id != "" | @request.auth.record.perfil = "admin" |
| aulas | @request.auth.id != "" | @request.auth.id != "" | @request.auth.record.perfil = "admin" | @request.auth.record.perfil = "admin" | @request.auth.record.perfil = "admin" |
| config | @request.auth.id != "" | @request.auth.id != "" | @request.auth.record.perfil = "admin" | @request.auth.record.perfil = "admin" | "" |
