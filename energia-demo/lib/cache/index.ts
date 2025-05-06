import crypto from 'crypto'

// Cache entry with timestamp for expiration
type CacheEntry = {
  data: any;
  timestamp: number;
  hits: number;
  source: 'api' | 'demo' | 'fallback'; // Track where the data came from
  expiresAt: number; // Explicit expiration time
}

// Cache types
export type CacheType = 'analyze' | 'future' | 'futureImage';

// Possible cache entry states
export type CacheStatus = 'hit' | 'miss' | 'expired' | 'stale';

// In-memory cache for demo
const cache: {
  analyze: Record<string, CacheEntry>;
  future: Record<string, CacheEntry>;
  futureImage: Record<string, CacheEntry>;
} = {
  analyze: {},
  future: {},
  futureImage: {}
}

// Cache configuration
const CACHE_CONFIG = {
  TTL: {
    analyze: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    future: 1000 * 60 * 60 * 24 * 3, // 3 days for future projections
    futureImage: 1000 * 60 * 60 * 24 * 7, // 7 days for generated images
    demo: 1000 * 60 * 60 * 24 * 30, // 30 days for demo data
    fallback: 1000 * 60 * 60 * 24 * 30 // 30 days for fallback data
  },
  MAX_ENTRIES: 100, // Maximum entries in each cache category
  AUTO_CLEANUP_INTERVAL: 1000 * 60 * 30, // Run cleanup every 30 minutes
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  QUOTA_WARNING_THRESHOLD: 0.8, // 80% of storage quota
  STALE_WHILE_REVALIDATE: 1000 * 60 * 60 * 24 * 7, // Use stale data for up to 7 days while revalidating
  MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB for localStorage (conservative estimate)
  STORAGE_KEY: 'energiaCache',
  VERSION: '1.0' // Cache version for future compatibility
}

// Pre-cached responses for test images
const preCachedResponses = {
  analyze: {
    // Hash of test image 1 -> pre-generated response
    // Will be populated later
  },
  future: {
    // Hash of test image 1 -> pre-generated future data
    // Will be populated later
  }
}

// Initialize cache with pre-cached responses
export function initializeCache(): void {
  const now = Date.now();
  
  // Add pre-cached responses to cache
  Object.entries(preCachedResponses.analyze).forEach(([key, value]) => {
    const expirationTime = now + CACHE_CONFIG.TTL.demo;
    cache.analyze[key] = {
      data: value,
      timestamp: now,
      hits: 0,
      source: 'demo',
      expiresAt: expirationTime
    }
  })
  
  Object.entries(preCachedResponses.future).forEach(([key, value]) => {
    const expirationTime = now + CACHE_CONFIG.TTL.demo;
    cache.future[key] = {
      data: value,
      timestamp: now,
      hits: 0,
      source: 'demo',
      expiresAt: expirationTime
    }
  })
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      persistCacheToStorage()
      
      // Check storage quota and log warning if approaching limit
      checkStorageQuota();
      
    } catch (error) {
      console.error('Failed to store cache in localStorage:', error)
    }
    
    // Set up auto cleanup and maintenance
    const cleanupInterval = setInterval(cleanupCache, CACHE_CONFIG.AUTO_CLEANUP_INTERVAL);
    
    // Attach to window events for better cache management
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Clean up on unload to avoid memory leaks
    window.addEventListener('beforeunload', () => {
      clearInterval(cleanupInterval);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    });
  }
}

// Handle online/offline status changes
function handleOnlineStatusChange(): void {
  const online = navigator.onLine;
  console.log(`Network status changed: ${online ? 'online' : 'offline'}`);
  
  // If coming back online, could trigger revalidation of stale cache entries here
  if (online) {
    revalidateStaleEntries();
  }
}

// Check if we're approaching storage quota limits
function checkStorageQuota(): void {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({usage, quota}) => {
      if (usage && quota) {
        const usageRatio = usage / quota;
        if (usageRatio > CACHE_CONFIG.QUOTA_WARNING_THRESHOLD) {
          console.warn(`Storage usage is high: ${Math.round(usageRatio * 100)}% of quota used`);
          // Aggressively clean cache when approaching quota
          cleanupCache(true);
        }
      }
    });
  } else {
    // Fallback for browsers without Storage API
    try {
      const totalSize = estimateStorageSize();
      if (totalSize > CACHE_CONFIG.MAX_STORAGE_SIZE * CACHE_CONFIG.QUOTA_WARNING_THRESHOLD) {
        console.warn(`Storage usage is high: approximately ${Math.round(totalSize / 1024 / 1024)}MB used`);
        cleanupCache(true);
      }
    } catch (e) {
      console.error('Error checking storage size:', e);
    }
  }
}

// Estimate the size of localStorage
function estimateStorageSize(): number {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    }
  }
  return totalSize * 2; // Approximate size in bytes (UTF-16 encoding)
}

// Attempt to revalidate stale cache entries when back online
function revalidateStaleEntries(): void {
  // In a full implementation, this would check for stale entries and refresh them from the API
  // For now, we'll just log that we would do this
  console.log('Network is online, would revalidate stale cache entries here');
}

// Save cache to localStorage with metadata and versioning
function persistCacheToStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    // Create a cache object with metadata
    const cacheData = {
      version: CACHE_CONFIG.VERSION,
      timestamp: Date.now(),
      data: cache
    };
    
    localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Failed to store cache in localStorage:', error)
    
    // If storage is full, clear least used entries and try again
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up cache...');
      cleanupCache(true)
      try {
        const cacheData = {
          version: CACHE_CONFIG.VERSION,
          timestamp: Date.now(),
          data: cache
        };
        localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(cacheData))
      } catch (innerError) {
        console.error('Still failed to store cache after cleanup:', innerError)
        // As a last resort, clear older entries from localStorage
        pruneLocalStorage();
      }
    }
  }
}

// Prune other localStorage entries if needed
function pruneLocalStorage(): void {
  try {
    // Find non-essential items to remove
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith(CACHE_CONFIG.STORAGE_KEY)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove up to half of the non-essential items
    const removeCount = Math.ceil(keysToRemove.length / 2);
    keysToRemove.slice(0, removeCount).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Pruned ${removeCount} items from localStorage to free up space`);
  } catch (e) {
    console.error('Error pruning localStorage:', e);
  }
}

// Load cache from localStorage with version checking
export function loadCacheFromStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      const storedCache = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY)
      if (storedCache) {
        const parsedData = JSON.parse(storedCache)
        
        // Check cache version
        if (parsedData.version !== CACHE_CONFIG.VERSION) {
          console.warn(`Cache version mismatch: stored ${parsedData.version}, current ${CACHE_CONFIG.VERSION}. Rebuilding cache.`);
          localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
          return;
        }
        
        const parsedCache = parsedData.data;
        
        // Merge with current cache, preserving in-memory entries
        Object.entries(parsedCache.analyze).forEach(([key, value]) => {
          if (!cache.analyze[key]) {
            cache.analyze[key] = value as CacheEntry
          }
        })
        
        Object.entries(parsedCache.future).forEach(([key, value]) => {
          if (!cache.future[key]) {
            cache.future[key] = value as CacheEntry
          }
        })
        
        console.log(`Cache loaded from storage: ${Object.keys(parsedCache.analyze).length} analyze entries, ${Object.keys(parsedCache.future).length} future entries`);
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
      // If there's an error parsing the cache, reset it
      try {
        localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
        console.log('Removed corrupted cache from localStorage');
      } catch (e) {
        console.error('Failed to remove corrupted cache:', e);
      }
    }
  }
}

// Check if a cache entry is expired or stale
function getCacheEntryStatus(entry: CacheEntry): CacheStatus {
  const now = Date.now();
  
  if (!entry) {
    return 'miss';
  }
  
  // Entry is completely expired
  if (now > entry.expiresAt) {
    return 'expired';
  }
  
  // Entry still valid
  return 'hit';
}

// Get the appropriate TTL based on source type and cache type
function getTTL(type: CacheType, source: 'api' | 'demo' | 'fallback'): number {
  if (source === 'demo') {
    return CACHE_CONFIG.TTL.demo;
  } else if (source === 'fallback') {
    return CACHE_CONFIG.TTL.fallback;
  } else {
    return CACHE_CONFIG.TTL[type];
  }
}

// Clean up expired or least used entries
export function cleanupCache(force: boolean = false): void {
  // Skip aggressive cleanup in demo mode unless forced
  if (CACHE_CONFIG.DEMO_MODE && !force) {
    // In demo mode, only clean out expired entries
    cleanCacheCategory('analyze', false);
    cleanCacheCategory('future', false);
  } else {
    // In regular mode or when forced, do a more thorough cleanup
    cleanCacheCategory('analyze', true);
    cleanCacheCategory('future', true);
  }
  
  // Persist changes
  if (typeof window !== 'undefined') {
    persistCacheToStorage();
  }
  
  if (force) {
    console.log('Forced cache cleanup completed');
  }
}

// Clean a specific cache category
function cleanCacheCategory(type: CacheType, aggressive: boolean): void {
  const now = Date.now();
  let removedCount = 0;
  
  // Step 1: Remove expired entries
  Object.entries(cache[type]).forEach(([key, entry]) => {
    if (now > entry.expiresAt) {
      delete cache[type][key];
      removedCount++;
    }
  });
  
  // Only perform the rest if we're doing an aggressive cleanup
  if (aggressive) {
    // Step 2: If still too many entries, remove least used
    const entries = Object.entries(cache[type]);
    if (entries.length > CACHE_CONFIG.MAX_ENTRIES) {
      // Sort by source (keep demo and fallback), then by hits, then by timestamp
      const sortedEntries = entries.sort((a, b) => {
        const sourceA = a[1].source;
        const sourceB = b[1].source;
        
        // Keep demo and fallback entries if possible
        if (sourceA !== sourceB) {
          if (sourceA === 'demo') return 1;  // Demo entries sort to the end (keep)
          if (sourceB === 'demo') return -1; // Demo entries sort to the end (keep)
          if (sourceA === 'fallback') return 1; // Fallback entries sort toward the end (keep)
          if (sourceB === 'fallback') return -1; // Fallback entries sort toward the end (keep)
        }
        
        // Then sort by hits (ascending)
        if (a[1].hits !== b[1].hits) {
          return a[1].hits - b[1].hits;
        }
        
        // Finally by timestamp (oldest first)
        return a[1].timestamp - b[1].timestamp;
      });
      
      // Remove excess entries (least important first)
      const entriesToRemove = sortedEntries.slice(0, entries.length - CACHE_CONFIG.MAX_ENTRIES);
      entriesToRemove.forEach(([key]) => {
        delete cache[type][key];
        removedCount++;
      });
    }
  }
  
  if (removedCount > 0) {
    console.log(`Cleaned ${removedCount} entries from ${type} cache`);
  }
}

// Generate hash for an image
export function getImageHash(imageData: string): string {
  // For base64 images, hash the data
  try {
    // Skip the metadata part of base64 for more consistent hashing
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
      
    return crypto.createHash('md5').update(base64Data).digest('hex');
  } catch (error) {
    console.error('Error generating image hash:', error);
    // Fallback to a less reliable but safe method
    return crypto.createHash('md5').update(String(Date.now() + Math.random())).digest('hex');
  }
}

// Get cached response with status information
export function getCachedResponseWithStatus(type: CacheType, imageHash: string): { status: CacheStatus, data: any | null } {
  const cacheEntry = cache[type][imageHash];
  
  if (!cacheEntry) {
    return { status: 'miss', data: null };
  }
  
  const status = getCacheEntryStatus(cacheEntry);
  
  // Handle based on status
  if (status === 'expired') {
    // For expired entries, keep them in cache but mark for revalidation
    // In demo mode, we might still want to use expired entries
    if (CACHE_CONFIG.DEMO_MODE || cacheEntry.source === 'demo' || cacheEntry.source === 'fallback') {
      // In demo mode, we'll still return expired entries
      cacheEntry.hits++;
      return { status: 'stale', data: cacheEntry.data };
    }
    
    // In normal mode, remove expired entries and return null
    delete cache[type][imageHash];
    return { status: 'expired', data: null };
  }
  
  // For valid entries, increment hit counter and return data
  cacheEntry.hits++;
  
  return { status: 'hit', data: cacheEntry.data };
}

// Simplified version of the above for backward compatibility
export function getCachedResponse(type: CacheType, imageHash: string): any {
  const { status, data } = getCachedResponseWithStatus(type, imageHash);
  return (status === 'hit' || (CACHE_CONFIG.DEMO_MODE && status === 'stale')) ? data : null;
}

// Cache a response
export function cacheResponse(type: CacheType, imageHash: string, data: any, source: 'api' | 'demo' | 'fallback' = 'api'): void {
  const now = Date.now();
  const ttl = getTTL(type, source);
  
  cache[type][imageHash] = {
    data,
    timestamp: now,
    hits: 1,
    source,
    expiresAt: now + ttl
  };
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    persistCacheToStorage();
  }
}

// Clear cache for a specific type
export function clearCache(type?: CacheType): void {
  if (type) {
    // Clear specific cache type
    cache[type] = {};
  } else {
    // Clear all cache
    cache.analyze = {};
    cache.future = {};
  }
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    persistCacheToStorage();
  }
  
  console.log(`Cache ${type ? type : 'completely'} cleared`);
}

// Network status detection with more detail
export function getNetworkStatus(): { online: boolean, type?: string, effectiveType?: string } {
  if (typeof navigator === 'undefined') {
    return { online: true };
  }
  
  const status = {
    online: navigator.onLine,
  };
  
  // Check for navigator.connection (Network Information API)
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.type) {
      Object.assign(status, { type: connection.type });
    }
    if (connection.effectiveType) {
      Object.assign(status, { effectiveType: connection.effectiveType });
    }
  }
  
  return status;
}

// Simplified version for backward compatibility
export function isOnline(): boolean {
  return getNetworkStatus().online;
}

// Pre-warm cache with test images
export async function prewarmCache(testImages: { url: string, data: string, type: 'analyze' | 'future', responseData: any }[]): Promise<void> {
  console.log(`Pre-warming cache with ${testImages.length} test images...`);
  let successCount = 0;
  
  for (const image of testImages) {
    try {
      // Generate hash for the image
      const imageHash = getImageHash(image.data);
      
      // Cache the response with specific source
      cacheResponse(image.type, imageHash, image.responseData, 'demo');
      
      successCount++;
    } catch (error) {
      console.error(`Error pre-warming cache for image ${image.url}:`, error);
    }
  }
  
  console.log(`Successfully pre-warmed cache with ${successCount}/${testImages.length} images`);
}

// Create or update demo data
export function createDemoData(demoImages: { url: string, data: string, analyzeData: any, futureData: any }[]): void {
  if (typeof window === 'undefined') return;
  
  console.log(`Creating demo data for ${demoImages.length} images...`);
  
  try {
    for (const image of demoImages) {
      // Generate hash for the image
      const imageHash = getImageHash(image.data);
      
      // Store image data in localStorage for quick retrieval
      localStorage.setItem(`demoImage_${imageHash}`, image.data);
      
      // Cache analyze response
      if (image.analyzeData) {
        cacheResponse('analyze', imageHash, image.analyzeData, 'demo');
      }
      
      // Cache future response
      if (image.futureData) {
        cacheResponse('future', imageHash, image.futureData, 'demo');
      }
    }
    
    console.log('Demo data created successfully');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
}

// Get fallback analysis data for demo reliability
export function getFallbackAnalysisData(): any {
  // Generate a unique fallback ID for the session
  const fallbackId = getFallbackId();
  
  // Define basic dimensions for annotation calculations 
  // (prevents "intersects" error from undefined values)
  const imgWidth = 600;
  const imgHeight = 800;
  
  const fallbackData = {
    components: [
      {
        type: 'Transformateur',
        confidence: 0.95,
        details: 'Transformateur de distribution, modèle standard pour zone urbaine.',
        condition: 'Bon état',
        risks: 'Végétation à proximité pourrait poser un risque dans les prochaines années.'
      },
      {
        type: 'Ligne électrique',
        confidence: 0.92,
        details: 'Ligne de moyenne tension, probablement 25kV.',
        condition: 'État correct',
        risks: 'Branches à proximité, élagage recommandé dans les 6 mois.'
      },
      {
        type: 'Poteau',
        confidence: 0.98,
        details: 'Poteau en bois, installation standard.',
        condition: 'Usure normale',
        risks: 'Aucun risque immédiat identifié.'
      }
    ],
    annotations: [
      {
        id: '1',
        type: 'rectangle',
        geometry: {
          x: 0.1 * imgWidth,
          y: 0.2 * imgHeight,
          width: 0.2 * imgWidth,
          height: 0.3 * imgHeight
        },
        data: {
          label: 'Transformateur',
          description: 'Transformateur de distribution'
        }
      },
      {
        id: '2',
        type: 'rectangle',
        geometry: {
          x: 0.3 * imgWidth,
          y: 0.1 * imgHeight,
          width: 0.5 * imgWidth,
          height: 0.05 * imgHeight
        },
        data: {
          label: 'Ligne électrique',
          description: 'Ligne moyenne tension'
        }
      },
      {
        id: '3',
        type: 'rectangle',
        geometry: {
          x: 0.4 * imgWidth,
          y: 0.2 * imgHeight,
          width: 0.08 * imgWidth,
          height: 0.6 * imgHeight
        },
        data: {
          label: 'Poteau',
          description: 'Poteau en bois'
        }
      }
    ],
    // Add metadata for traceability
    meta: {
      source: 'fallback',
      id: fallbackId,
      timestamp: Date.now()
    }
  };
  
  // Store in cache for consistent retrieval
  cacheResponse('analyze', `fallback_${fallbackId}`, fallbackData, 'fallback');
  
  return fallbackData;
}

// Get fallback future projection data for demo reliability
export function getFallbackFutureData(): any {
  // Use the same fallback ID as analysis for consistency
  const fallbackId = getFallbackId();
  
  const fallbackData = {
    projectionDate: 'Mai 2030',
    vegetationGrowth: 'Significatif',
    potentialIssues: [
      {
        component: 'Transformateur',
        risk: 'Élevé',
        description: 'La végétation pourrait entrer en contact avec le transformateur d\'ici 3 ans.'
      },
      {
        component: 'Ligne électrique',
        risk: 'Moyen',
        description: 'Branches au-dessus de la ligne nécessiteront un élagage dans les 1-2 ans.'
      },
      {
        component: 'Poteau',
        risk: 'Faible',
        description: 'Fondation stable, mais surveillance recommandée pour la végétation environnante.'
      }
    ],
    recommendations: [
      'Planifier un élagage préventif dans les 12 prochains mois',
      'Inspecter le site à nouveau dans 6 mois',
      'Établir un plan de gestion de la végétation sur 5 ans',
      'Considérer l\'installation d\'équipement de protection supplémentaire'
    ],
    // Add metadata for traceability
    meta: {
      source: 'fallback',
      id: fallbackId,
      timestamp: Date.now()
    }
  };
  
  // Store in cache for consistent retrieval
  cacheResponse('future', `fallback_${fallbackId}`, fallbackData, 'fallback');
  
  return fallbackData;
}

// Get or create a consistent fallback ID for the session
function getFallbackId(): string {
  if (typeof window === 'undefined') {
    return 'server_fallback';
  }
  
  // Try to get existing fallback ID from session
  let fallbackId = sessionStorage.getItem('energiaFallbackId');
  
  if (!fallbackId) {
    // Create a new fallback ID
    fallbackId = `fallback_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    // Store it for future use in this session
    sessionStorage.setItem('energiaFallbackId', fallbackId);
  }
  
  return fallbackId;
}

// Get a consistent fallback image (for demo mode)
export function getFallbackImage(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  try {
    // Try to get a random demo image from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('demoImage_'));
    if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const imageData = localStorage.getItem(randomKey);
      if (imageData) {
        return imageData;
      }
    }
    
    // If no demo images available, return empty string
    // In a real app, we could return a static base64 image
    return '';
  } catch (error) {
    console.error('Error getting fallback image:', error);
    return '';
  }
}