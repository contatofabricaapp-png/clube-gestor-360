# Histórico de Mudanças — Clube Gestor 360

---

## [v9.0] — Maio 2026 — Migração para Vite + React (Fase 1)

### O que mudou
O projeto foi migrado de um único arquivo HTML (React via CDN + Babel) para uma
aplicação React moderna com Vite, com estrutura pronta para publicação nas lojas
como app mobile (via Capacitor) e painel web para o admin do clube.

### Estrutura criada

```
clube-gestor-360-github/
│
├── _legado/                    ← código original v8 preservado (não alterar)
│   ├── index.html              ← HTML standalone funcional
│   └── src/                    ← JS/JSX legados
│
├── src/                        ← NOVO app React (Vite)
│   ├── main.jsx                ← entrada da aplicação
│   ├── App.jsx                 ← roteamento + providers globais
│   ├── index.css               ← Tailwind + animações globais
│   │
│   ├── lib/
│   │   ├── dados.js            ← dados iniciais + constantes (ES module)
│   │   ├── utils.js            ← funções utilitárias (ES module)
│   │   └── supabase.js         ← cliente Supabase (conectar na Fase 2)
│   │
│   ├── hooks/
│   │   └── useAuth.jsx         ← autenticação (localStorage agora, Supabase depois)
│   │
│   ├── store/
│   │   └── useStore.jsx        ← estado global (Context + useReducer)
│   │                              cobre: reservas, filas, recursos, aulas,
│   │                              usuários, módulos e config
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── index.jsx       ← Card, Button, Badge, Toggle, TabBar, Notification
│   │   │   ├── forms.jsx       ← Input, Select, Textarea
│   │   │   ├── Modal.jsx       ← Modal com backdrop e animação
│   │   │   └── StatusBadges.jsx← StatusRecursoBadge, StatusReservaBadge
│   │   └── layout/
│   │       ├── Header.jsx      ← cabeçalho fixo com nome do usuário e perfil
│   │       └── BottomNav.jsx   ← navegação inferior (mobile-first)
│   │
│   └── pages/
│       ├── auth/LoginPage.jsx       ← login com usuários demo
│       ├── socio/HomePage.jsx       ← placeholder (migrar na T05–T10)
│       ├── funcionario/LousaPage.jsx← placeholder (migrar na T11–T14)
│       └── admin/DashboardPage.jsx  ← placeholder (migrar na T15–T19)
│
├── index.html                  ← entrada Vite
├── vite.config.js              ← configuração Vite
├── tailwind.config.js          ← Tailwind com cores primary (teal)
├── postcss.config.js
└── package.json                ← React 18, React Router, Supabase, Tailwind
```

### Tasks concluídas nesta fase
- T01 — Corrigir erros Vite (JSX em .js, scan do _legado)
- T02 — Store global com todas as actions do sistema
- T03 — Componentes UI migrados para ES modules
- T04 — Este arquivo

### Próximas tasks
- T05 a T10 — Migrar telas do Sócio
- T11 a T14 — Migrar Lousa Digital
- T15 a T19 — Migrar Painel Admin
- T20 em diante — Backend Supabase

---

## [v9.1] — Maio 2026 — Épico 2: App do Sócio completo

### O que foi implementado

Todas as telas do sócio estão funcionais com dados do store global.

#### pages/socio/HomePage.jsx
- Cards de todos os módulos ativos com ícone, nome e preço
- Contador de quadras livres em tempo real por módulo
- Alerta de conta bloqueada com data de desbloqueio
- Alerta de no-shows acumulados
- Navegação para a tela de reserva ao tocar no card

#### pages/socio/ReservaPage.jsx — 4 steps:
- **Step 1 — Seleção:** select de quadra com status real + aulas do dia + opção check-in ou agendamento
- **Step 2 — Horário:** grade de horários livres filtrada por conflitos com reservas e aulas
- **Step 3 — Pagamento:** chave PIX + upload de comprovante (só módulos pagos: Quiosque, Salão)
- **Step 4 — Confirmação:** resumo completo + salva no store via dispatch FAZER_RESERVA

#### pages/socio/MinhasReservasPage.jsx
- Abas: Ativas e Histórico
- Cards de reservas com status, data e horário
- Cards de fila com posição, módulo e quadra
- Cancelar reserva / sair da fila direto pelo card

#### pages/socio/FilaPage.jsx
- Lista de filas ativas do sócio
- Posição em destaque (1º, 2º...)
- Destaque especial quando é o próximo da fila
- Sair da fila com um toque

### Tasks concluídas nesta fase
- T05 — Home do Sócio
- T06 — Tela de Reserva (agendamento + conflitos)
- T07 — Fluxo de Check-in (dentro da T06)
- T08 — Minhas Reservas
- T09 — Fila de Espera
- T10 — Pagamento PIX (dentro da T06)

### Próximas tasks
- T11 a T14 — Lousa Digital (funcionário)
- T15 a T19 — Painel Admin
- T20 em diante — Backend Supabase

---

## [v9.2] — Maio 2026 — Épico 3: Lousa Digital completa

### O que foi implementado

#### pages/funcionario/LousaPage.jsx
- Grid de todas as quadras em tempo real com fundo escuro (dark mode — ideal para monitores de recepção)
- Filtro por módulo (Tênis, Beach Tennis, Futebol...) com botões rápidos
- Banner de alerta quando há pessoas na fila
- **Timer regressivo** atualizado a cada segundo via `setInterval`
  - Fase aquecimento (5 min): fundo âmbar + contador âmbar
  - Fase jogo: fundo verde + contador verde
  - Últimos 5 min: fundo vermelho pulsando + contador animado
- **Controles completos por card:**
  - ▶ START — inicia reserva (define `iniciadaEm` e `duracaoSegundos`)
  - No-Show — registra falta, incrementa contador, bloqueia se atingir limite
  - +1h — adiciona 3600 segundos ao timer
  - Encerrar — finaliza reserva
  - Aprovar Pagamento — libera reservas pagas (Quiosque, Salão)
- **Painel de fila por quadra** — lista até 3 próximos com botão Chamar
  - Chamar da fila: marca fila como "Chamado" e cria reserva automática no nome do sócio

### Tasks concluídas nesta fase
- T11 — Grid de quadras em tempo real
- T12 — Timer regressivo com fases e animações
- T13 — Controles START / Encerrar / +1h / No-Show
- T14 — Painel de fila com botão Chamar

### Próximas tasks
- T15 a T19 — Painel Admin (dashboard, CRUD quadras, aulas, usuários, config)
- T20 em diante — Backend Supabase

---

## [v9.3] — Maio 2026 — Check-in por Fila, Geolocalização e Melhorias na Lousa

### O que foi implementado

#### hooks/useGeolocalizacao.js (novo)
- Fórmula de Haversine para calcular distância GPS em metros
- Promise-based: resolve se aprovado, rejeita com mensagem se reprovado
- Bypass automático quando `clube_lat/lng` não estão configurados (demo/testes funcionam sem GPS)
- Estados: `ocioso | verificando | aprovado | reprovado | erro | desabilitado`

#### pages/socio/ReservaPage.jsx
- Módulos `tipo_fila: 'checkin'` agora mostram **apenas check-in** — sem seleção de quadra
- Módulos `tipo_fila: 'agendamento'` mantêm seleção de quadra + horário
- Botão de check-in desabilitado e texto "📡 Verificando localização..." durante validação GPS
- Erro de geolocalização exibido em caixa vermelha abaixo do botão
- Fila criada com `recursoId: null` (fila do módulo, não de quadra específica)
- Tela de sucesso mostra **posição na fila** e **previsão de chamada** (ex: ~17:15)

#### pages/socio/FilaPage.jsx
- Exibe posição, total na fila e previsão de horário por entrada
- Posição 1: destaque "🎯 Você é o próximo!"
- Previsão calculada com ciclos: funciona mesmo com mais pessoas do que quadras

#### pages/socio/HomePage.jsx
- Card de módulo mostra `⏳ N na fila` quando há pessoas esperando
- Card interditado (todas as quadras bloqueadas) mostra status + motivo e fica não-clicável
- Sócio vê contagem da fila mas nunca os nomes

#### pages/funcionario/LousaPage.jsx
- **Painel consolidado de fila** colapsável — mostra só contagem por padrão (privacidade), expande com nomes ao clicar "▼ ver fila"
- **🗑️ Limpar fila** no painel: abre modal listando quem será removido, agrupado por módulo, com tempo de espera
- **⚙️ Alterar status** por quadra individual: modal com opções Livre / Manutenção / Interditada / Limpeza + motivo
- **🌧️ Alterar em Massa**: aplica status a todas as quadras ou só de um módulo de uma vez
- **Check-in Manual** por quadra: busca sócio por nome ou matrícula e cria reserva diretamente
- Reservas `Pendente` com `horaFim` já passada não bloqueiam mais a quadra
- Banner de fila filtrado pelo módulo selecionado (não conta outros módulos)

#### lib/utils.js
- `calcularPrevisaoFila(moduloId, posicao, reservas, recursos, duracaoMin)`: estima horário de chamada com suporte a ciclos (posição > número de quadras)

#### store/useStore.jsx
- `LIMPAR_FILA`: cancela todas as entradas `Aguardando` de um módulo (ou todos)
- `ATUALIZAR_STATUS_EM_MASSA`: altera status de todos os recursos de um módulo (ou todos)

#### lib/dados.js
- 26 sócios demo (SOC001–SOC032)
- `initialReservas`: 2 quadras Em Andamento com timer ativo + 1 Pendente
- `initialFilas`: 25 pessoas na fila do Tênis com chegadas escalonadas

### Regras de negócio definidas
- **Fila por módulo**: sócio entra na fila do módulo, não de uma quadra específica
- **Visibilidade da fila**: funcionário vê nomes; sócio vê só contagem e própria posição
- **Módulos inativos** (`ativo: false`): somem de todas as telas sem precisar remover dados
- **Previsão de chamada**: baseada nos timers ativos; para posições além do nº de quadras, adiciona um ciclo de `duracaoMin` por rodada

### Tasks concluídas
- T34 — Check-in por geolocalização
- T35 — Check-in manual pelo funcionário

### Próximas tasks
- T15 a T19 — Painel Admin (dashboard, CRUD quadras/aulas/usuários, configurações do clube)
- T20 em diante — Backend Supabase (auth, banco, realtime)
