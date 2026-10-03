// Telegram Web Apps SDK Integration Utility
// Documentation: https://core.telegram.org/bots/webapps

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  receiver?: TelegramWebAppUser;
  start_param?: string;
  auth_date?: number;
  hash?: string;
}

export interface TelegramWebAppThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitData;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramWebAppThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  
  showPopup: (
    params: {
      title?: string;
      message: string;
      buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }>;
    },
    callback?: (buttonId: string) => void
  ) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };

  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };

  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Initializes the Telegram WebApp SDK if running inside Telegram.
 */
export function initTelegramWebApp(): (TelegramWebApp & { user?: TelegramWebAppUser }) | null {
  if (typeof window === 'undefined') return null;

  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.log('[Telegram SDK] WebApp SDK script running in standard browser context.');
    return null;
  }

  try {
    // Notify Telegram that the app is ready and expand to full viewport
    tg.ready();
    tg.expand();

    // Configure header theme to match Kasma primary brand
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#0052FF');
    }

    // Enable closing confirmation to prevent accidental swipe dismissals during checkout
    if (tg.enableClosingConfirmation) {
      tg.enableClosingConfirmation();
    }

    console.log(`[Telegram SDK] Initialized inside Telegram v${tg.version} (${tg.platform})`);
    
    // Attach user convenience reference
    const user = tg.initDataUnsafe?.user;
    return Object.assign(tg, { user });
  } catch (err) {
    console.warn('[Telegram SDK] Initialization warning:', err);
    return tg;
  }
}

/** Alias for initTelegramWebApp */
export const initTelegramMiniApp = initTelegramWebApp;

/**
 * Helper to check if the app is executing inside Telegram Mini App viewport
 */
export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.Telegram?.WebApp && (window.Telegram.WebApp.initData !== '' || !!window.Telegram.WebApp.initDataUnsafe?.user));
}

/** Alias for isTelegramWebApp */
export const isTelegramMiniApp = isTelegramWebApp;

/**
 * Get Telegram user information if available from initDataUnsafe
 */
export function getTelegramUser(): TelegramWebAppUser | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

/**
 * Get Telegram raw initData string
 */
export function getTelegramInitData(): string {
  if (typeof window === 'undefined') return '';
  return window.Telegram?.WebApp?.initData || '';
}

/**
 * Trigger Haptic Feedback
 */
export function triggerHaptic(type: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.hapticFeedback) return;
  
  const haptic = window.Telegram.WebApp.hapticFeedback;
  if (type === 'success' || type === 'warning' || type === 'error') {
    haptic.notificationOccurred(type);
  } else {
    haptic.impactOccurred(type);
  }
}

/**
 * Main Button Helpers for Telegram Native Bottom Bar
 */
export interface TelegramMainButtonParams {
  text: string;
  onClick: () => void;
  color?: string;
  textColor?: string;
  isProgress?: boolean;
}

export function showTelegramMainButton(
  paramsOrText: TelegramMainButtonParams | string,
  onClick?: () => void,
  color?: string
) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.MainButton) return;
  
  const mb = window.Telegram.WebApp.MainButton;
  let text = '';
  let handler = onClick;
  let btnColor = color || '#0052FF';
  let isProgress = false;

  if (typeof paramsOrText === 'object' && paramsOrText !== null) {
    text = paramsOrText.text;
    handler = paramsOrText.onClick;
    if (paramsOrText.color) btnColor = paramsOrText.color;
    if (paramsOrText.isProgress) isProgress = paramsOrText.isProgress;
  } else if (typeof paramsOrText === 'string') {
    text = paramsOrText;
  }

  if (text) mb.setText(text);
  if (btnColor) mb.color = btnColor;
  if (handler) {
    mb.onClick(handler);
  }
  if (isProgress) {
    mb.showProgress(true);
  } else {
    mb.hideProgress();
  }
  mb.show();
  mb.enable();
}

export function hideTelegramMainButton() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.MainButton) return;
  window.Telegram.WebApp.MainButton.hide();
}

export function setTelegramMainButtonProgress(show: boolean) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.MainButton) return;
  const mb = window.Telegram.WebApp.MainButton;
  if (show) {
    mb.showProgress(true);
  } else {
    mb.hideProgress();
  }
}

/**
 * Back Button Helpers
 */
export function showTelegramBackButton(onClick: () => void) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.BackButton) return;
  const bb = window.Telegram.WebApp.BackButton;
  bb.onClick(onClick);
  bb.show();
}

export function hideTelegramBackButton() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.BackButton) return;
  window.Telegram.WebApp.BackButton.hide();
}

/**
 * Telegram Native Alert & Confirm Popups
 */
export function showTelegramAlert(message: string, callback?: () => void) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.showAlert) {
    alert(message);
    if (callback) callback();
    return;
  }
  window.Telegram.WebApp.showAlert(message, callback);
}

export function showTelegramConfirm(message: string, callback?: (confirmed: boolean) => void) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.showConfirm) {
    const result = window.confirm(message);
    if (callback) callback(result);
    return;
  }
  window.Telegram.WebApp.showConfirm(message, callback);
}

export function showTelegramPopup(
  title: string,
  message: string,
  buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }>,
  callback?: (buttonId: string) => void
) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.showPopup) {
    alert(`${title ? title + '\n' : ''}${message}`);
    if (callback) callback('ok');
    return;
  }
  window.Telegram.WebApp.showPopup({ title, message, buttons }, callback);
}

/**
 * Send Data back to Telegram Bot
 */
export function sendTelegramData(data: object | string) {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp?.sendData) return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  window.Telegram.WebApp.sendData(payload);
}

