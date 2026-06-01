# Deploy — Clube Gestor 360

## Frontend (app React)

### Opção 1 — Netlify Drop (mais rápido, sem conta)

```bash
npm install
npm run build
```

Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist/`.

---

### Opção 2 — Vercel (recomendado para produção)

1. Faça fork/clone do repositório
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório
3. Adicione a variável de ambiente `VITE_POCKETBASE_URL`
4. Clique em **Deploy**

As rotas SPA já estão configuradas em `vercel.json`.

---

### Opção 3 — Netlify via Git

1. Conecte o repositório em [app.netlify.com](https://app.netlify.com)
2. Build command: `npm run build` · Publish directory: `dist`
3. Adicione a variável de ambiente `VITE_POCKETBASE_URL`

As rotas SPA e headers do Service Worker já estão em `netlify.toml`.

---

## Backend (PocketBase)

### Opção A — pockethost.io (gratuito para começar)

1. Crie uma conta em [pockethost.io](https://pockethost.io)
2. Crie uma nova instância (ex: `meuclube`)
3. Acesse o painel em `https://meuclube.pockethost.io/_/`
4. Crie as collections conforme `pocketbase/schema.md`
5. Use `https://meuclube.pockethost.io` como `VITE_POCKETBASE_URL`

---

### Opção B — VPS self-hosted (~R$ 25/mês)

```bash
# Baixe o binário em https://pocketbase.io/docs
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip pocketbase_linux_amd64.zip
./pocketbase serve --http="0.0.0.0:8090"
```

Acesse `http://SEU_IP:8090/_/` para configurar.

Para produção com HTTPS, use Nginx como reverse proxy ou Caddy.

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_POCKETBASE_URL` | URL do PocketBase (ex: `https://meuclube.pockethost.io`) |

Sem essa variável o app roda em **modo demo** (dados em localStorage, sem backend).

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
