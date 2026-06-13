# Análise UX — Clube Gestor 360
**Papel:** UX Designer Sênior / Product Designer  
**Escopo:** Revisão completa da interface para execução pelo dev-agent  
**Regra:** Nenhuma lógica de negócio alterada — somente camada visual e estrutural

---

## Diagnóstico Geral

O sistema tem uma base sólida: componentes consistentes (Card, Button, Badge), tema de cor coerente (teal/emerald), e fluxos funcionais bem definidos por perfil. Os problemas são de grau, não de arquitetura:

1. **Todas as telas de sócio têm o mesmo peso visual** — home, reserva, histórico e fila parecem o mesmo layout.
2. **A Lousa Digital é densa demais** — tela operacional de alto tráfego sem respiração ou hierarquia de urgência.
3. **O Painel Admin não aproveita o espaço desktop** — abas estreitas, cards de lista únicos que poderiam ser colunas.
4. **Estados vazios genéricos** — "Nenhuma reserva hoje" sem direcionamento para ação.
5. **Feedback de progresso nos steps de reserva é invisível** — o usuário não sabe em qual etapa está nem quantas faltam.
6. **LoginPage: credenciais de teste visíveis** — sinal de produto em beta.
7. **Header idêntico em todas as telas** — não diferencia contexto operacional (lousa, dark) de contexto do sócio.

---

## Telas — Análise e Proposta

---

### 1. LoginPage

**Objetivo:** Autenticar o usuário e direcioná-lo ao perfil correto.

**Problemas percebidos:**
- Bloco de "Usuários de teste" visível para qualquer visitante — aparência de protótipo.
- Emoji 🎾 como único elemento de marca é frágil; não usa `config.nome_clube` do store.
- Campo "Matrícula" sem instrução sobre o formato.
- Fundo `bg-primary-700` plano sem profundidade visual.
- Sem botão de mostrar/ocultar senha.

**Melhorias:**
- Substituir bloco de credenciais por link discreto "Primeiro acesso? Fale com a secretaria" (bloco de teste controlado por variável de ambiente `VITE_DEMO_MODE`).
- Logotipo dinâmico puxando `config.nome_clube`.
- Fundo com gradiente diagonal sutil (teal-700 → teal-900).
- Label "Matrícula" com subtexto: "Fornecida pela secretaria do clube".
- Botão olho no campo de senha.

**Proposta de layout:**
```
[Gradiente diagonal teal-700→teal-900]
  [Ícone/Logo do clube dinâmico]
  Nome do Clube
  "Sistema de Gestão"

  ┌─ Card ──────────────────────┐
  │  Matrícula                  │
  │  [_________________________]│
  │  Senha                 [👁] │
  │  [_________________________]│
  │  [ENTRAR →]                 │
  │  ────────────────────────── │
  │  Primeiro acesso? →         │
  └─────────────────────────────┘
```

**Desktop:** max-w-sm centralizado — funciona bem como está.
**Mobile:** autocomplete="username" e autocomplete="current-password" nos inputs.

---

### 2. HomePage (Sócio)

**Objetivo:** Hub de navegação — sócio escolhe o módulo e inicia a jornada.

**Problemas percebidos:**
- Grid 2 colunas com cards idênticos — tudo tem o mesmo peso, nada chama atenção.
- Alertas de bloqueio/no-show como cards completos empurram os módulos para baixo.
- Cards não comunicam tipo de fila (check-in vs agendamento).
- "Olá, João!" sem data — perde oportunidade de contextualizar.
- Disponibilidade como "2/4 livres" sem próximo horário disponível.

**Melhorias:**
- Cards com diferenciação: módulo com mais quadras livres recebe borda teal e leve elevação (card de destaque).
- Badge de tipo no card: `📅 Agendamento` ou `🎟️ Check-in`.
- Subtexto do card: próximo horário livre (agendamento) ou tempo médio de espera (fila).
- Alerta de bloqueio/no-show: banner colapsável fino no topo, não card completo.
- Saudação com data atual: "Olá, João — Sábado, 14 jun".

**Hierarquia visual proposta:**
```
[Banner de aviso colapsável — só se houver]
"O que você quer reservar hoje?"
[Card DESTAQUE — módulo mais disponível, full-width]
[Card médio] [Card médio]
[Card médio] [Card médio]
```

**Desktop:** grid 3 colunas com card de destaque centralizado em destaque maior.
**Mobile:** card de destaque full-width acima do grid 2 colunas.

---

### 3. ReservaPage (fluxo multi-step)

**Objetivo:** Guiar o sócio do início ao fim com mínimo de atrito.

**Problemas percebidos:**
- **Sem indicador de progresso** — sócio não sabe em qual step está.
- **Botão "Voltar" sem contexto** — sem indicação do destino.
- **Grid de horários 4 colunas em mobile** — botões muito pequenos para toque.
- **Upload de comprovante** — input file disfarçado sem preview da imagem.
- **Tela de sucesso** — dois botões de igual peso sem hierarquia de ação primária.
- **Select de quadra** — sufixos como "(Manutencao)" são UX ruim; status deveria ser badge visual.

**Melhorias:**

**Indicador de progresso no topo (ProgressSteps):**
```
[Quadra] ──── [Horário] ──── [Pagamento] ──── [Confirmar]
  [●]              [○]              [○]              [○]
```
Componente estático com step atual em teal, completos em emerald, futuros em slate-300.

**Seleção de quadra:** Substituir select por cards radio visuais:
```
┌─────────────────┐  ┌─────────────────┐
│ 🟢 Quadra 01    │  │ 🟡 Quadra 02    │
│ Livre agora     │  │ Em Manutenção   │
│ [●Selecionar]   │  │ [Indisponível]  │
└─────────────────┘  └─────────────────┘
```
Cards desabilitados com `opacity-50 cursor-not-allowed`.

**Grid de horários:** 3 colunas em mobile (botões min 44px altura), 4 colunas em desktop.

**Upload de comprovante:** Área de drop com preview miniatura da imagem após seleção.

**Tela de sucesso:** Botão primário "Ver minhas reservas" em destaque total; "Voltar ao início" como link texto abaixo.

**Desktop:** step content max-w-md centralizado com sidebar de resumo fixo à direita.
**Mobile:** steps full-width com progress indicator no topo.

---

### 4. MinhasReservasPage

**Objetivo:** Sócio visualiza reservas ativas e histórico.

**Problemas percebidos:**
- Cards de reserva e de fila com formatação diferente no mesmo container — inconsistente.
- Estado vazio sem CTA para fazer reserva.
- Data e horário (informação mais importante) enterrada num sub-card cinza.
- Botão "Cancelar reserva" vermelho full-width — peso excessivo para ação que exige cuidado.
- Cards do histórico idênticos aos ativos em cor — não há diferenciação visual.

**Melhorias:**
- Cards ativos com borda esquerda colorida por status: teal=confirmada, amber=pendente, emerald=em andamento.
- Cards do histórico com `opacity-60` e sem borda colorida — sinaliza inatividade.
- Data e horário em destaque no topo do card (tamanho maior), quadra como subtexto.
- CTA no estado vazio: "Nenhuma reserva ativa — [Fazer uma reserva →]".
- Botão "Cancelar": `variant="ghost"` texto vermelho, pequeno, não full-width.

**Hierarquia proposta para card de reserva:**
```
┌─ [borda-l teal] ──────────────────────────┐
│  🎾 Quadra 01                [Confirmada] │
│  Tênis                                    │
│  ─────────────────────────────────────    │
│  📅 Sáb, 14 jun · 10:00 – 11:00          │
│                            [Cancelar ×]   │
└───────────────────────────────────────────┘
```

**Desktop:** dois cards por linha em telas >640px.
**Mobile:** um card por linha.

---

### 5. FilaPage (Sócio)

**Objetivo:** Sócio acompanha posição na fila e previsão de chamada.

**Problemas percebidos:**
- Posição `text-4xl` não muda visualmente quando é posição 1 — a urgência não é comunicada.
- Previsão de chamada num banner discreto — deveria ser o elemento mais visível.
- Botão "Sair da fila" full-width danger — mesmo peso que ações críticas.
- Tela parece estática mesmo sendo reativa — sem indicador de "ao vivo".

**Melhorias:**
- Posição 1: card com `bg-emerald-50 border-emerald-400`, número com `animate-pulse` suave.
- Previsão em destaque: `text-2xl font-bold` centralizada, acima dos controles.
- Indicador "ao vivo": ícone de sincronização com `animate-spin` lento no canto do card.
- Botão "Sair da fila": `variant="ghost"` com ícone X, pequeno, abaixo dos dados.
- Estado vazio: ícone grande + "Você está livre por agora. Quer fazer uma reserva?" + CTA.

**Desktop:** card centralizado max-w-sm.
**Mobile:** full-width como atual.

---

### 6. LousaPage (Funcionário)

**Objetivo:** Controle operacional em tempo real — tela de maior tráfego e urgência.

**Problemas percebidos:**
- Fundo dark mas cards também dark — pouco contraste entre quadras livres e ocupadas.
- Timer dentro de sub-card dentro de card — hierarquia profunda demais.
- Filtro de módulo com overflow-x silencioso em mobile.
- Painel de fila consolidado duplica informação já presente nos cards individuais.
- Impossível varrer visualmente o estado de 8 quadras sem scroll excessivo.

**Melhorias:**

**Diferenciação de cards por status (borda esquerda):**
- Em Andamento → `border-l-4 border-emerald-400`
- Pendente (aguardando start) → `border-l-4 border-amber-400`
- Livre → `border-l-4 border-slate-600`
- Manutenção/Interditada → `border-l-4 border-red-700 opacity-70`

**Timer como elemento dominante quando Em Andamento:**
```
┌─ [borda-l emerald] ──────────────────────────┐
│  🎾 Quadra 01     [Em jogo] [⚙️]             │
│  👤 João Silva · 10:00 – 11:05               │
│  ┌────────────────────────────────────┐       │
│  │         35:22                      │       │
│  │    Tempo restante                  │       │
│  └────────────────────────────────────┘       │
│  [+1h]              [Encerrar]                │
└───────────────────────────────────────────────┘
```

**Painel de fila consolidado:** Remover — duplica o mini-painel de fila que já existe em cada card. Manter apenas o mini-painel por quadra.

**Filtro de módulo:** Scroll horizontal com sombra gradiente na borda direita indicando overflow.

**Header da Lousa:** Header próprio dark (bg-slate-900 border-slate-700 texto branco) — diferente do Header padrão. Reforça contexto operacional.

**Desktop:** grid 2 colunas para os cards de quadra — funcionário vê tudo sem scroll.
**Mobile:** 1 coluna como atual.

---

### 7. Admin — DashboardTab

**Objetivo:** Visão geral operacional — reservas hoje, ocupação, alertas.

**Problemas percebidos:**
- 6 KPIs em grid 2×3 sem hierarquia — todos têm o mesmo tamanho e peso.
- KPIs de alerta (bloqueados, no-shows) iguais aos de operação normal.
- Lista de reservas infinita sem agrupamento por hora ou status.
- Sem ações rápidas — para agir, admin precisa trocar de aba.

**Melhorias:**

**Hierarquia de KPIs em 3 faixas:**
```
Linha 1 (grandes): [Reservas hoje] [Em andamento]          ← operação atual
Linha 2 (médios):  [Livres/Total]  [Na fila]               ← disponibilidade
Linha 3 (alertas): [Bloqueados🔴] [No-shows🟡]             ← alertas com cor
```

**Lista de reservas:** Agrupar por faixa de hora. Limite de 10 itens com "Ver todas →" que muda para RelatoriosTab.

**Ações rápidas:** No card de bloqueados, link "→ Gerenciar" que muda para UsuariosTab.

**Desktop:** KPIs em linha horizontal (3 por linha), lista de reservas em coluna lateral direita.
**Mobile:** Stack vertical como atual.

---

### 8. Admin — QuadrasTab e AulasTab

**Objetivo:** CRUD de quadras e aulas.

**Problemas percebidos:**
- Cards de listagem sem agrupamento visual por módulo.
- Modal de exclusão genérico não exibe o nome do item sendo removido.
- Inputs de hora lado a lado mas sem validação inline visível.

**Melhorias:**
- Agrupar cards por módulo com cabeçalho de seção: "🎾 Tênis (3 quadras)".
- Ações (editar/excluir) visíveis no hover do card via `group-hover:opacity-100`.
- Modal de exclusão: mostrar nome do item em destaque bold.
- Validação inline nos campos de hora: borda vermelha + mensagem se fim < início.

**Desktop:** lista em 2 colunas.
**Mobile:** 1 coluna.

---

### 9. Admin — UsuariosTab

**Objetivo:** Gerenciar sócios, funcionários e admins.

**Problemas percebidos:**
- Busca e filtro em dois blocos separados sem hierarquia.
- Ações inline sempre visíveis mesmo em listas grandes — muito ruído.
- Botões "Bloquear" e "Desbloquear" com mesmo peso visual e significados opostos.

**Melhorias:**
- Busca + filtro de perfil unificados: campo de busca com pills de filtro inline abaixo.
- Ações inline: visíveis apenas no hover (desktop) ou menu 3 pontos (mobile).
- "Bloquear": `variant="warning"` ícone 🔒. "Desbloquear": `variant="success"` ícone 🔓.
- Contador no topo: "Exibindo 12 de 34 sócios".

---

### 10. Admin — RelatoriosTab

**Objetivo:** Análise de reservas por período + exportação CSV.

**Problemas percebidos:**
- Receita estimada em card idêntico aos demais KPIs — dado de maior valor sem destaque.
- Tabela sem paginação.
- Filtro de período visualmente igual aos outros filtros de conteúdo do sistema.

**Melhorias:**
- Receita estimada: card full-width com fundo gradient teal, tipografia `text-4xl` — KPI de destaque máximo.
- Tabela: limite de 20 linhas com paginação simples.
- Filtro de período: segmented control visual diferente dos filtros de módulo/perfil.
- Mini-gráfico de barras CSS (divs com height proporcional) mostrando reservas por dia.

**Desktop:** tabela full-width, KPIs em linha horizontal acima.
**Mobile:** tabela com scroll horizontal, KPIs em grid 2×3.

---

### 11. Admin — ConfigTab

**Objetivo:** Configurações globais do clube.

**Problemas percebidos:**
- Pills de navegação de seção parecem filtros de conteúdo — ambiguidade semântica.
- Botão "Salvar" repetido em cada seção sem estado visual de "alterado".
- Seção de Módulos mistura toggle ativo/inativo com configurações detalhadas — densa.

**Melhorias:**
- Desktop: sidebar de seções (200px) à esquerda, conteúdo à direita — padrão de settings pages.
- Mobile: pills horizontais + conteúdo abaixo (como atual).
- Botão "Salvar": estado `✓ Salvo` por 2s após salvar + indicador de campo alterado (ring-amber-400).
- Seção Módulos: accordion por módulo — toggle ativo/inativo sempre visível, configurações expandíveis.

---

## Sistema de Padrões Visuais

### Design Tokens

| Token | Tailwind | Uso |
|-------|----------|-----|
| primary | teal-600 | Ações principais, links ativos |
| success | emerald-500 | Em andamento, livre, positivo |
| warning | amber-500 | Pendente, atenção |
| danger | red-500 | No-show, bloqueio, erro |
| queue | purple-500 | Fila de espera (cor exclusiva) |
| info | blue-500 | Confirmado, informação |
| ops-bg | slate-900 | Background de telas operacionais |

### Tipografia

- Título de página: `text-xl font-bold text-slate-800`
- Label de seção: `text-sm font-semibold text-slate-600`
- Corpo de card: `text-sm text-slate-700`
- Meta / data / hora: `text-xs text-slate-500`
- KPI principal: `text-3xl font-bold` + cor por contexto

### Novos componentes a criar

**ProgressSteps** — para ReservaPage:
Props: `steps: string[], current: number`
Visual: círculos conectados por linha. Atual=teal, completo=emerald, futuro=slate-300.

**SectionHeader** — para Admin tabs:
Props: `title, count?, action?`
Visual: título bold + badge contagem cinza + botão à direita.

**EmptyState** — uniformizar estados vazios:
Props: `icon, title, description, action?`
Usar em: MinhasReservasPage, FilaPage, todas as tabs admin.

**QuadraRadioCard** — para ReservaPage:
Props: `recurso, status, selected, disabled, onClick`
Substitui o `<select>` de quadras.

---

## Diferenciação por Contexto Visual

| Contexto | Header | Fundo | Tom |
|----------|--------|-------|-----|
| Sócio | Branco + logo teal | slate-50 | Amigável, mobile-first |
| Funcionário (Lousa) | Dark slate-900 | slate-900 | Operacional, denso |
| Admin | Branco + breadcrumb | slate-50 | Produtivo, tabular |
| Auth | Teal sólido | primary-700 | Neutro, institucional |

---

## Princípios UX para Futuras Telas

1. **Urgência por cor de borda.** Borda esquerda comunica estado antes de qualquer leitura: emerald=ativo, amber=pendente, red=problema, slate=inativo.

2. **Uma ação primária por tela.** Botão cheio teal. Demais são ghost ou danger — menor, à direita.

3. **Estado vazio com direção.** Nunca só "Nenhum item." — sempre com CTA ou explicação.

4. **Mobile = contexto de uso, não de tamanho.** Sócio usa em pé na quadra. Funcionário em movimento. Admin sentado no desktop. Layout e densidade devem refletir isso.

5. **Feedback imediato.** Toda ação com dispatch dá feedback em menos de 500ms: spinner no botão, badge de status ou toast.

6. **Hierarquia em 3 camadas.** Em qualquer card: (1) identificação + status — visível sem scroll; (2) detalhes — data, horário, valor; (3) ações — ao final ou no hover.

7. **Consistência > Criatividade.** Antes de criar novo padrão, verificar se Card, Badge, Button ou TabBar já resolve. Variações de cor/tamanho são preferíveis a novos componentes.

---

## Prioridade de Implementação

| # | Melhoria | Arquivo(s) alvo | Impacto | Esforço |
|---|---------|-----------------|---------|---------|
| 1 | ProgressSteps na ReservaPage | ReservaPage.jsx | Alto | Baixo |
| 2 | Cards radio de quadra (substituir select) | ReservaPage.jsx | Alto | Médio |
| 3 | Cor de borda por status na LousaPage | LousaPage.jsx | Alto | Baixo |
| 4 | Header próprio dark na LousaPage | LousaPage.jsx | Alto | Baixo |
| 5 | Grid 2 colunas na LousaPage (desktop) | LousaPage.jsx | Alto | Baixo |
| 6 | EmptyState com CTA em todas as listas | Múltiplos | Médio | Baixo |
| 7 | KPIs com hierarquia no DashboardTab | DashboardTab.jsx | Médio | Baixo |
| 8 | Remover painel de fila consolidado da Lousa | LousaPage.jsx | Médio | Baixo |
| 9 | Banner colapsável de alerta na HomePage | HomePage.jsx | Médio | Baixo |
| 10 | Sidebar de seções no ConfigTab (desktop) | ConfigTab.jsx | Médio | Médio |
| 11 | Agrupamento por módulo nas tabs de listagem | QuadrasTab, AulasTab | Médio | Médio |
| 12 | Preview de imagem no upload de comprovante | ReservaPage.jsx | Médio | Baixo |
| 13 | Card posição 1 na fila com pulse | FilaPage.jsx | Baixo | Baixo |
| 14 | Receita estimada em destaque no Relatórios | RelatoriosTab.jsx | Médio | Baixo |
| 15 | Mostrar/ocultar senha no Login | LoginPage.jsx | Baixo | Baixo |

---

## Adição — LoginPage: Fluxo completo de acesso público

**Contexto:** O sistema deve suportar acesso público — qualquer pessoa pode se cadastrar, logar e reservar uma quadra por hora. Não depende de matrícula fornecida pela secretaria.

### Mudança de modelo de login

Substituir o campo "Matrícula" por **E-mail** como identificador principal do usuário. A senha continua sendo única por usuário.

O login existente (matrícula + senha) pode coexistir para usuários admin e funcionário internos; para o fluxo público, o acesso é por e-mail + senha.

### Tela de Login — nova estrutura

```
[Gradiente teal]
  [Logo dinâmico do clube]

  ┌─ Card ─────────────────────────┐
  │  E-mail                        │
  │  [____________________________]│
  │  Senha                    [👁] │
  │  [____________________________]│
  │                                │
  │  [ENTRAR →]                    │
  │                                │
  │  Esqueci minha senha           │
  │  ──────────────────────────    │
  │  Não tem conta? Cadastre-se    │
  └────────────────────────────────┘
```

### Fluxo "Esqueci minha senha"

**Com PocketBase conectado:**
1. Usuário clica em "Esqueci minha senha" → abre tela/modal com campo de e-mail
2. Clica "Enviar link" → PocketBase dispara e-mail de redefinição
3. Exibe: "Se o e-mail estiver cadastrado, você receberá um link em instantes."
4. Usuário acessa o link → tela de redefinição de senha (nova rota `/redefinir-senha?token=...`)

**Em modo demo (sem PocketBase):**
- Clicar em "Esqueci minha senha" exibe modal informando: "Entre em contato com a administração do clube para redefinir sua senha."

### Fluxo "Criar conta" (autoregistro público)

1. Usuário clica "Não tem conta? Cadastre-se"
2. Tela de cadastro: Nome completo, E-mail, Senha, Confirmar senha
3. Após criar: login automático e redirect para /socio
4. Perfil padrão: `socio`; matrícula gerada automaticamente (SOC + timestamp ou sequencial)

### Impacto nos arquivos

| Arquivo | Mudança |
|---------|---------|
| `LoginPage.jsx` | Campo email em vez de matrícula + links esqueci/cadastro |
| `useAuth.jsx` | Suporte a auth por e-mail (PocketBase) + demo com e-mail |
| Nova: `EsqueciSenhaPage.jsx` | Formulário de recuperação |
| Nova: `RedefinirSenhaPage.jsx` | Formulário de nova senha (token via URL) |
| Nova: `CadastroPage.jsx` | Formulário de autoregistro |
| `App.jsx` | Novas rotas: /esqueci-senha, /redefinir-senha, /cadastro |
| `memoria.md` | Atualizar com este planejamento |

### Prioridade

Adicionar no topo da tabela de melhorias:
- **#0a** — Login por e-mail (substituir matrícula no fluxo público) — Alto / Médio
- **#0b** — Tela "Esqueci minha senha" — Alto / Baixo
- **#0c** — Tela "Criar conta" (autoregistro) — Alto / Médio
