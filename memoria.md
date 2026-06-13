# 🧠 Memória do Projeto — Clube Gestor 360

> **REGRA OBRIGATÓRIA:** Este arquivo deve ser atualizado toda vez que uma melhoria, correção ou nova funcionalidade for implementada no projeto. Ao concluir qualquer tarefa de desenvolvimento, o dev-agent (ou qualquer agente que realize alterações) deve adicionar uma entrada na seção "Histórico de Melhorias" com data, descrição do que foi feito e arquivos afetados. Nunca deixar este arquivo desatualizado.

---

## O que é este sistema

**Clube Gestor 360** é um SaaS de gestão para clubes esportivos. Permite que sócios reservem quadras e entrem em filas de espera pelo celular, funcionários controlem o andamento dos jogos em tempo real pela Lousa Digital, e administradores gerenciem quadras, aulas, usuários e configurações pelo painel admin.

O sistema roda 100% no frontend com dados demo em localStorage. O backend (PocketBase) está pronto para conectar via variável de ambiente.

---

## Stack

| Tecnologia | Uso |
|------------|-----|
| React 18 + Vite 6 | Framework + bundler |
| React Router 6 | Navegação entre telas |
| Tailwind CSS 3 (tema teal) | Estilização |
| Context API + useReducer | Estado global (`src/store/useStore.jsx`) |
| PocketBase SDK | Backend (conecta via `VITE_POCKETBASE_URL`) |
| localStorage | Persistência em modo demo |

---

## Estrutura de arquivos essencial

```
src/
├── App.jsx                          # Rotas + guards de autenticação
├── hooks/
│   ├── useAuth.jsx                  # Auth (demo ou PocketBase)
│   ├── useRealtime.js               # Realtime PocketBase (no-op em demo)
│   └── useGeolocalizacao.js         # GPS para check-in (fórmula Haversine)
├── store/useStore.jsx               # Estado global (Context + useReducer)
├── lib/
│   ├── dados.js                     # Dados demo + constantes
│   ├── pocketbase.js                # Cliente PocketBase (null sem .env)
│   └── utils.js                     # 30+ funções utilitárias
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── socio/                       # HomePage, ReservaPage, MinhasReservasPage, FilaPage
│   ├── funcionario/LousaPage.jsx
│   └── admin/DashboardPage.jsx      # + tabs/: Dashboard, Quadras, Aulas, Usuarios, Relatorios, Config
└── components/
    ├── ui/                          # Card, Button, Badge, Toggle, TabBar, Notification, Modal, StatusBadges, forms
    └── layout/                      # Header, BottomNav
docs/
└── UX-ANALISE-E-MELHORIAS.md       # Análise UX completa com propostas priorizadas
```

---

## Usuários demo (senha: 1234)

| Matrícula | Perfil | Rota inicial |
|-----------|--------|--------------|
| ADM001 | admin | /admin |
| FUNC001 | funcionario | /lousa |
| SOC001 | socio | /socio |

O admin acessa também /socio/* e /lousa.

---

## Comandos

```bash
npm run dev      # http://localhost:5173
npm run build    # /dist
npm run preview  # http://localhost:4173
```

Para conectar o backend: copiar `.env.example` para `.env.local` e preencher `VITE_POCKETBASE_URL`.

---

## Regras de negócio implementadas

- **Fila por módulo:** sócio entra na fila do módulo inteiro, não de uma quadra específica
- **Visibilidade da fila:** funcionário vê nomes; sócio vê apenas contagem e própria posição
- **No-show:** ao atingir o limite configurado, sócio é bloqueado automaticamente por N dias
- **Check-in geolocalizado:** validação GPS com raio configurável; bypass automático se lat/lng não estiver configurado
- **Módulos inativos:** desaparecem de todas as telas sem remover dados
- **Tipos de fila:** `checkin` (walk-in, sem escolher quadra) ou `agendamento` (escolhe quadra e horário)
- **Timer da lousa:** fase de aquecimento (5 min) → fase de jogo → alerta nos últimos 5 min
- **Previsão de chamada:** baseada nos timers ativos; suporta posições além do número de quadras (calcula ciclos)

---

## Histórico de desenvolvimento

### v9.0 — Maio 2026 — Migração para Vite + React
Projeto migrado de HTML standalone (React via CDN) para aplicação React moderna com Vite. Criação de toda a estrutura de pastas, store global, componentes UI base e sistema de rotas.

Tarefas: T01 (erros Vite), T02 (store global), T03 (componentes UI), T04 (estrutura inicial)

### v9.1 — Maio 2026 — App do Sócio completo
Implementação das 4 telas do sócio: HomePage com grid de módulos e alertas, ReservaPage com fluxo de 4 steps (seleção de quadra → horário → pagamento PIX → confirmação), MinhasReservasPage com abas ativas/histórico, e FilaPage com posição e previsão de chamada.

Tarefas: T05 (Home), T06–T07 (Reserva + Check-in), T08 (Minhas Reservas), T09 (Fila), T10 (PIX)

### v9.2 — Maio 2026 — Lousa Digital
LousaPage com tema dark para uso em monitores de recepção. Grid de quadras em tempo real, timer regressivo com fases (aquecimento/jogo/alerta), controles START/Encerrar/+1h/No-Show/Aprovar Pagamento, painel de fila por quadra com botão Chamar.

Tarefas: T11 (grid), T12 (timer), T13 (controles), T14 (fila)

### v9.3 — Maio 2026 — Check-in, Geolocalização e Melhorias na Lousa
Hook `useGeolocalizacao` com fórmula Haversine. Diferenciação de módulos check-in vs agendamento na ReservaPage. Tela de sucesso com posição e previsão de chamada. Na Lousa: painel de fila colapsável, limpar fila, alterar status individual e em massa, check-in manual por busca de sócio. Dados demo expandidos: 26 sócios, 25 na fila.

Tarefas: T34 (geolocalização), T35 (check-in manual)

### v9.4 — Maio 2026 — Painel Admin completo
DashboardPage com 6 abas. DashboardTab: KPIs + fila por módulo + reservas recentes. QuadrasTab: CRUD com filtro por módulo. AulasTab: CRUD com dias da semana toggles. UsuariosTab: busca, filtro por perfil, bloquear/desbloquear/zerar no-shows. ConfigTab: seções Clube, PIX, No-Show, Geolocalização e Módulos (com toggle e parâmetros por módulo). RelatoriosTab: filtro de período, 6 KPIs, tabela de reservas, exportação CSV.

Tarefas: T15 (Dashboard), T16 (Quadras), T17 (Aulas), T18 (Usuários), T19 (Config)

### v9.5 — Junho 2026 — Análise UX e planejamento de melhorias visuais
Análise UX completa de todas as 11 telas do sistema por agente especializado. Documento `docs/UX-ANALISE-E-MELHORIAS.md` gerado com problemas identificados, propostas de layout, hierarquia visual, fluxo de navegação, sistema de padrões visuais e 15 melhorias priorizadas por impacto/esforço.

Principais pontos identificados: ausência de indicador de progresso na ReservaPage, falta de diferenciação visual de urgência na LousaPage, necessidade de novos componentes (ProgressSteps, EmptyState, QuadraRadioCard, SectionHeader) e diferenciação de header por contexto operacional.

---

## Próximos passos planejados

### Melhorias UX (priorizadas — ver docs/UX-ANALISE-E-MELHORIAS.md)

| # | Melhoria | Arquivo(s) | Impacto |
|---|---------|------------|---------|
| 1 | ProgressSteps na ReservaPage | ReservaPage.jsx | Alto |
| 2 | Cards radio de quadra (substituir select) | ReservaPage.jsx | Alto |
| 3 | Cor de borda por status na LousaPage | LousaPage.jsx | Alto |
| 4 | Header próprio dark na LousaPage | LousaPage.jsx | Alto |
| 5 | Grid 2 colunas na LousaPage (desktop) | LousaPage.jsx | Alto |
| 6 | EmptyState com CTA em todas as listas | Múltiplos | Médio |
| 7 | KPIs com hierarquia no DashboardTab | DashboardTab.jsx | Médio |
| 8 | Remover painel de fila consolidado da Lousa | LousaPage.jsx | Médio |
| 9 | Banner colapsável de alerta na HomePage | HomePage.jsx | Médio |
| 10 | Sidebar de seções no ConfigTab (desktop) | ConfigTab.jsx | Médio |
| 11 | Agrupamento por módulo nas tabs de listagem | QuadrasTab, AulasTab | Médio |
| 12 | Preview de imagem no upload de comprovante | ReservaPage.jsx | Médio |
| 13 | Card posição 1 na fila com pulse animation | FilaPage.jsx | Baixo |
| 14 | Receita estimada em destaque no Relatórios | RelatoriosTab.jsx | Médio |
| 15 | Mostrar/ocultar senha no Login | LoginPage.jsx | Baixo |

### Backend (pendente)
- T20+ — Integração PocketBase: autenticação real, collections, realtime subscriptions
- Criar instância em pockethost.io e configurar collections conforme `pocketbase/schema.md`
- Preencher `VITE_POCKETBASE_URL` no `.env.local`

---

## Como atualizar este arquivo

Ao concluir qualquer melhoria, adicionar entrada no final da seção "Histórico de desenvolvimento" com o seguinte formato:

```
### vX.X — [Mês Ano] — [Título da melhoria]
Descrição do que foi feito e por quê.
Arquivos modificados: X.jsx, Y.jsx
```

Se for uma melhoria UX da lista acima, marcar como concluída na tabela de próximos passos substituindo o número por ✅.

---

## Decisão de produto — Junho 2026

**Login público por e-mail:** O sistema deve suportar autoregistro. Qualquer pessoa pode criar conta com e-mail + senha e reservar quadras por hora — sem depender de matrícula fornecida pela secretaria. Isso posiciona o produto para venda a clubes que aceitam qualquer público, não apenas membros fechados.

**Impacto:** LoginPage muda de matrícula para e-mail como identificador principal. Adicionar fluxos de "Esqueci minha senha" e "Criar conta". Usuários internos (admin, funcionário) mantêm acesso por matrícula ou passam a usar e-mail definido pelo admin.

Detalhes de UX e arquivos afetados em `docs/UX-ANALISE-E-MELHORIAS.md` (seção final).
