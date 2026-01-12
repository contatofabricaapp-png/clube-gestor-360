# 🏆 Clube Gestor 360

Sistema completo de gestão modular para clubes e complexos de lazer.

## 🌐 Demo Online

**[Acessar Sistema](https://SEU_USUARIO.github.io/clube-gestor-360/)**

> Substitua `SEU_USUARIO` pelo seu username do GitHub após fazer o deploy.

---

## ✨ Funcionalidades

### 👤 Perfil Sócio
- Home dinâmica com módulos ativos
- Reserva de quadras esportivas (gratuito)
- Reserva de quiosques/salões com pagamento PIX
- Upload de comprovante de pagamento
- Histórico de reservas
- Cancelamento dentro da janela permitida

### 👷 Perfil Funcionário  
- Lousa Digital com visão geral do dia
- Confirmar presença de sócios
- Registrar no-show
- Aprovar pagamentos PIX
- Progress bar em tempo real

### ⚙️ Perfil Admin
- Ativar/desativar módulos
- Configurar regras por categoria:
  - Tipo de cobrança (Gratuito/Pago)
  - Valor padrão
  - Tempo de uso
  - Antecedência máxima para reservas
  - Janela de cancelamento
- Configurar limite de no-shows
- Configurar dias de bloqueio por punição
- **Senha master: `1234`**

---

## 🎯 Módulos Disponíveis

| Módulo | Tipo | Valor | Tempo |
|--------|------|-------|-------|
| 🎾 Tênis | Gratuito | - | 60 min |
| ⚽ Futebol | Gratuito | - | 90 min |
| 🏠 Quiosque | Pago | R$ 350 | Diária |
| 🎉 Salão de Festas | Pago | R$ 800 | Diária |
| 🏊 Piscina | Inativo | - | - |
| 🏋️ Academia | Inativo | - | - |

---

## 🚀 Como Usar

### GitHub Pages (Recomendado)

1. Faça **Fork** deste repositório
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione `main` branch
4. Aguarde 1-2 minutos
5. Acesse `https://seu-usuario.github.io/clube-gestor-360/`

### Localmente

1. Baixe o arquivo `index.html`
2. Abra no navegador

---

## 👥 Usuários Demo

| Nome | Matrícula | Perfil | No-Shows |
|------|-----------|--------|----------|
| Admin Master | ADM001 | Admin | 0 |
| João Recepção | FUNC001 | Funcionário | 0 |
| Maria Silva | SOC001 | Sócio | 0 |
| Carlos Santos | SOC002 | Sócio | 2 |
| Ana Oliveira | SOC003 | Sócio | 0 |

---

## 🛠️ Stack Técnica

- **React 18** (via CDN)
- **Tailwind CSS** (via CDN)
- **Babel** (para JSX standalone)
- **PWA Ready** (meta tags configuradas)
- **Mobile-First Design**

---

## 📱 PWA

O sistema está preparado para funcionar como Progressive Web App:
- Meta tags para instalação
- Theme color configurado
- Viewport otimizado para mobile
- Safe area para notch

---

## 🎨 Design System

- **Font**: Nunito Sans
- **Primary Color**: Teal (#0F766E)
- **Componentes**: Cards, Buttons, Badges, Modals, Toggles
- **Animações**: Suaves e profissionais

---

## 📄 Licença

MIT License - Livre para uso comercial e pessoal.

---

## 🤝 Desenvolvido com Claude

Sistema criado em parceria com [Claude](https://claude.ai) da Anthropic.
