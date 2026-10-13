/**
 * PWA Service Worker Registration & Installation Helper
 * Optimized for mobile & tablet browser environments (Android, iOS Safari, iPadOS, Chrome, Edge)
 */

export interface PwaStatus {
  isInstalled: boolean;
  canInstall: boolean;
  isIOS: boolean;
}

let deferredPrompt: any = null;
const installListeners = new Set<(canInstall: boolean) => void>();

/**
 * Registers the Service Worker on window load
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA ACTIVE] Kasma Service Worker registered successfully with scope:', registration.scope);

        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA UPDATE] New version available! Reloading for freshest bundle.');
              }
            };
          }
        };
      })
      .catch((error) => {
        console.warn('[PWA REGISTRATION NOTICE] Service worker registration notice:', error);
      });
  });

  // Listen for beforeinstallprompt event on Android / Chrome / Edge
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent default mini-infobar
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach((listener) => listener(true));
  });

  // Detect when app was successfully installed
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((listener) => listener(false));
    console.log('[PWA INSTALLED] Kasma Tech Shop was added to Home Screen.');
  });
}

/**
 * Checks if the current browser window is already running in standalone PWA mode
 */
export function isPwaStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = (window.navigator as any).standalone === true;
  return isStandalone || isIosStandalone;
}

/**
 * Detects if user device is iOS Safari (iPhone / iPad)
 */
export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
}

/**
 * Detects if user is running inside an in-app browser WebView (Telegram, Instagram, Facebook, Messenger)
 * where Safari/Chrome's native "Add to Home Screen" is blocked until opened in real Safari.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Telegram|Line|Twitter|MicroMessenger/i.test(ua);
}

/**
 * Triggers the native browser PWA Install prompt
 */
export async function triggerPwaInstall(): Promise<{ outcome: 'accepted' | 'dismissed' | 'unsupported' }> {
  if (!deferredPrompt) {
    return { outcome: 'unsupported' };
  }

  try {
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installListeners.forEach((listener) => listener(false));
    return { outcome: choiceResult.outcome };
  } catch (err) {
    console.warn('Install prompt failed:', err);
    return { outcome: 'unsupported' };
  }
}

/**
 * Subscribe to installability state changes
 */
export function subscribeToInstallPrompt(callback: (canInstall: boolean) => void): () => void {
  installListeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => {
    installListeners.delete(callback);
  };
}
