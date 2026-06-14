import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.clubegestor360.app',
  appName: 'Clube Gestor 360',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Para desenvolvimento local: comente a linha abaixo e use o IP da máquina
    // url: 'http://192.168.1.100:5173',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F2137',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#028090',
    },
    Geolocation: {
      // Permissão de geolocalização solicitada em tempo de execução
    },
  },
  android: {
    // Mínimo Android 7.0 (API 24) — cobre 99%+ dos dispositivos ativos
    minSdkVersion: 24,
    backgroundColor: '#0F2137',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // true apenas em desenvolvimento
  },
}

export default config
