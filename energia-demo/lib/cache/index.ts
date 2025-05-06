import crypto from 'crypto'

// In-memory cache for demo
const cache: {
  analyze: Record<string, any>;
  future: Record<string, any>;
} = {
  analyze: {},
  future: {}
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
  Object.assign(cache.analyze, preCachedResponses.analyze)
  Object.assign(cache.future, preCachedResponses.future)
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('energiaCache', JSON.stringify(cache))
    } catch (error) {
      console.error('Failed to store cache in localStorage:', error)
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
        Object.assign(cache.analyze, parsedCache.analyze)
        Object.assign(cache.future, parsedCache.future)
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error)
    }
  }
}

// Generate hash for an image
export function getImageHash(imageData: string): string {
  // For base64 images, hash the data
  return crypto.createHash('md5').update(imageData).digest('hex')
}

// Get cached response
export function getCachedResponse(type: 'analyze' | 'future', imageHash: string): any {
  return cache[type][imageHash]
}

// Cache a response
export function cacheResponse(type: 'analyze' | 'future', imageHash: string, data: any): void {
  cache[type][imageHash] = data
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('energiaCache', JSON.stringify(cache))
    } catch (error) {
      console.error('Failed to update cache in localStorage:', error)
    }
  }
}

// Network status detection
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

// Pre-warm cache with test images
export async function prewarmCache(testImages: { url: string, data: string }[]): Promise<void> {
  // Implementation to process test images and store responses
  // Will be implemented later
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
    // This will be expanded with more comprehensive data
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
      }
    ],
    recommendations: [
      'Planifier un élagage préventif dans les 12 prochains mois',
      'Inspecter le site à nouveau dans 6 mois',
      'Considérer l\'installation d\'équipement de protection supplémentaire'
    ]
  }
}