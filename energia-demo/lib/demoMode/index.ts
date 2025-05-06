import { getImageHash, cacheResponse } from '../cache';
import { AnalysisResult, FutureAnalysis } from '../openai';
import path from 'path';

// Demo image paths - relative to the public directory
export const DEMO_IMAGES = [
  '/demo-images/01.jpg',
  '/demo-images/02.jpg',
  '/demo-images/03.jpg',
  '/demo-images/04.jpg',
  '/demo-images/05.jpg',
];

// Convert image URL to base64 (client-side only)
export async function imageUrlToBase64(url: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
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

// Initialize demo mode
export async function initializeDemoMode(): Promise<void> {
  // This function would typically be called in _app.tsx
  if (typeof window === 'undefined') return;
  
  try {
    // Convert all demo images to base64 and cache their responses
    for (let i = 0; i < DEMO_IMAGES.length; i++) {
      const imagePath = DEMO_IMAGES[i];
      const imageId = path.basename(imagePath, path.extname(imagePath));
      
      // Skip if already processed
      const localStorageKey = `demoImage_${imageId}`;
      if (localStorage.getItem(localStorageKey)) {
        console.log(`Demo image ${imageId} already cached`);
        continue;
      }
      
      // Convert image to base64
      const base64Data = await imageUrlToBase64(imagePath);
      
      if (base64Data) {
        // Store image data for quick access
        localStorage.setItem(localStorageKey, base64Data);
        
        // Hash the image for cache lookup
        const imageHash = getImageHash(base64Data);
        
        // Cache analysis data
        if (demoAnalysisData[imageId]) {
          cacheResponse('analyze', imageHash, demoAnalysisData[imageId]);
        }
        
        // Cache future data
        if (demoFutureData[imageId]) {
          const futureData = {
            futureImage: base64Data, // In a real app, this would be a modified image
            analysis: demoFutureData[imageId]
          };
          cacheResponse('future', imageHash, futureData);
        }
      }
    }
    
    console.log('Demo mode initialized with pre-cached responses');
  } catch (error) {
    console.error('Error initializing demo mode:', error);
  }
}

// Get a random demo image
export function getRandomDemoImage(): string {
  if (typeof window === 'undefined') return DEMO_IMAGES[0];
  
  const imageIndex = Math.floor(Math.random() * DEMO_IMAGES.length);
  const imagePath = DEMO_IMAGES[imageIndex];
  const imageId = path.basename(imagePath, path.extname(imagePath));
  
  // Check if we have it in localStorage
  const localStorageKey = `demoImage_${imageId}`;
  const cachedImage = localStorage.getItem(localStorageKey);
  
  if (cachedImage) {
    return cachedImage;
  }
  
  // Return the path if we don't have the base64 yet
  return imagePath;
}