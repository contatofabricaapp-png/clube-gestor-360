# Deploy — Clube Gestor 360

## Opção 1 — Netlify Drop (mais rápido, sem conta)

```bash
npm install
npm run build
```

Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist/` para a tela.

---

## Opção 2 — Vercel (recomendado para produção)

1. Faça fork/clone do repositório
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Importe o repositório → Vercel detecta Vite automaticamente
4. Clique em **Deploy**

As rotas SPA já estão configuradas em `vercel.json`.

---

## Opção 3 — Netlify via Git

1. Conecte o repositório em [app.netlify.com](https://app.netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`

As rotas SPA e headers do Service Worker já estão em `netlify.toml`.

---

## Variáveis de ambiente (fase 2 — backend Supabase)

Crie um arquivo `.env.local` na raiz (veja `.env.example`) e configure no painel do Vercel/Netlify:

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anon do Supabase |

Sem essas variáveis o app roda normalmente em **modo demo** (dados em localStorage).

---

## PWA / App mobile

O app é instalável como PWA em Android e iOS (Add to Home Screen).

Para publicar na Play Store / App Store, use o [Capacitor](https://capacitorjs.com/):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
npm run build
npx cap add android
npx cap sync
npx cap open android
```
