import { Product } from '../types';

const DB_NAME = 'KasmaCatalogOfflineDB';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const META_STORE = 'meta';
const IMAGE_CACHE_NAME = 'kasmashop-product-assets-v1';

export interface CatalogCacheMeta {
  lastSynced: number;
  productCount: number;
  source: 'INDEXED_DB' | 'CACHE_API';
}

/**
 * Initialize IndexedDB instance for persistent offline product catalog
 */
export function openCatalogDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save products into IndexedDB and cache product images in Cache API
 */
export async function saveCatalogToCache(products: Product[]): Promise<void> {
  if (!products || products.length === 0) return;

  try {
    const db = await openCatalogDatabase();
    const tx = db.transaction([PRODUCTS_STORE, META_STORE], 'readwrite');
    const productStore = tx.objectStore(PRODUCTS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    // Write all products to IndexedDB
    products.forEach((p) => {
      productStore.put(p);
    });

    // Save metadata
    const metaData: CatalogCacheMeta = {
      lastSynced: Date.now(),
      productCount: products.length,
      source: 'INDEXED_DB'
    };

    metaStore.put({ key: 'catalog_meta', ...metaData });

    // Pre-cache product images in Cache API if supported
    cacheProductImagesInCacheAPI(products);
  } catch (err) {
    console.warn('Failed to save products to IndexedDB cache:', err);
  }
}

/**
 * Retrieve cached products from IndexedDB when offline
 */
export async function getCatalogFromCache(): Promise<{
  products: Product[];
  meta: CatalogCacheMeta | null;
}> {
  try {
    const db = await openCatalogDatabase();
    const tx = db.transaction([PRODUCTS_STORE, META_STORE], 'readonly');
    const productStore = tx.objectStore(PRODUCTS_STORE);
    const metaStore = tx.objectStore(META_STORE);

    const productsPromise = new Promise<Product[]>((resolve, reject) => {
      const request = productStore.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    const metaPromise = new Promise<CatalogCacheMeta | null>((resolve) => {
      const request = metaStore.get('catalog_meta');
      request.onsuccess = () => {
        if (request.result) {
          const { key, ...meta } = request.result;
          resolve(meta as CatalogCacheMeta);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });

    const [products, meta] = await Promise.all([productsPromise, metaPromise]);
    return { products, meta };
  } catch (err) {
    console.warn('Failed to read products from IndexedDB cache:', err);
    return { products: [], meta: null };
  }
}

/**
 * Pre-cache product images in Browser Cache API
 */
export async function cacheProductImagesInCacheAPI(products: Product[]): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const imageUrls = products
      .map((p) => p.image)
      .filter((url) => url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')));

    // Cache images quietly in background
    imageUrls.forEach(async (url) => {
      try {
        const match = await cache.match(url);
        if (!match) {
          await cache.add(url);
        }
      } catch {
        // Ignore CORS or fetch errors for external images
      }
    });
  } catch (err) {
    console.warn('Cache API image caching error:', err);
  }
}

/**
 * Clear offline catalog IndexedDB store and Cache API assets
 */
export async function clearOfflineCatalogCache(): Promise<void> {
  try {
    const db = await openCatalogDatabase();
    const tx = db.transaction([PRODUCTS_STORE, META_STORE], 'readwrite');
    tx.objectStore(PRODUCTS_STORE).clear();
    tx.objectStore(META_STORE).clear();

    if ('caches' in window) {
      await caches.delete(IMAGE_CACHE_NAME);
    }
  } catch (err) {
    console.warn('Failed to clear offline catalog cache:', err);
  }
}
