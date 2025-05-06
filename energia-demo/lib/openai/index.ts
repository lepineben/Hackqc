import { OpenAI } from 'openai';
import { getImageHash, getCachedResponse, cacheResponse } from '../cache';

// Initialize OpenAI client
let openaiInstance: OpenAI;

// Initialize with environment variable API key
openaiInstance = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const openai = openaiInstance;

// Types for OpenAI API responses
export type OpenAIComponent = {
  type: string;
  confidence: number;
  details: string;
  condition: string;
  risks: string;
};

export type OpenAIAnnotation = {
  id: string;
  type: string;
  geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  data: {
    label: string;
    description: string;
  };
};

export type AnalysisResult = {
  components: OpenAIComponent[];
  annotations: OpenAIAnnotation[];
  meta?: {
    timestamp: number;
    source: string;
    model?: string;
    version?: string;
  };
};

export type FutureAnalysis = {
  projectionDate: string;
  vegetationGrowth: string;
  potentialIssues: Array<{
    component: string;
    risk: string;
    description: string;
  }>;
  recommendations: string[];
  meta?: {
    timestamp: number;
    source: string;
    version?: string;
  };
};

export type FutureResult = {
  futureImage: string;
  analysis: FutureAnalysis;
  meta?: {
    timestamp: number;
    source: string;
    version?: string;
  };
};

// Helper function to extract components from OpenAI text response
export function processOpenAIResponse(response: any): OpenAIComponent[] {
  try {
    // This is a simplified implementation
    // In a real app, we would parse the response more carefully
    const content = response.choices[0].message.content;
    
    // Example format we expect from OpenAI:
    // "1. Transformer: High confidence (95%). Details: Distribution transformer, standard urban model. Condition: Good. Risks: Nearby vegetation could pose risk in coming years.
    // 2. Power Line: High confidence (92%). Details: Medium voltage line, likely 25kV. Condition: Fair. Risks: Nearby branches, pruning recommended within 6 months.
    // 3. Utility Pole: High confidence (98%). Details: Wooden pole, standard installation. Condition: Normal wear. Risks: No immediate risks identified."
    
    // Split content by numbered items and parse each component
    const componentStrings = content.split(/\d+\.\s+/).filter(Boolean);
    
    return componentStrings.map((str) => {
      // Extract component details using regex or string manipulation
      const typeMatch = str.match(/^([^:]+):/);
      const confidenceMatch = str.match(/confidence \((\d+)%\)/);
      const detailsMatch = str.match(/Details:\s+([^.]+)/);
      const conditionMatch = str.match(/Condition:\s+([^.]+)/);
      const risksMatch = str.match(/Risks:\s+([^.]*)/);
      
      return {
        type: typeMatch ? typeMatch[1].trim() : 'Unknown component',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.8,
        details: detailsMatch ? detailsMatch[1].trim() : 'No details available',
        condition: conditionMatch ? conditionMatch[1].trim() : 'Unknown condition',
        risks: risksMatch ? risksMatch[1].trim() : 'No risks identified',
      };
    });
  } catch (error) {
    console.error('Error processing OpenAI response:', error);
    return [];
  }
}

// Generate annotations based on components
export function generateAnnotations(components: OpenAIComponent[]): OpenAIAnnotation[] {
  // In a real application, we would use computer vision or LLM to generate accurate bounding boxes
  // For the demo, we'll place components in predefined areas of the image
  
  // Create annotations with predefined positions (for demo purposes)
  return components.map((component, index) => {
    // Calculate positions based on component type and index
    // These are arbitrary placements for demo purposes
    let x = 10 + (index * 50);
    let y = 20 + (index * 40);
    let width = 100;
    let height = 150;
    
    // Adjust based on component type
    if (component.type.toLowerCase().includes('line')) {
      // Make power lines more horizontal
      width = 300;
      height = 10;
    } else if (component.type.toLowerCase().includes('pole')) {
      // Make poles more vertical
      width = 30;
      height = 300;
    }
    
    return {
      id: (index + 1).toString(),
      type: 'rectangle',
      geometry: {
        x,
        y,
        width,
        height,
      },
      data: {
        label: component.type,
        description: component.details,
      },
    };
  });
}

// Function to analyze an image using OpenAI Vision API
export async function analyzeImage(imageData: string): Promise<AnalysisResult> {
  // Check cache first
  const imageHash = getImageHash(imageData);
  const cachedResult = getCachedResponse('analyze', imageHash);
  
  if (cachedResult) {
    console.log('Using cached analysis result');
    return cachedResult;
  }
  
  try {
    console.log('Analyzing image with OpenAI Vision API...');
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analyze this image of electrical infrastructure. Identify all electrical components present such as transformers, power lines, utility poles, etc.
              
              For each component provide:
              1. The type of component
              2. Your confidence level (as a percentage)
              3. Details about the component (model, purpose, etc.)
              4. Assessment of its condition
              5. Potential risks related to vegetation growth
              
              Format your response as a numbered list:
              1. [Component Type]: [Confidence (X%)]. Details: [details]. Condition: [condition]. Risks: [risks].
              2. [Component Type]: [Confidence (X%)]. Details: [details]. Condition: [condition]. Risks: [risks].
              ... and so on
              
              Only include electrical infrastructure components. Focus on identifying components that could be affected by vegetation growth.`
            },
            { 
              type: "image_url", 
              image_url: { url: imageData } 
            }
          ]
        }
      ],
      max_tokens: 800
    });
    
    // Process the response
    const components = processOpenAIResponse(response);
    const annotations = generateAnnotations(components);
    
    const result: AnalysisResult = {
      components,
      annotations,
      meta: {
        timestamp: Date.now(),
        source: 'openai',
        model: 'gpt-4-vision-preview',
        version: '1.0'
      }
    };
    
    // Cache the result as from API
    cacheResponse('analyze', imageHash, result, 'api');
    console.log('Analysis complete and cached');
    
    return result;
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    throw error;
  }
}

// Function to generate a future projection using OpenAI
export async function generateFuture(imageData: string): Promise<FutureResult> {
  // Check cache first
  const imageHash = getImageHash(imageData);
  const cachedResult = getCachedResponse('future', imageHash);
  
  if (cachedResult) {
    console.log('Using cached future projection result');
    return cachedResult;
  }
  
  try {
    console.log('Generating future projection...');
    
    // First, get the analysis to base our future projection on
    let analysisData: AnalysisResult;
    
    // Try to use cached analysis data
    const cachedAnalysis = getCachedResponse('analyze', imageHash);
    if (cachedAnalysis) {
      analysisData = cachedAnalysis;
      console.log('Using cached analysis data for future projection');
    } else {
      // Generate new analysis if we don't have it cached
      console.log('No cached analysis found, generating new analysis for future projection');
      analysisData = await analyzeImage(imageData);
    }
    
    // Generate future image using the OpenAI Images API
    console.log('Generating future image for projection...');
    const futureImage = await generateFutureImage(imageData);
    
    // Generate future analysis based on the components from the analysis
    const futureAnalysis: FutureAnalysis = {
      projectionDate: 'Mai 2030',
      vegetationGrowth: 'Croissance de 30-50% selon les espèces présentes',
      potentialIssues: analysisData.components.map(component => {
        // Generate issue details based on component type
        let risk = 'Moyen';
        let description = 'Risque standard lié à la croissance de la végétation.';
        
        // Customize risk based on component type
        const typeLower = component.type.toLowerCase();
        if (typeLower.includes('transformateur')) {
          risk = 'Élevé';
          description = 'La végétation pourrait entrer en contact avec le transformateur d\'ici 3 ans si non entretenue.';
        } else if (typeLower.includes('ligne') || typeLower.includes('câble')) {
          risk = 'Moyen';
          description = 'Branches au-dessus de la ligne nécessiteront un élagage dans les 1-2 ans.';
        } else if (typeLower.includes('poteau') || typeLower.includes('pylône')) {
          risk = 'Faible';
          description = 'Peu de risque à court terme, mais surveillance recommandée.';
        }
        
        return {
          component: component.type,
          risk,
          description
        };
      }),
      recommendations: [
        'Planifier un élagage préventif dans les 12 prochains mois',
        'Programmer une inspection de suivi dans 18 mois',
        'Établir un plan de gestion de la végétation sur 5 ans',
        'Considérer l\'installation d\'équipement de protection supplémentaire'
      ],
      meta: {
        timestamp: Date.now(),
        source: 'generated',
        version: '1.0'
      }
    };
    
    const result: FutureResult = {
      futureImage,
      analysis: futureAnalysis
    };
    
    // Cache the result as from API
    cacheResponse('future', imageHash, result, 'api');
    console.log('Future projection complete and cached');
    
    return result;
  } catch (error) {
    console.error('Error generating future projection with OpenAI:', error);
    throw error;
  }
}

// Function to generate a future image using DALL-E
export async function generateFutureImage(imageData: string): Promise<string> {
  try {
    // Check cache first using a hash of the input image plus a "future" prefix
    const imageHash = getImageHash(`future_${imageData}`);
    const cachedResult = getCachedResponse('futureImage', imageHash);
    
    if (cachedResult) {
      console.log('Using cached future image');
      return cachedResult;
    }
    
    console.log('Generating future image using OpenAI Images API...');
    
    // Standard prompt for consistent vegetation growth projection
    const standardPrompt = `Generate a realistic modified version of this image showing the same electrical infrastructure after 5 years of vegetation growth. 
    The image should maintain the exact same perspective, infrastructure components, and overall lighting, but show:
    
    1. Trees that have grown 30-50% taller with expanded canopies
    2. Bushes and undergrowth that have become denser and encroached closer to infrastructure
    3. Vines or climbing plants that may have started growing on poles or structures
    4. Some branches that now extend closer to or touch power lines
    5. Overall more dense vegetation that creates potential hazards to the electrical equipment
    
    The changes should be subtle yet noticeable and scientifically plausible for 5 years of growth. Maintain photorealism and avoid artistic filters or styles.`;
    
    // Use the OpenAI Images API to generate the future image
    // Since we want to generate a modified version of the current image, we'll use
    // the createImage API with a detailed prompt that describes the current image
    // and the vegetation growth we want to see
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${standardPrompt}
      
      The image should be a photorealistic modification of an electrical infrastructure scene that shows:
      - The exact same infrastructure components (poles, lines, transformers) in the same positions
      - The same perspective and general composition
      - The same lighting conditions and weather
      - Only natural vegetation growth changes that would occur over 5 years
      
      This is for a utility company's vegetation management planning tool, so accuracy and realism are critical.`,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });
    
    // Check if we have a valid response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      console.error('Invalid response from OpenAI Images API');
      return imageData; // Fall back to original image
    }
    
    // Get the generated image URL
    const futureImageUrl = response.data[0].url;
    
    // Convert the URL to base64
    const futureImageBase64 = await urlToBase64(futureImageUrl);
    
    // Cache the result for future use
    cacheResponse('futureImage', imageHash, futureImageBase64, 'api');
    
    console.log('Future image generated and cached');
    return futureImageBase64;
  } catch (error) {
    console.error('Error generating future image with OpenAI:', error);
    console.log('Falling back to original image');
    return imageData; // Fall back to original image
  }
}

// Helper function to convert URL to base64
async function urlToBase64(url: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Convert to blob
    const blob = await response.blob();
    
    // Convert blob to base64
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
    console.error('Error converting URL to base64:', error);
    throw error;
  }
}