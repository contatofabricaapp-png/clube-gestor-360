# Clube Gestor 360 — CLAUDE.md

Sistema SaaS de gestão para clubes esportivos: reservas de quadras, fila de espera, check-in por geolocalização, lousa digital para funcionários e painel admin completo. Frontend 100% funcional com dados demo em localStorage; backend Supabase planejado para a próxima fase.

## Stack

- **React 18** + Vite 6 (sem TypeScript)
- **React Router 6** para navegação
- **Tailwind CSS 3** com tema customizado (cor primary: teal)
- **Context API + useReducer** para estado global (`src/store/useStore.jsx`)
- **@supabase/supabase-js** instalado mas não conectado (aguarda fase 2)
- **localStorage** para persistência atual

## Estrutura essencial

```
src/
├── App.jsx                      # Rotas + guards de autenticação
├── hooks/
│   ├── useAuth.jsx              # Auth (localStorage, sem Supabase ainda)
│   └── useGeolocalizacao.js     # GPS para check-in
├── store/useStore.jsx           # Estado global (Context + useReducer)
├── lib/
│   ├── dados.js                 # Dados demo + constantes (ex: TEMPO_AQUECIMENTO)
│   ├── supabase.js              # Cliente Supabase (inativo, aguarda .env)
│   └── utils.js                 # 30+ funções utilitárias
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── socio/                   # HomePage, ReservaPage, MinhasReservasPage, FilaPage
│   ├── funcionario/LousaPage.jsx
│   └── admin/DashboardPage.jsx  # + tabs/ (Dashboard, Quadras, Aulas, Usuarios, Config)
└── components/
    ├── ui/                      # Componentes reutilizáveis
    └── layout/                  # Header, BottomNav
```

## Comandos

```bash
npm run dev      # Desenvolvimento — http://localhost:5173
npm run build    # Build de produção → /dist
npm run preview  # Preview da build → http://localhost:4173
```

## Usuários demo (senha: 1234)

| Matrícula | Perfil       | Rota inicial  |
|-----------|-------------|---------------|
| ADM001    | admin        | /admin        |
| FUNC001   | funcionario  | /lousa        |
| SOC001    | socio        | /socio        |

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com as credenciais do Supabase:

```bash
cp .env.example .env.local
```

## Estado atual

- **Frontend:** completo (v9.4) — todas as telas implementadas e funcionais
- **Backend:** pendente — Supabase não conectado, dados vivem em localStorage
- **Build:** funciona sem erros; `dist/` pronta para deploy estático

## Próximos passos (fase 2 — backend)

1. Criar projeto no Supabase e preencher `.env.local`
2. Criar tabelas: `usuarios`, `modulos`, `recursos`, `reservas`, `filas`, `aulas`, `config`
3. Migrar `useAuth` para Supabase Auth
4. Substituir dados de `dados.js` por queries ao Supabase
5. Implementar RLS policies
6. Habilitar Realtime nas tabelas `recursos` e `filas`
