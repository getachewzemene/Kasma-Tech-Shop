/**
 * Kasma Tech Shop - High Performance Data Cache & SWR Synchronization Service
 * 
 * Provides:
 * 1. Multi-tier caching (RAM Memory -> LocalStorage -> IndexedDB)
 * 2. Stale-While-Revalidate (SWR) fetching (instant 0ms UI load + background sync)
 * 3. In-flight request deduplication (prevents redundant parallel HTTP calls)
 * 4. Image preloading & persistent asset caching
 * 5. Automatic periodic background revalidation with tab visibility awareness
 */

import { Product } from '../types';
import { saveCatalogToCache, getCatalogFromCache, cacheProductImagesInCacheAPI } from '../utils/offlineCatalogCache';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-Memory RAM Cache (fastest, 0ms latency)
const memoryCache = new Map<string, CacheEntry<any>>();

// In-Flight Request Deduplication Registry
const inFlightRequests = new Map<string, Promise<any>>();

// Cache Keys
export const CACHE_KEYS = {
  STATE: 'kasma_cache_api_state',
  PRODUCTS: 'kasma_cache_products',
  CATEGORIES: 'kasma_cache_categories',
  LAST_SYNC: 'kasma_cache_last_sync_time'
} as const;

// Default TTLs (in milliseconds)
export const DEFAULT_TTLS = {
  STATE: 30 * 1000,        // 30 seconds fresh window, revalidate in background
  PRODUCTS: 60 * 1000,     // 1 minute fresh window
  STATIC: 5 * 60 * 1000    // 5 minutes
};

/**
 * Retrieve an item from RAM or persistent LocalStorage
 */
export function getCachedData<T>(key: string): { data: T | null; isStale: boolean; timestamp: number } {
  // 1. Try RAM memory first
  const memoryItem = memoryCache.get(key);
  if (memoryItem) {
    const isStale = Date.now() > memoryItem.expiresAt;
    return { data: memoryItem.data, isStale, timestamp: memoryItem.timestamp };
  }

  // 2. Try LocalStorage fallback
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: CacheEntry<T> = JSON.parse(raw);
      // Promote back to RAM memory
      memoryCache.set(key, parsed);
      const isStale = Date.now() > parsed.expiresAt;
      return { data: parsed.data, isStale, timestamp: parsed.timestamp };
    }
  } catch (err) {
    console.warn(`[DataCache] Failed reading key "${key}" from localStorage:`, err);
  }

  return { data: null, isStale: true, timestamp: 0 };
}

/**
 * Store data into both RAM memory and persistent LocalStorage
 */
export function setCachedData<T>(key: string, data: T, ttlMs: number = DEFAULT_TTLS.STATE): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + ttlMs
  };

  // 1. Write to RAM
  memoryCache.set(key, entry);

  // 2. Write to LocalStorage asynchronously / safely
  try {
    localStorage.setItem(key, JSON.stringify(entry));
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, String(now));
  } catch (err) {
    // In case of quota exceeded, gracefully purge older entries
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Clear cached data
 */
export function clearCache(key?: string): void {
  if (key) {
    memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {}
  } else {
    memoryCache.clear();
    try {
      localStorage.removeItem(CACHE_KEYS.STATE);
      localStorage.removeItem(CACHE_KEYS.PRODUCTS);
    } catch {}
  }
}

/**
 * Perform Stale-While-Revalidate HTTP Fetch with Deduplication:
 * - If cached data is present, returns it immediately (0ms).
 * - Concurrently kicks off a background revalidation request.
 * - Deduplicates in-flight calls so multiple components requesting the same URL share one Promise.
 */
export async function fetchWithSWR<T>(
  url: string,
  cacheKey: string,
  options: {
    ttlMs?: number;
    forceRefresh?: boolean;
    onBackgroundUpdate?: (freshData: T) => void;
  } = {}
): Promise<{ data: T; fromCache: boolean }> {
  const { ttlMs = DEFAULT_TTLS.STATE, forceRefresh = false, onBackgroundUpdate } = options;

  // 1. Check existing cache
  const cached = getCachedData<T>(cacheKey);

  // Deduplicated Fetch Helper
  const performNetworkFetch = async (): Promise<T> => {
    // If request is already in-flight, reuse it
    if (inFlightRequests.has(url)) {
      return inFlightRequests.get(url)! as Promise<T>;
    }

    const networkPromise = (async () => {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const freshData = await response.json();
        
        // Save to cache
        setCachedData<T>(cacheKey, freshData, ttlMs);

        // If this is backend state with products, also sync to IndexedDB & Cache API
        if (freshData && typeof freshData === 'object' && 'products' in freshData && Array.isArray((freshData as any).products)) {
          saveCatalogToCache((freshData as any).products).catch(() => {});
          cacheProductImagesInCacheAPI((freshData as any).products).catch(() => {});
        }

        return freshData as T;
      } finally {
        inFlightRequests.delete(url);
      }
    })();

    inFlightRequests.set(url, networkPromise);
    return networkPromise;
  };

  // If we have cache and don't need forced refresh
  if (cached.data !== null && !forceRefresh) {
    // If cache is stale or background update is requested, revalidate silently
    if (cached.isStale || forceRefresh) {
      performNetworkFetch()
        .then((fresh) => {
          if (onBackgroundUpdate) {
            onBackgroundUpdate(fresh);
          }
        })
        .catch((err) => {
          console.warn(`[DataCache SWR] Background revalidation failed for ${url}:`, err);
        });
    }

    return { data: cached.data, fromCache: true };
  }

  // Otherwise, wait for network fetch
  try {
    const networkData = await performNetworkFetch();
    return { data: networkData, fromCache: false };
  } catch (error) {
    // Network failed: fallback to stale cache if available
    if (cached.data !== null) {
      console.warn(`[DataCache SWR] Network failed for ${url}, falling back to stale cache:`, error);
      return { data: cached.data, fromCache: true };
    }
    
    // Fallback to IndexedDB for product catalog
    if (cacheKey === CACHE_KEYS.STATE || cacheKey === CACHE_KEYS.PRODUCTS) {
      try {
        const { products } = await getCatalogFromCache();
        if (products && products.length > 0) {
          const fallbackData = { products } as unknown as T;
          return { data: fallbackData, fromCache: true };
        }
      } catch {}
    }

    throw error;
  }
}
