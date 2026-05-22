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
