import path from 'path';
import { getImageHash, cacheResponse, prewarmCache, createDemoData, CacheType, getNetworkStatus } from '../cache';

// Demo storage keys - must be declared before importing anything that references them
export const DEMO_MODE_KEY = 'energia_demo_mode';
export const DEMO_SCENARIO_KEY = 'energia_demo_scenario';
export const DEMO_LOGS_KEY = 'energia_demo_logs';

// Only import types, not the actual OpenAI client
import type { AnalysisResult, FutureAnalysis } from '../openai';

// Define a client-side stub function for generateFutureImage
// This ensures we don't try to import the actual OpenAI client on the client side
function clientSideStub(imageData: string): Promise<string> {
  return Promise.resolve(imageData);
}

// Only import actual functions on the server side
// On client side, we'll use pre-cached data only
const generateFutureImage = 
  // Check if we're on the server side
  typeof window === 'undefined' 
    // Server-side: Safely import the real function
    ? (() => {
        try {
          // We use a dynamic import here to avoid bundling server-side code on the client
          return require('../openai').generateFutureImage;
        } catch (error) {
          console.warn('Failed to import generateFutureImage on server:', error);
          return clientSideStub;
        }
      })() 
    // Client-side: Use the stub function
    : clientSideStub;

// Demo image paths - relative to the public directory
export const DEMO_IMAGES = [
  '/demo-images/01.jpg', // Default/general image
  '/demo-images/02.jpg', // Powerline-focused image
  '/demo-images/03.jpg', // Transformer-focused image
  '/demo-images/04.jpg', // Substation image
  '/demo-images/05.jpg', // Distribution pole image
];

// Demo scenarios mapped to specific images
export const DEMO_SCENARIOS = {
  default: { 
    name: 'General Infrastructure', 
    imagePath: '/demo-images/01.jpg',
    futureImagePath: '/demo-images/01_future.jpg', // Will be generated on first run if missing
    description: 'Standard electrical infrastructure with multiple components'
  },
  powerline: { 
    name: 'Power Line Focus', 
    imagePath: '/demo-images/02.jpg',
    futureImagePath: '/demo-images/02_future.jpg', // Will be generated on first run if missing
    description: 'Demonstration focused on power lines with vegetation risks'
  },
  transformer: { 
    name: 'Transformer Focus', 
    imagePath: '/demo-images/03.jpg',
    futureImagePath: '/demo-images/03_future.jpg', // Will be generated on first run if missing
    description: 'Demonstration focused on transformer equipment'
  },
  substation: { 
    name: 'Substation Focus', 
    imagePath: '/demo-images/04.jpg',
    futureImagePath: '/demo-images/04_future.jpg', // Will be generated on first run if missing
    description: 'Larger electrical substation with multiple components'
  },
  distribution: { 
    name: 'Distribution Pole', 
    imagePath: '/demo-images/05.jpg',
    futureImagePath: '/demo-images/05_future.jpg', // Will be generated on first run if missing
    description: 'Standard distribution pole with high vegetation risk'
  }
};

// Demo mode configuration
export const DEMO_CONFIG = {
  PRELOAD_IMAGES: true, // Should we preload all images
  OFFLINE_CAPABLE: true, // Does the demo need to work offline
  SIMULATE_DELAY: true, // Add realistic processing delay
  MIN_PROCESSING_DELAY: 1000, // Minimum delay for operations (ms)
  MAX_PROCESSING_DELAY: 3000, // Maximum delay for operations (ms)
  PERSIST_SESSION: true, // Remember demo state across page refreshes
  FORCE_DEMO_FOR_MISSING_KEYS: true, // Use demo mode if API keys are missing
  VERSION: '1.0', // Demo data version
  MAX_LOGS: 100, // Maximum number of logs to store
  KEY_COMBO: { ctrl: true, shift: true, key: 'D' }, // Keyboard shortcut for demo mode
  TRANSITION_TIMING: {
    NORMAL: 300, // Standard transition time (ms)
    FAST: 150,   // Fast transition time (ms)
    SLOW: 600    // Slow transition time (ms)
  }
};

// Get demo status - extended with scenario info
export function getDemoStatus(): { 
  enabled: boolean, 
  reason: string, 
  mode: string, 
  scenario: string,
  manuallyActivated: boolean 
} {
  // Server-side fallback values
  if (typeof window === 'undefined') {
    return {
      enabled: process.env.NEXT_PUBLIC_DEMO_MODE === 'true', 
      reason: 'Server-side default', 
      mode: 'standard', 
      scenario: 'default',
      manuallyActivated: false
    };
  }
  
  // Check for manual activation first (client-side only)
  const storedDemo = localStorage.getItem(DEMO_MODE_KEY);
  let manuallyActivated = false;
  let scenario = 'default';
  
  // If demo mode was manually activated
  if (storedDemo) {
    try {
      const demoData = JSON.parse(storedDemo);
      manuallyActivated = demoData.active === true;
      scenario = demoData.scenario || 'default';
    } catch (e) {
      console.error('Failed to parse stored demo settings:', e);
    }
  }
  
  const envEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  // Check for missing API key
  const apiKeyMissing = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '';
  const networkOffline = !navigator.onLine;
  
  let enabled = envEnabled || manuallyActivated;
  let reason = manuallyActivated ? 'Manually activated' : 'Configured in environment';
  let mode = 'standard';
  
  if (apiKeyMissing && DEMO_CONFIG.FORCE_DEMO_FOR_MISSING_KEYS) {
    enabled = true;
    reason = 'API key missing';
    mode = 'fallback';
  }
  
  if (networkOffline && DEMO_CONFIG.OFFLINE_CAPABLE) {
    enabled = true;
    reason = 'Network offline';
    mode = 'offline';
  }
  
  return { enabled, reason, mode, scenario, manuallyActivated };
}

// Convert image URL to base64 (client-side only)
export async function imageUrlToBase64(url: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  try {
    // First check if we already have this cached
    const cachedKey = `demoImageUrl_${url}`;
    const cachedImage = localStorage.getItem(cachedKey);
    if (cachedImage) {
      return cachedImage;
    }
    
    // If not, fetch and convert
    const response = await fetch(url, {
      // Use cache: 'force-cache' to ensure we don't repeatedly fetch the same image
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Cache the result for future use
          try {
            localStorage.setItem(cachedKey, reader.result);
          } catch (storageError) {
            console.warn('Failed to cache image in localStorage:', storageError);
          }
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
}

// Add a realistic processing delay for demo
export async function simulateProcessingDelay(operation: string): Promise<void> {
  if (!DEMO_CONFIG.SIMULATE_DELAY) return;
  
  const delayTime = Math.floor(
    Math.random() * 
    (DEMO_CONFIG.MAX_PROCESSING_DELAY - DEMO_CONFIG.MIN_PROCESSING_DELAY) + 
    DEMO_CONFIG.MIN_PROCESSING_DELAY
  );
  
  console.log(`Demo: Simulating ${operation} delay of ${delayTime}ms`);
  
  return new Promise(resolve => setTimeout(resolve, delayTime));
}

// Pre-defined cached analysis data for demo images
export const demoAnalysisData: Record<string, AnalysisResult> = {
  '01': {
    components: [
      {
        type: 'Transformateur',
        confidence: 0.95,
        details: 'Transformateur de distribution, 25kV à 120/240V',
        condition: 'Excellent état, installation récente',
        risks: 'Arbres à proximité pourraient poser un risque dans 3-5 ans'
      },
      {
        type: 'Ligne électrique',
        confidence: 0.92,
        details: 'Ligne triphasée moyenne tension, 25kV',
        condition: 'Bon état, isolateurs intacts',
        risks: 'Branches de l\'érable à moins de 2m, élagage requis d\'ici 6 mois'
      },
      {
        type: 'Poteau',
        confidence: 0.98,
        details: 'Poteau de bois traité classe 3, hauteur 12m',
        condition: 'Usure normale, âge estimé 8-10 ans',
        risks: 'Aucun risque immédiat, base stable'
      }
    ],
    annotations: [
      {
        id: '1',
        type: 'rectangle',
        geometry: {
          x: 40,
          y: 100,
          width: 120,
          height: 180
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
          x: 180,
          y: 80,
          width: 280,
          height: 10
        },
        data: {
          label: 'Ligne électrique',
          description: 'Ligne triphasée moyenne tension'
        }
      },
      {
        id: '3',
        type: 'rectangle',
        geometry: {
          x: 200,
          y: 90,
          width: 30,
          height: 350
        },
        data: {
          label: 'Poteau',
          description: 'Poteau de bois traité'
        }
      }
    ]
  },
  '02': {
    components: [
      {
        type: 'Pylône de transmission',
        confidence: 0.97,
        details: 'Structure métallique, ligne haute tension 120kV',
        condition: 'Excellent état, peinture récente',
        risks: 'Végétation dense au pied du pylône, attention à la croissance rapide'
      },
      {
        type: 'Lignes haute tension',
        confidence: 0.94,
        details: 'Câbles conducteurs en aluminium, 120kV',
        condition: 'Bon état général, aucun dommage visible',
        risks: 'Corridor de passage étroit, arbres à proximité des limites de sécurité'
      },
      {
        type: 'Isolateurs',
        confidence: 0.91,
        details: 'Isolateurs en porcelaine, chaînes multiples',
        condition: 'État correct, légère usure visible',
        risks: 'Aucun risque lié à la végétation'
      }
    ],
    annotations: [
      {
        id: '1',
        type: 'rectangle',
        geometry: {
          x: 150,
          y: 80,
          width: 100,
          height: 300
        },
        data: {
          label: 'Pylône de transmission',
          description: 'Structure métallique haute tension'
        }
      },
      {
        id: '2',
        type: 'rectangle',
        geometry: {
          x: 50,
          y: 120,
          width: 300,
          height: 15
        },
        data: {
          label: 'Lignes haute tension',
          description: 'Câbles conducteurs en aluminium'
        }
      },
      {
        id: '3',
        type: 'rectangle',
        geometry: {
          x: 180,
          y: 140,
          width: 40,
          height: 60
        },
        data: {
          label: 'Isolateurs',
          description: 'Isolateurs en porcelaine'
        }
      }
    ]
  },
  '03': {
    components: [
      {
        type: 'Sectionneurs',
        confidence: 0.93,
        details: 'Sectionneurs triphasés, équipement de manœuvre',
        condition: 'État moyen, signes de corrosion mineurs',
        risks: 'Végétation dense à proximité, risque accru en cas de vent fort'
      },
      {
        type: 'Parafoudres',
        confidence: 0.89,
        details: 'Dispositifs de protection contre les surtensions',
        condition: 'Bon état, installation récente',
        risks: 'Aucun risque immédiat lié à la végétation'
      },
      {
        type: 'Poteau composite',
        confidence: 0.96,
        details: 'Poteau en matériau composite, plus résistant que le bois',
        condition: 'Excellent état, aucune dégradation visible',
        risks: 'Arbustes en croissance à surveiller dans les 2-3 prochaines années'
      }
    ],
    annotations: [
      {
        id: '1',
        type: 'rectangle',
        geometry: {
          x: 100,
          y: 50,
          width: 80,
          height: 120
        },
        data: {
          label: 'Sectionneurs',
          description: 'Sectionneurs triphasés'
        }
      },
      {
        id: '2',
        type: 'rectangle',
        geometry: {
          x: 220,
          y: 70,
          width: 40,
          height: 90
        },
        data: {
          label: 'Parafoudres',
          description: 'Dispositifs de protection'
        }
      },
      {
        id: '3',
        type: 'rectangle',
        geometry: {
          x: 160,
          y: 30,
          width: 25,
          height: 300
        },
        data: {
          label: 'Poteau composite',
          description: 'Poteau en matériau composite'
        }
      }
    ]
  },
  '04': {
    components: [
      {
        type: 'Transformateur de puissance',
        confidence: 0.98,
        details: 'Transformateur triphasé sous-station, 69kV/25kV',
        condition: 'Bon état, maintenance régulière visible',
        risks: 'Végétation environnante bien contrôlée, risque faible'
      },
      {
        type: 'Disjoncteurs HT',
        confidence: 0.94,
        details: 'Disjoncteurs haute tension à SF6',
        condition: 'État correct, fonctionnels',
        risks: 'Aucun risque immédiat lié à la végétation'
      },
      {
        type: 'Barres collectrices',
        confidence: 0.91,
        details: 'Barres en aluminium pour distribution de puissance',
        condition: 'Bon état, connections solides',
        risks: 'Arbres matures en bordure de terrain à surveiller'
      }
    ],
    annotations: [
      {
        id: '1',
        type: 'rectangle',
        geometry: {
          x: 120,
          y: 150,
          width: 180,
          height: 120
        },
        data: {
          label: 'Transformateur de puissance',
          description: 'Transformateur sous-station'
        }
      },
      {
        id: '2',
        type: 'rectangle',
        geometry: {
          x: 80,
          y: 90,
          width: 70,
          height: 110
        },
        data: {
          label: 'Disjoncteurs HT',
          description: 'Disjoncteurs haute tension'
        }
      },
      {
        id: '3',
        type: 'rectangle',
        geometry: {
          x: 190,
          y: 80,
          width: 200,
          height: 30
        },
        data: {
          label: 'Barres collectrices',
          description: 'Barres en aluminium'
        }
      }
    ]
  },
  '05': {
    components: [
      {
        type: 'Poteau bois avec traverses',
        confidence: 0.97,
        details: 'Poteau de distribution avec traverses multiples',
        condition: 'État moyen, signes d\'usure visible',
        risks: 'Arbres à proximité avec branches surplombantes, risque élevé'
      },
      {
        type: 'Fusibles',
        confidence: 0.91,
        details: 'Fusibles de protection de ligne, type expulsion',
        condition: 'Bon état, récemment remplacés',
        risks: 'Risque modéré lié à la densité de végétation environnante'
      },
      {
        type: 'Lignes de distribution',
        confidence: 0.95,
        details: 'Lignes triphasées moyenne tension avec neutre',
        condition: 'État correct, légère usure',
        risks: 'Proximité immédiate de plusieurs arbres en croissance, élagage nécessaire'
      }
    ],
    annotations: [
      {
        id: '1',
        type: 'rectangle',
        geometry: {
          x: 150,
          y: 100,
          width: 40,
          height: 280
        },
        data: {
          label: 'Poteau bois avec traverses',
          description: 'Poteau de distribution'
        }
      },
      {
        id: '2',
        type: 'rectangle',
        geometry: {
          x: 170,
          y: 120,
          width: 30,
          height: 60
        },
        data: {
          label: 'Fusibles',
          description: 'Fusibles de protection'
        }
      },
      {
        id: '3',
        type: 'rectangle',
        geometry: {
          x: 70,
          y: 110,
          width: 260,
          height: 20
        },
        data: {
          label: 'Lignes de distribution',
          description: 'Lignes moyenne tension'
        }
      }
    ]
  }
};

// Pre-defined cached future data for demo images
export const demoFutureData: Record<string, FutureAnalysis> = {
  '01': {
    projectionDate: 'Mai 2030',
    vegetationGrowth: 'Croissance de 40-50%, particulièrement rapide pour les érables',
    potentialIssues: [
      {
        component: 'Transformateur',
        risk: 'Élevé',
        description: 'L\'érable à proximité aura significativement grandi et menace directement le transformateur. Contact probable d\'ici 3 ans.'
      },
      {
        component: 'Ligne électrique',
        risk: 'Très élevé',
        description: 'Multiples branches d\'arbres traverseront la ligne, créant des risques de court-circuit lors de vents forts ou tempêtes.'
      },
      {
        component: 'Poteau',
        risk: 'Moyen',
        description: 'Végétation dense à la base pourrait compromettre la stabilité et l\'accès en cas d\'urgence.'
      }
    ],
    recommendations: [
      'Élagage préventif immédiat des arbres à proximité des lignes',
      'Programme d\'inspection bisannuelle recommandé',
      'Considérer l\'abattage contrôlé de l\'érable principal pour éviter des risques futurs',
      'Établir un corridor de sécurité de 3m autour des équipements'
    ]
  },
  '02': {
    projectionDate: 'Mai 2030',
    vegetationGrowth: 'Croissance significative de 30-45% des arbres en périphérie du corridor',
    potentialIssues: [
      {
        component: 'Pylône de transmission',
        risk: 'Faible',
        description: 'La végétation à la base du pylône pourrait compliquer l\'accès pour maintenance.'
      },
      {
        component: 'Lignes haute tension',
        risk: 'Moyen',
        description: 'Plusieurs arbres atteindront la zone de dégagement minimale d\'ici 4-5 ans, créant des risques de proximité.'
      },
      {
        component: 'Corridor de ligne',
        risk: 'Élevé',
        description: 'Rétrécissement progressif du corridor de sécurité dû à la croissance latérale des arbres matures.'
      }
    ],
    recommendations: [
      'Élargissement préventif du corridor de 5m de chaque côté',
      'Mise en place d\'un programme de gestion de végétation sur 10 ans',
      'Surveillance par drones bisannuelle pour identifier les arbres problématiques',
      'Traitement préventif de la végétation à la base du pylône'
    ]
  },
  '03': {
    projectionDate: 'Mai 2030',
    vegetationGrowth: 'Croissance rapide de 50-60% des espèces présentes, principalement des arbustes',
    potentialIssues: [
      {
        component: 'Sectionneurs',
        risk: 'Critique',
        description: 'Végétation atteindra et encombrera les sectionneurs, entravant leur fonctionnement et créant des risques d\'arc électrique.'
      },
      {
        component: 'Parafoudres',
        risk: 'Moyen',
        description: 'Végétation à proximité pourrait réduire l\'efficacité de protection en cas de foudre.'
      },
      {
        component: 'Poteau composite',
        risk: 'Faible',
        description: 'Base du poteau entourée de végétation dense, mais structure non compromise.'
      }
    ],
    recommendations: [
      'Débroussaillage complet dans un rayon de 5m autour des équipements',
      'Installation d\'une barrière anti-végétation à la base',
      'Programme d\'inspection trimestrielle pendant la saison de croissance',
      'Application locale d\'inhibiteurs de croissance pour les espèces les plus problématiques'
    ]
  },
  '04': {
    projectionDate: 'Mai 2030',
    vegetationGrowth: 'Croissance modérée de 20-30%, bien contrôlée mais persistante',
    potentialIssues: [
      {
        component: 'Transformateur de puissance',
        risk: 'Faible',
        description: 'Peu de risques directs, mais la végétation pourrait entraver le refroidissement.'
      },
      {
        component: 'Disjoncteurs HT',
        risk: 'Très faible',
        description: 'Zone bien entretenue, risques négligeables.'
      },
      {
        component: 'Périmètre de sécurité',
        risk: 'Moyen',
        description: 'Arbres matures en bordure pourraient poser des risques en cas de chute.'
      }
    ],
    recommendations: [
      'Maintenir le programme actuel d\'entretien du terrain',
      'Évaluer et potentiellement abattre les arbres matures en périphérie',
      'Installer des barrières anti-racines pour les nouvelles plantations',
      'Augmenter la surface débroussaillée de 3m autour des transformateurs'
    ]
  },
  '05': {
    projectionDate: 'Mai 2030',
    vegetationGrowth: 'Croissance très rapide de 60-70%, situation critique si non gérée',
    potentialIssues: [
      {
        component: 'Poteau bois avec traverses',
        risk: 'Très élevé',
        description: 'Arbres créant un tunnel de végétation autour des équipements, risque imminent de contact.'
      },
      {
        component: 'Fusibles',
        risk: 'Élevé',
        description: 'Branches à proximité directe pouvant causer des déclenchements en cas de vent.'
      },
      {
        component: 'Lignes de distribution',
        risk: 'Critique',
        description: 'Multiples points de contact prévus avec la végétation environnante, risque majeur de panne.'
      }
    ],
    recommendations: [
      'Intervention immédiate d\'élagage radical sur l\'ensemble du segment',
      'Remplacement du poteau bois par une structure plus haute',
      'Élargissement du corridor à 7m de part et d\'autre des lignes',
      'Mise en place d\'un programme d\'inspection mensuelle jusqu\'à résolution des risques critiques'
    ]
  }
};

// Initialize demo mode - simplified version
export async function initializeDemoMode(): Promise<void> {
  // This function would typically be called in _app.tsx
  if (typeof window === 'undefined') return;
  
  // Setup keyboard shortcut for toggling demo mode
  try {
    setupDemoTrigger();
  } catch (e) {
    console.warn('Error setting up demo trigger:', e);
  }
  
  // Check if we should be in demo mode
  const { enabled, reason, mode, scenario } = getDemoStatus();
  console.log(`Demo status: enabled=${enabled}, mode=${mode}, reason=${reason}, scenario=${scenario}`);
  
  // Just log and return - don't do any heavy processing
  if (enabled) {
    console.log('Demo mode is enabled');
    // Initialize demo controller with basic reset
    demoController.reset();
    try {
      logDemoEvent('initialization', `Demo mode initialized (simple mode)`);
    } catch (e) {
      console.warn('Error logging demo event:', e);
    }
  } else {
    console.log('Demo mode not enabled');
  }
  
  return;
}

// Process a single demo image
async function processDemo(imagePath: string, imageId: string): Promise<void> {
  console.log(`Processing demo image ${imageId}...`);
  
  // Convert image to base64
  const base64Data = await imageUrlToBase64(imagePath);
  
  if (!base64Data) {
    console.warn(`Failed to convert demo image ${imageId} to base64`);
    return;
  }
  
  // Store image data for quick access
  const localStorageKey = `demoImage_${imageId}`;
  try {
    localStorage.setItem(localStorageKey, base64Data);
  } catch (e) {
    console.warn(`Failed to store demo image ${imageId} in localStorage:`, e);
  }
  
  // Hash the image for cache lookup
  const imageHash = getImageHash(base64Data);
  
  // Check if we need to generate a future image version
  let futureImageData = base64Data; // Default to original image
  const futureImageLocalStorageKey = `demoFutureImage_${imageId}`;
  let needToGenerateFuture = true;
  
  // Try to load from localStorage first
  try {
    const cachedFutureImage = localStorage.getItem(futureImageLocalStorageKey);
    if (cachedFutureImage) {
      console.log(`Found cached future image for ${imageId}`);
      futureImageData = cachedFutureImage;
      needToGenerateFuture = false;
    }
  } catch (e) {
    console.warn(`Failed to get cached future image for ${imageId}:`, e);
  }
  
  // If we don't have a cached future image, check if a file exists
  if (needToGenerateFuture && typeof window !== 'undefined') {
    const scenarioEntry = Object.values(DEMO_SCENARIOS).find(
      s => s.imagePath.includes(`/${imageId}.`)
    );
    
    if (scenarioEntry && scenarioEntry.futureImagePath) {
      try {
        // Try to load the future image
        const futureData = await imageUrlToBase64(scenarioEntry.futureImagePath);
        if (futureData) {
          console.log(`Loaded future image file for ${imageId}`);
          futureImageData = futureData;
          needToGenerateFuture = false;
          
          // Store it in localStorage for next time
          localStorage.setItem(futureImageLocalStorageKey, futureData);
        }
      } catch (e) {
        console.warn(`Failed to load future image file for ${imageId}:`, e);
      }
    }
  }
  
  // If we still need to generate a future image, try to generate one
  if (needToGenerateFuture) {
    try {
      console.log(`Generating future image for ${imageId}...`);
      // Use OpenAI to generate a future image
      futureImageData = await generateFutureImage(base64Data);
      
      // Store the generated image for future use
      if (futureImageData !== base64Data) { // Only store if it's actually different
        localStorage.setItem(futureImageLocalStorageKey, futureImageData);
        console.log(`Generated and stored future image for ${imageId}`);
      } else {
        console.log(`Failed to generate future image for ${imageId}, using original`);
      }
    } catch (e) {
      console.error(`Error generating future image for ${imageId}:`, e);
    }
  }
  
  // Hash the future image
  const futureImageHash = getImageHash(futureImageData);
  
  // Prepare data for both analysis and future projections
  const demoImages = [];
  
  // Cache analysis data
  if (demoAnalysisData[imageId]) {
    demoImages.push({
      url: imagePath,
      data: base64Data,
      type: 'analyze' as CacheType,
      responseData: demoAnalysisData[imageId]
    });
  }
  
  // Cache future data
  if (demoFutureData[imageId]) {
    const futureData = {
      futureImage: futureImageData, // Use the generated or cached future image
      analysis: demoFutureData[imageId]
    };
    
    demoImages.push({
      url: imagePath,
      data: base64Data,
      type: 'future' as CacheType,
      responseData: futureData
    });
    
    // Also cache the future image by itself
    demoImages.push({
      url: imagePath,
      data: base64Data,
      type: 'futureImage' as CacheType,
      responseData: futureImageData
    });
  }
  
  // Use the prewarmCache function to store everything in cache
  await prewarmCache(demoImages);
  
  console.log(`Demo image ${imageId} processed and cached with future projection`);
}

// Get a random demo image
export function getRandomDemoImage(): string {
  if (typeof window === 'undefined') return DEMO_IMAGES[0];
  
  try {
    // Get all cached demo images
    const demoImageKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('demoImage_'));
    
    if (demoImageKeys.length === 0) {
      // No cached images, return a path
      const randomIndex = Math.floor(Math.random() * DEMO_IMAGES.length);
      return DEMO_IMAGES[randomIndex];
    }
    
    // Get a random cached image
    const randomKey = demoImageKeys[Math.floor(Math.random() * demoImageKeys.length)];
    const cachedImage = localStorage.getItem(randomKey);
    
    if (cachedImage) {
      return cachedImage;
    }
    
    // Fallback to a path
    const randomIndex = Math.floor(Math.random() * DEMO_IMAGES.length);
    return DEMO_IMAGES[randomIndex];
  } catch (error) {
    console.error('Error getting random demo image:', error);
    
    // Fallback to first image
    return DEMO_IMAGES[0];
  }
}

// Get a specific demo image by ID
export function getDemoImageById(imageId: string): string {
  if (typeof window === 'undefined') {
    // Find the path that matches the ID
    const matchingPath = DEMO_IMAGES.find(path => 
      path.includes(`/${imageId}.`));
    return matchingPath || DEMO_IMAGES[0];
  }
  
  try {
    // Check if we have it in localStorage
    const localStorageKey = `demoImage_${imageId}`;
    const cachedImage = localStorage.getItem(localStorageKey);
    
    if (cachedImage) {
      return cachedImage;
    }
    
    // Find the path that matches the ID
    const matchingPath = DEMO_IMAGES.find(path => 
      path.includes(`/${imageId}.`));
    return matchingPath || DEMO_IMAGES[0];
  } catch (error) {
    console.error(`Error getting demo image ${imageId}:`, error);
    return DEMO_IMAGES[0];
  }
}

// Get future image version of a demo image
export function getFutureDemoImageById(imageId: string): string {
  if (typeof window === 'undefined') {
    // Find the scenario that matches the ID
    const scenario = Object.values(DEMO_SCENARIOS).find(s => 
      s.imagePath.includes(`/${imageId}.`));
    
    return scenario?.futureImagePath || DEMO_IMAGES[0];
  }
  
  try {
    // Check if we have a cached future image
    const futureImageKey = `demoFutureImage_${imageId}`;
    const cachedFutureImage = localStorage.getItem(futureImageKey);
    
    if (cachedFutureImage) {
      return cachedFutureImage;
    }
    
    // If not, look for the scenario future image path
    const scenario = Object.values(DEMO_SCENARIOS).find(s => 
      s.imagePath.includes(`/${imageId}.`));
    
    if (scenario?.futureImagePath) {
      return scenario.futureImagePath;
    }
    
    // Fallback to original image
    return getDemoImageById(imageId);
  } catch (error) {
    console.error(`Error getting future demo image ${imageId}:`, error);
    return getDemoImageById(imageId);
  }
}

// Demo mode activation and deactivation functions
export function activateDemoMode(scenario: string = 'default'): void {
  if (typeof window === 'undefined') return;
  
  // Validate scenario
  if (!DEMO_SCENARIOS[scenario]) {
    console.warn(`Unknown scenario: ${scenario}, defaulting to 'default'`);
    scenario = 'default';
  }
  
  // Store in localStorage
  localStorage.setItem(DEMO_MODE_KEY, JSON.stringify({ 
    active: true, 
    scenario,
    activatedAt: Date.now() 
  }));
  
  // Log activation
  logDemoEvent('activation', `Demo mode activated with scenario: ${scenario}`);
  
  console.log(`Demo mode activated with scenario: ${scenario}`);
}

export function deactivateDemoMode(): void {
  if (typeof window === 'undefined') return;
  
  // Remove from localStorage
  localStorage.removeItem(DEMO_MODE_KEY);
  
  // Log deactivation
  logDemoEvent('deactivation', 'Demo mode deactivated');
  
  console.log('Demo mode deactivated');
}

export function changeScenario(newScenario: string): void {
  if (typeof window === 'undefined') return;
  
  // Validate scenario
  if (!DEMO_SCENARIOS[newScenario]) {
    console.warn(`Unknown scenario: ${newScenario}, cannot change`);
    return;
  }
  
  // Get current status
  const { enabled, scenario: currentScenario } = getDemoStatus();
  
  if (!enabled) {
    console.warn('Cannot change scenario - demo mode is not active');
    return;
  }
  
  if (currentScenario === newScenario) {
    console.log(`Already using scenario: ${newScenario}`);
    return;
  }
  
  // Update localStorage
  localStorage.setItem(DEMO_MODE_KEY, JSON.stringify({ 
    active: true, 
    scenario: newScenario,
    activatedAt: Date.now() 
  }));
  
  // Log scenario change
  logDemoEvent('scenario_change', `Changed scenario from ${currentScenario} to ${newScenario}`);
  
  console.log(`Demo scenario changed from ${currentScenario} to ${newScenario}`);
}

// Setup keyboard shortcut for toggling demo mode
export function setupDemoTrigger(): void {
  if (typeof window === 'undefined') return;
  
  document.addEventListener('keydown', (event) => {
    const { ctrl, shift, key } = DEMO_CONFIG.KEY_COMBO;
    
    // Check if the key combo matches
    if (
      (ctrl === true && event.ctrlKey) &&
      (shift === true && event.shiftKey) &&
      event.key.toUpperCase() === key.toUpperCase()
    ) {
      // Get current demo status
      const { enabled, scenario } = getDemoStatus();
      
      if (enabled) {
        // If already enabled, deactivate
        deactivateDemoMode();
      } else {
        // If not enabled, activate with default scenario
        activateDemoMode();
      }
      
      // Prevent default browser behavior for this key combo
      event.preventDefault();
    }
  });
  
  logDemoEvent('setup', 'Demo trigger keyboard shortcut set up');
  console.log(`Demo trigger set up with keyboard shortcut: ${DEMO_CONFIG.KEY_COMBO.ctrl ? 'Ctrl+' : ''}${DEMO_CONFIG.KEY_COMBO.shift ? 'Shift+' : ''}${DEMO_CONFIG.KEY_COMBO.key}`);
}

// Demo event logging
export function logDemoEvent(type: string, message: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing logs
    let logs = [];
    try {
      const storedLogs = localStorage.getItem(DEMO_LOGS_KEY);
      if (storedLogs) {
        logs = JSON.parse(storedLogs);
      }
    } catch (e) {
      console.error('Failed to parse stored demo logs:', e);
    }
    
    // Add new log entry
    logs.push({
      timestamp: Date.now(),
      type,
      message
    });
    
    // Limit log size
    if (logs.length > DEMO_CONFIG.MAX_LOGS) {
      logs = logs.slice(-DEMO_CONFIG.MAX_LOGS);
    }
    
    // Store updated logs
    localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to log demo event:', error);
  }
}

// Get demo logs
export function getDemoLogs(): Array<{ timestamp: number, type: string, message: string }> {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedLogs = localStorage.getItem(DEMO_LOGS_KEY);
    if (storedLogs) {
      return JSON.parse(storedLogs);
    }
  } catch (e) {
    console.error('Failed to retrieve demo logs:', e);
  }
  
  return [];
}

// Clear demo logs
export function clearDemoLogs(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(DEMO_LOGS_KEY);
    console.log('Demo logs cleared');
  } catch (e) {
    console.error('Failed to clear demo logs:', e);
  }
}

// Demo controller - manages the flow of the demo
export const demoController = {
  // Current step in the demo flow
  currentStep: 0,
  
  // Maximum step count (for progress tracking)
  maxSteps: 3,
  
  // Delay between steps
  stepDelay: DEMO_CONFIG.TRANSITION_TIMING.NORMAL,
  
  // Get current scenario data
  getScenarioData(): { 
    name: string, 
    imagePath: string, 
    futureImagePath: string, 
    description: string 
  } {
    const { scenario } = getDemoStatus();
    return DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.default;
  },
  
  // Get scenario image
  getScenarioImage(): string {
    const { scenario } = getDemoStatus();
    const scenarioData = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.default;
    return scenarioData.imagePath;
  },
  
  // Get future scenario image
  getFutureScenarioImage(): string {
    const { scenario } = getDemoStatus();
    const scenarioData = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.default;
    
    // Get image ID from the path
    const imagePath = scenarioData.imagePath;
    const imageId = path.basename(imagePath, path.extname(imagePath));
    
    // Get the future image for this ID
    return getFutureDemoImageById(imageId);
  },
  
  // Get both current and future images for comparison
  getComparisonImages(): { current: string, future: string } {
    const { scenario } = getDemoStatus();
    const scenarioData = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.default;
    
    // Get image ID from the path
    const imagePath = scenarioData.imagePath;
    const imageId = path.basename(imagePath, path.extname(imagePath));
    
    return {
      current: getDemoImageById(imageId),
      future: getFutureDemoImageById(imageId)
    };
  },
  
  // Reset demo to initial state
  reset(): void {
    this.currentStep = 0;
    logDemoEvent('flow', 'Demo flow reset to initial state');
  },
  
  // Advance to next step
  nextStep(): number {
    if (this.currentStep < this.maxSteps) {
      this.currentStep++;
      logDemoEvent('flow', `Advanced to demo step ${this.currentStep}`);
    }
    return this.currentStep;
  },
  
  // Go back to previous step
  prevStep(): number {
    if (this.currentStep > 0) {
      this.currentStep--;
      logDemoEvent('flow', `Moved back to demo step ${this.currentStep}`);
    }
    return this.currentStep;
  },
  
  // Jump to specific step
  goToStep(step: number): number {
    if (step >= 0 && step <= this.maxSteps) {
      this.currentStep = step;
      logDemoEvent('flow', `Jumped to demo step ${this.currentStep}`);
    }
    return this.currentStep;
  },
  
  // Get step name based on current step
  getStepName(): string {
    const stepNames = [
      'Capture Image',
      'Analyze Components',
      'View Future Projection',
      'Review Recommendations'
    ];
    
    return stepNames[this.currentStep] || 'Unknown Step';
  },
  
  // Set custom timing for animations
  setTiming(timing: 'NORMAL' | 'FAST' | 'SLOW'): void {
    this.stepDelay = DEMO_CONFIG.TRANSITION_TIMING[timing];
    logDemoEvent('timing', `Animation timing set to ${timing} (${this.stepDelay}ms)`);
  },
  
  // Toggle timing between fast and normal
  toggleFastMode(fast: boolean): void {
    this.setTiming(fast ? 'FAST' : 'NORMAL');
  }
};