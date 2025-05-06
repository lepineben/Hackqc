import crypto from 'crypto'

// Cache entry with timestamp for expiration
type CacheEntry = {
  data: any;
  timestamp: number;
  hits?: number;
}

// In-memory cache for demo
const cache: {
  analyze: Record<string, CacheEntry>;
  future: Record<string, CacheEntry>;
} = {
  analyze: {},
  future: {}
}

// Cache configuration
const CACHE_CONFIG = {
  TTL: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
  MAX_ENTRIES: 100, // Maximum entries in each cache category
  AUTO_CLEANUP_INTERVAL: 1000 * 60 * 30, // Run cleanup every 30 minutes
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
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
  // Add pre-cached responses to cache
  Object.entries(preCachedResponses.analyze).forEach(([key, value]) => {
    cache.analyze[key] = {
      data: value,
      timestamp: Date.now(),
      hits: 0
    }
  })
  
  Object.entries(preCachedResponses.future).forEach(([key, value]) => {
    cache.future[key] = {
      data: value,
      timestamp: Date.now(),
      hits: 0
    }
  })
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      persistCacheToStorage()
    } catch (error) {
      console.error('Failed to store cache in localStorage:', error)
    }
  }
  
  // Set up auto cleanup
  if (typeof window !== 'undefined') {
    setInterval(cleanupCache, CACHE_CONFIG.AUTO_CLEANUP_INTERVAL)
  }
}

// Save cache to localStorage
function persistCacheToStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('energiaCache', JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to store cache in localStorage:', error)
    
    // If storage is full, clear least used entries and try again
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      cleanupCache(true)
      try {
        localStorage.setItem('energiaCache', JSON.stringify(cache))
      } catch (innerError) {
        console.error('Still failed to store cache after cleanup:', innerError)
      }
    }
  }
}

// Load cache from localStorage
export function loadCacheFromStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      const storedCache = localStorage.getItem('energiaCache')
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache)
        
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
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error)
    }
  }
}

// Check if a cache entry is expired
function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp > CACHE_CONFIG.TTL
}

// Clean up expired or least used entries
export function cleanupCache(force: boolean = false): void {
  // Skip in demo mode unless forced
  if (CACHE_CONFIG.DEMO_MODE && !force) return
  
  // Clean analyze cache
  cleanCacheCategory('analyze')
  
  // Clean future cache
  cleanCacheCategory('future')
  
  // Persist changes
  if (typeof window !== 'undefined') {
    persistCacheToStorage()
  }
}

// Clean a specific cache category
function cleanCacheCategory(type: 'analyze' | 'future'): void {
  // Remove expired entries
  Object.keys(cache[type]).forEach(key => {
    if (isExpired(cache[type][key])) {
      delete cache[type][key]
    }
  })
  
  // If still too many entries, remove least used
  const entries = Object.entries(cache[type])
  if (entries.length > CACHE_CONFIG.MAX_ENTRIES) {
    // Sort by hits (ascending) and timestamp (oldest first)
    const sortedEntries = entries.sort((a, b) => {
      const hitsA = a[1].hits || 0
      const hitsB = b[1].hits || 0
      
      // First sort by hits
      if (hitsA !== hitsB) {
        return hitsA - hitsB
      }
      
      // Then by timestamp
      return a[1].timestamp - b[1].timestamp
    })
    
    // Remove excess entries
    const entriesToRemove = sortedEntries.slice(0, entries.length - CACHE_CONFIG.MAX_ENTRIES)
    entriesToRemove.forEach(([key]) => {
      delete cache[type][key]
    })
  }
}

// Generate hash for an image
export function getImageHash(imageData: string): string {
  // For base64 images, hash the data
  return crypto.createHash('md5').update(imageData).digest('hex')
}

// Get cached response
export function getCachedResponse(type: 'analyze' | 'future', imageHash: string): any {
  const cacheEntry = cache[type][imageHash]
  
  if (!cacheEntry) {
    return null
  }
  
  // In non-demo mode, check expiration
  if (!CACHE_CONFIG.DEMO_MODE && isExpired(cacheEntry)) {
    delete cache[type][imageHash]
    return null
  }
  
  // Increment hit counter
  cacheEntry.hits = (cacheEntry.hits || 0) + 1
  
  return cacheEntry.data
}

// Cache a response
export function cacheResponse(type: 'analyze' | 'future', imageHash: string, data: any): void {
  cache[type][imageHash] = {
    data,
    timestamp: Date.now(),
    hits: 1
  }
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    persistCacheToStorage()
  }
}

// Network status detection
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

// Pre-warm cache with test images
export async function prewarmCache(testImages: { url: string, data: string }[]): Promise<void> {
  // Implementation to process test images and store responses
  // Will be implemented when we have actual demo images
}

// Create demo data directory
export function createDemoData(): void {
  if (typeof window !== 'undefined') {
    // This function will be implemented when we create the demo images
  }
}

// Get fallback analysis data for demo reliability
export function getFallbackAnalysisData(): any {
  return {
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
          x: 20,
          y: 30,
          width: 100,
          height: 150
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
          x: 200,
          y: 50,
          width: 350,
          height: 5
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
          x: 180,
          y: 60,
          width: 30,
          height: 300
        },
        data: {
          label: 'Poteau',
          description: 'Poteau en bois'
        }
      }
    ]
  }
}

// Get fallback future projection data for demo reliability
export function getFallbackFutureData(): any {
  return {
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
    ]
  }
}