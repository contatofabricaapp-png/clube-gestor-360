# Clube Gestor 360 — CLAUDE.md

Sistema SaaS de gestão para clubes esportivos: reservas de quadras, fila de espera, check-in por geolocalização, lousa digital para funcionários e painel admin completo. Frontend 100% funcional com dados demo em localStorage; backend PocketBase pronto para conectar.

## Stack

- **React 18** + Vite 6 (sem TypeScript)
- **React Router 6** para navegação
- **Tailwind CSS 3** com tema customizado (cor primary: teal)
- **Context API + useReducer** para estado global (`src/store/useStore.jsx`)
- **pocketbase** SDK instalado (conecta quando `VITE_POCKETBASE_URL` estiver em `.env.local`)
- **localStorage** para persistência em modo demo

## Estrutura essencial

```
src/
├── App.jsx                      # Rotas + guards de autenticação
├── hooks/
│   ├── useAuth.jsx              # Auth (modo demo ou PocketBase)
│   ├── useRealtime.js           # Realtime PocketBase (no-op em demo)
│   └── useGeolocalizacao.js     # GPS para check-in
├── store/useStore.jsx           # Estado global (Context + useReducer)
├── lib/
│   ├── dados.js                 # Dados demo + constantes
│   ├── pocketbase.js            # Cliente PocketBase (null sem .env)
│   └── utils.js                 # 30+ funções utilitárias
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── socio/                   # HomePage, ReservaPage, MinhasReservasPage, FilaPage
│   ├── funcionario/LousaPage.jsx
│   └── admin/DashboardPage.jsx  # + tabs/ (Dashboard, Quadras, Aulas, Usuarios, Relatorios, Config)
└── components/
    ├── ui/                      # Componentes reutilizáveis
    └── layout/                  # Header, BottomNav
pocketbase/
└── schema.md                   # Collections e API rules para configurar no painel
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

O admin também acessa as visões de sócio (/socio/*) e funcionário (/lousa).

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com a URL do PocketBase:

```bash
cp .env.example .env.local
```

## Estado atual

- **Frontend:** completo (v9.5) — todas as telas implementadas e funcionais
- **Backend:** PocketBase pronto para conectar — veja `pocketbase/schema.md`
- **Build:** funciona sem erros; `dist/` pronta para deploy estático

## Conectar o backend (PocketBase)

1. Criar instância gratuita em [pockethost.io](https://pockethost.io) **ou** baixar o binário para um VPS
2. Criar as collections conforme `pocketbase/schema.md`
3. Preencher `VITE_POCKETBASE_URL` no `.env.local`
4. Criar usuários no painel do PocketBase (collection `users`)

Sem a variável configurada, o app roda em **modo demo** (dados em localStorage).
