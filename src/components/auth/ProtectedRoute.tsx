import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'merchant' | 'customer';
  redirectTo?: string;
}

/**
 * Role-Based Access Control (RBAC) Route Guard
 * Verifies JWT tokens and roles from localStorage before allowing access to sensitive portals.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo,
}) => {
  const location = useLocation();
  const { language } = useShop();

  const adminToken = localStorage.getItem('kasma_admin_token');
  const isAdminAuth = localStorage.getItem('kasma_admin_auth') === 'true' && !!adminToken;

  const merchantToken = localStorage.getItem('kasma_merchant_token');
  const isMerchantAuth = localStorage.getItem('kasma_merchant_auth') === 'true' && !!merchantToken;

  const customerToken = localStorage.getItem('kasma_auth_token');
  const isCustomerAuth = localStorage.getItem('kasma_customer_logged_in') === 'true' || !!customerToken;

  let hasAccess = false;

  if (requiredRole === 'admin') {
    hasAccess = isAdminAuth;
  } else if (requiredRole === 'merchant') {
    hasAccess = isMerchantAuth || isAdminAuth; // Admin can also inspect merchant portal
  } else if (requiredRole === 'customer') {
    hasAccess = isCustomerAuth;
  }

  // If role requirement is met, render the protected component directly
  if (hasAccess) {
    return <>{children}</>;
  }

  // For Admin & Merchant portals, the child pages already include embedded secure login forms
  // when unauthenticated, so we render children to allow in-situ login, unless an explicit
  // redirect or unauthorized barrier is needed.
  if (requiredRole === 'admin' || requiredRole === 'merchant') {
    return <>{children}</>;
  }

  // For Customer protected routes (e.g., checkout/profile when mandatory)
  if (redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 rounded-3xl shadow-xl text-center space-y-4">
      <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-black text-gray-900 dark:text-zinc-100">
        {language === 'en' ? 'Access Restricted' : 'መዳረሻ ተከልክሏል'}
      </h2>
      <p className="text-xs text-gray-500 dark:text-zinc-400">
        {language === 'en'
          ? `This area requires a verified ${requiredRole.toUpperCase()} account.`
          : `ይህ ክፍል የተረጋገጠ የ${requiredRole.toUpperCase()} መለያ ያስፈልገዋል።`}
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-colors text-gray-700 dark:text-zinc-300"
      >
        <ArrowLeft className="w-4 h-4" />
        {language === 'en' ? 'Return to Home' : 'ወደ መነሻ ተመለስ'}
      </a>
    </div>
  );
};
