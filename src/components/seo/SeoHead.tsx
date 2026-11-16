import React, { useEffect } from 'react';
import { Product } from '../../types';

export interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  product?: Product;
  type?: 'website' | 'product';
  image?: string;
  language?: 'en' | 'am';
}

/**
 * SeoHead
 * Dynamically updates document title, meta tags, and structured JSON-LD data
 * for search engines (Google, Bing) and AI citation engines (ChatGPT, Gemini, Perplexity)
 * tailored to authentic electronics retail in Ethiopia.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  keywords,
  canonicalPath = '',
  product,
  type = 'website',
  image,
  language = 'en'
}) => {
  const isEn = language === 'en';

  useEffect(() => {
    // 1. Determine dynamic title
    let finalTitle = title;
    if (product) {
      const pName = isEn ? product.nameEn : product.nameAm;
      const brandStr = product.brand ? `${product.brand} ` : '';
      finalTitle = `${pName} | Genuine ${brandStr}in Ethiopia | Kasma Tech Shop`;
    } else if (!finalTitle) {
      finalTitle = isEn
        ? 'Kasma Tech Shop | Original Electronics & Gadgets Store in Ethiopia'
        : 'ካስማ ቴክ ሾፕ | የኦሪጅናል ኤሌክትሮኒክስ መደብር በአዲስ አበባ፣ ኢትዮጵያ';
    }
    document.title = finalTitle;

    // 2. Determine dynamic description
    let finalDesc = description;
    if (product) {
      const desc = isEn ? product.descriptionEn : product.descriptionAm;
      const pPrice = product.variants?.[0]?.price || product.price || 0;
      finalDesc = `Buy 100% original ${product.nameEn} in Addis Ababa, Ethiopia for ${pPrice.toLocaleString()} ETB. Official manufacturer warranty, same-day express delivery, Cash on Delivery (COD) & Telebirr/CBE payment.`;
    } else if (!finalDesc) {
      finalDesc = isEn
        ? 'Official store for 100% original electronics in Ethiopia. Buy genuine smartphones, laptops, gaming gear, smartwatches, and headphones in Addis Ababa with warranty, Cash on Delivery, and CBE/Telebirr payment.'
        : 'በኢትዮጵያ 100% ኦሪጅናል ኤሌክትሮኒክስ መደብር። ስማርትፎኖች፣ ላፕቶፖች፣ የጌሚንግ እቃዎች እና ማዳመጫዎች በአዲስ አበባ በዋስትና፣ በእጅ በእጅ ክፍያ (COD) እና በቴሌብር ይግዙ።';
    }

    // Helper to safely update or create meta tags
    const setMeta = (nameAttr: 'name' | 'property', attrValue: string, contentValue: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, attrValue);
        document.head.appendChild(el);
      }
      el.content = contentValue;
    };

    setMeta('name', 'description', finalDesc);
    setMeta('property', 'og:title', finalTitle);
    setMeta('property', 'og:description', finalDesc);
    setMeta('property', 'og:type', type === 'product' ? 'product' : 'website');

    if (image || product?.image) {
      setMeta('property', 'og:image', image || product?.image || 'https://kasmashop.et/kasma-logo.png');
    }

    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 3. Inject Dynamic Schema.org JSON-LD for Products
    let scriptEl = document.getElementById('dynamic-page-schema') as HTMLScriptElement | null;
    if (product) {
      const defaultVariant = product.variants?.[0];
      const lowestPrice = defaultVariant ? defaultVariant.price : (product.price || 0);

      const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.nameEn,
        'alternateName': product.nameAm,
        'image': [product.image],
        'description': product.descriptionEn,
        'sku': defaultVariant?.sku || `KASMA-${product.id}`,
        'mpn': defaultVariant?.sku || `KASMA-${product.id}`,
        'brand': {
          '@type': 'Brand',
          'name': product.brand || 'Original Electronics'
        },
        'offers': {
          '@type': 'Offer',
          'url': `https://kasmashop.et/product/${product.id}`,
          'priceCurrency': 'ETB',
          'price': lowestPrice,
          'priceValidUntil': '2027-12-31',
          'itemCondition': 'https://schema.org/NewCondition',
          'availability': (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'seller': {
            '@type': 'ElectronicsStore',
            'name': 'Kasma Original Tech Store Ethiopia'
          },
          'areaServed': [
            { '@type': 'City', 'name': 'Addis Ababa' },
            { '@type': 'Country', 'name': 'Ethiopia' }
          ]
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': product.rating || 4.9,
          'reviewCount': product.reviewsCount || 24,
          'bestRating': '5',
          'worstRating': '1'
        }
      };

      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-page-schema';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(productSchema, null, 2);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      // Clean up dynamic script when unmounting
      const el = document.getElementById('dynamic-page-schema');
      if (el) el.remove();
    };
  }, [title, description, keywords, canonicalPath, product, type, image, language, isEn]);

  return null;
};
