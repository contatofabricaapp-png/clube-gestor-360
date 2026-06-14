# Clube Gestor 360 — Guia de Build Android (Google Play)

## Pré-requisitos

1. **Android Studio** instalado → https://developer.android.com/studio
   - Durante a instalação, marque: Android SDK, Android Emulator, Android SDK Platform-Tools
2. **Java JDK 17+** (vem com o Android Studio)
3. **Node.js 18+** (já instalado)

---

## 1. Gerar o projeto Android (primeira vez)

```bash
# No terminal, dentro da pasta do projeto:
npm run build          # gera a pasta /dist
npx cap add android    # cria a pasta /android com o projeto nativo
npx cap sync android   # copia os assets web para o Android
```

> A pasta `/android` é um projeto Android Studio padrão.
> Você pode abri-la com `npx cap open android` ou direto no Android Studio.

---

## 2. Atualizações do dia a dia

Sempre que mudar o código React:

```bash
npm run android:sync   # build + sync (sem abrir o Android Studio)
# ou
npm run android        # build + sync + abre Android Studio
```

---

## 3. Configurar ícone e splash screen

1. Coloque os arquivos em `resources/`:
   - `resources/icon.png` — 1024×1024px, sem bordas transparentes
   - `resources/splash.png` — 2732×2732px, logo centralizado

2. Instale o gerador de assets:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --android
```

---

## 4. Configurar permissões no AndroidManifest.xml

O arquivo fica em `android/app/src/main/AndroidManifest.xml`.

Adicione dentro de `<manifest>` (antes de `<application>`):

```xml
<!-- GPS / Geolocalização -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Câmera (upload de comprovante) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 5. Gerar APK de teste (debug)

No Android Studio:
- Menu → **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

Ou via terminal:
```bash
cd android
./gradlew assembleDebug
```

---

## 6. Publicar no Google Play

### 6.1 Criar conta de desenvolvedor
- Acesse: https://play.google.com/console
- Taxa única: **US$25** (cartão de crédito)
- Aguarde a aprovação (normalmente 24h)

### 6.2 Gerar chave de assinatura (keystore)

Execute UMA VEZ e guarde o arquivo .jks em lugar seguro:

```bash
keytool -genkey -v \
  -keystore clube-gestor-360.jks \
  -alias clube-gestor-360 \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

⚠️ **IMPORTANTE:** Se perder o .jks, não poderá mais atualizar o app na Play Store.
Faça backup em nuvem (Google Drive, etc.).

### 6.3 Configurar assinatura no Android Studio

Em `android/app/build.gradle`, adicione dentro de `android { }`:

```groovy
signingConfigs {
    release {
        storeFile file('../clube-gestor-360.jks')
        storePassword 'SUA_SENHA_AQUI'
        keyAlias 'clube-gestor-360'
        keyPassword 'SUA_SENHA_AQUI'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 6.4 Gerar AAB (Android App Bundle — formato exigido pelo Play Store)

No Android Studio:
- Menu → **Build → Generate Signed Bundle / APK**
- Selecione **Android App Bundle**
- Informe o keystore criado no passo 6.2
- Build type: **release**
- Arquivo gerado: `android/app/build/outputs/bundle/release/app-release.aab`

Ou via terminal:
```bash
cd android
./gradlew bundleRelease
```

### 6.5 Submeter na Play Console

1. Acesse https://play.google.com/console
2. Crie um novo app: **Criar aplicativo**
3. Preencha: nome, idioma, tipo (app), categoria (Negócios/Produtividade)
4. Vá em **Produção → Criar nova versão**
5. Faça upload do `.aab`
6. Preencha notas da versão em português
7. Clique em **Revisar versão → Lançar para produção**

> A primeira revisão do Google demora 3–7 dias.
> Atualizações subsequentes costumam ser aprovadas em 1–2 dias.

---

## 7. Testar no celular sem publicar

```bash
# Com o celular conectado via USB (modo desenvolvedor ativado):
npx cap run android --target <device-id>

# Ou instalar o APK debug manualmente:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 8. Desenvolvimento com live reload no celular

```bash
# Descubra o IP da sua máquina (ex: 192.168.1.100)
npm run dev

# Em capacitor.config.ts, descomente:
# server: { url: 'http://192.168.1.100:5173', cleartext: true }

npx cap sync android
npx cap run android
```

O app no celular vai carregar diretamente do servidor Vite — qualquer alteração no código
reflete instantaneamente, sem precisar recompilar o APK.

---

## IDs e configurações importantes

| Campo | Valor |
|-------|-------|
| App ID (packageName) | `com.clubegestor360.app` |
| App Name | `Clube Gestor 360` |
| Min SDK Version | 24 (Android 7.0) |
| Target SDK | 35 (Android 15) |
| Versão atual | 9.5.0 |

---

## Estrutura de pastas gerada pelo Capacitor

```
android/                     ← projeto Android Studio (git-ignorado por padrão)
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml   ← permissões
│   │   └── assets/public/        ← cópia do /dist (gerada pelo cap sync)
│   └── build.gradle              ← dependências e assinatura
└── capacitor.settings.gradle
```
