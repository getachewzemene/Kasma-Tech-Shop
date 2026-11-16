import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { 
  isTelegramWebApp, 
  showTelegramBackButton, 
  hideTelegramBackButton, 
  showTelegramMainButton, 
  hideTelegramMainButton, 
  triggerHaptic 
} from '../utils/telegramWebApp';

/**
 * useTelegramMiniAppSync
 * Synchronizes Telegram Mini App native controls (BackButton, MainButton, Viewport, Theme)
 * with the active React Router route, cart state, and user actions.
 */
export function useTelegramMiniAppSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartSubtotal, language } = useShop();

  const isTMA = isTelegramWebApp();

  // 1. Synchronize Telegram Native BackButton with React Router History
  useEffect(() => {
    if (!isTMA) return;

    if (location.pathname !== '/' && location.pathname !== '') {
      showTelegramBackButton(() => {
        triggerHaptic('light');
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      });
    } else {
      hideTelegramBackButton();
    }

    return () => {
      // Cleanup on unmount
      hideTelegramBackButton();
    };
  }, [location.pathname, navigate, isTMA]);

  // 2. Synchronize Telegram Native MainButton with Cart & Route State
  useEffect(() => {
    if (!isTMA) return;

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalETB = cartSubtotal;

    if (location.pathname === '/cart') {
      if (itemCount > 0) {
        showTelegramMainButton({
          text: language === 'en'
            ? `PROCEED TO CHECKOUT (${totalETB.toLocaleString()} ETB)`
            : `ወደ ክፍያ ቀጥል (${totalETB.toLocaleString()} ብር)`,
          onClick: () => {
            triggerHaptic('medium');
            navigate('/checkout');
          },
          color: '#0052FF'
        });
      } else {
        hideTelegramMainButton();
      }
    } else if (
      location.pathname === '/' ||
      location.pathname.startsWith('/catalog') ||
      location.pathname.startsWith('/product/')
    ) {
      if (itemCount > 0) {
        showTelegramMainButton({
          text: language === 'en'
            ? `🛒 VIEW CART (${itemCount} • ${totalETB.toLocaleString()} ETB)`
            : `🛒 ጋሪ ተመልከት (${itemCount} • ${totalETB.toLocaleString()} ብር)`,
          onClick: () => {
            triggerHaptic('light');
            navigate('/cart');
          },
          color: '#0052FF'
        });
      } else {
        hideTelegramMainButton();
      }
    } else {
      // On /checkout, /tracking, admin, etc., keep MainButton hidden so page-level buttons handle interactions
      hideTelegramMainButton();
    }

    return () => {
      hideTelegramMainButton();
    };
  }, [location.pathname, cart, cartSubtotal, language, navigate, isTMA]);

  return { isTMA };
}
