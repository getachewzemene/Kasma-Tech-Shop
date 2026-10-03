import { CartItem, Product } from '../types';

export interface CompactCartItem {
  i?: string; // product id
  s?: string; // sku
  nE?: string; // name en
  nA?: string; // name am
  img?: string; // image
  br?: string; // brand
  vN?: string; // variant name
  q?: number; // quantity
  p?: number; // price
}

export const generateShareableCartUrl = (cart: CartItem[]): string => {
  try {
    const compact: CompactCartItem[] = cart.map(item => ({
      i: item.product.id,
      s: item.sku,
      nE: item.product.nameEn,
      nA: item.product.nameAm,
      img: item.product.image,
      br: item.product.brand,
      vN: item.variantName,
      q: item.quantity,
      p: item.price
    }));

    const json = JSON.stringify(compact);
    const encoded = btoa(encodeURIComponent(json));
    
    const url = new URL(window.location.href);
    url.searchParams.set('sharedCart', encoded);
    return url.toString();
  } catch (err) {
    console.error('Failed to generate shared cart URL:', err);
    return window.location.href;
  }
};

export const parseSharedCartUrl = (productsList: Product[]): CartItem[] | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const sharedB64 = params.get('sharedCart');
    if (!sharedB64) return null;

    const json = decodeURIComponent(atob(sharedB64));
    const compact: CompactCartItem[] = JSON.parse(json);

    if (!Array.isArray(compact) || compact.length === 0) return null;

    const items: CartItem[] = compact.map((item, index) => {
      const existingProduct = productsList.find(p => p.id === item.i);
      
      const product: Product = existingProduct || {
        id: item.i || `shared-p-${index}-${Date.now()}`,
        nameEn: item.nE || 'Shared Product',
        nameAm: item.nA || 'የተጋራ ምርት',
        descriptionEn: 'Item restored from shared shopping cart link.',
        descriptionAm: 'ከጋራ ሱቅ ሊንክ የተመለሰ ዕቃ።',
        price: item.p || 0,
        category: 'ELECTRONICS',
        brand: item.br || 'Authentic',
        image: item.img || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        merchantId: 'm1',
        merchantName: 'Kasma Direct',
        variants: [{ sku: item.s || `sku-${index}`, name: item.vN || 'Standard', priceOffset: 0, onHand: 50, reserved: 0 }],
        status: 'APPROVED',
        lowStockThreshold: 5,
        createdAt: new Date().toISOString()
      };

      return {
        product,
        sku: item.s || product.variants[0]?.sku || product.id,
        variantName: item.vN || product.variants[0]?.name || 'Standard',
        quantity: typeof item.q === 'number' && item.q > 0 ? item.q : 1,
        price: typeof item.p === 'number' ? item.p : product.price
      };
    });

    return items;
  } catch (err) {
    console.warn('Failed to parse shared cart parameter from URL:', err);
    return null;
  }
};
