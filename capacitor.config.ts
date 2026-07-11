import type { CapacitorConfig } from '@capacitor/cli'

// Chewie is bundled into a native Android shell for Google Play (internal testing).
// The web build for this target uses a relative base and no service worker (see vite.config.ts).
const config: CapacitorConfig = {
  appId: 'nl.chewie.app',
  appName: 'Chewie',
  webDir: 'dist',
  backgroundColor: '#0b0f14',
  android: {
    backgroundColor: '#0b0f14',
  },
}

export default config
