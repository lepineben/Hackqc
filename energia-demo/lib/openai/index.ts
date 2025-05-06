import { OpenAI } from 'openai';
import { getImageHash, getCachedResponse, cacheResponse } from '../cache';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
};

export type FutureResult = {
  futureImage: string;
  analysis: FutureAnalysis;
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
    return cachedResult;
  }
  
  try {
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
      annotations
    };
    
    // Cache the result
    cacheResponse('analyze', imageHash, result);
    
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
    return cachedResult;
  }
  
  try {
    // For demo purposes, we'll return the same image
    // In a real implementation, we would call DALL-E to generate a future image
    const futureImage = imageData;
    
    // In a real app, we'd generate this data through OpenAI
    const futureAnalysis: FutureAnalysis = {
      projectionDate: 'Mai 2030',
      vegetationGrowth: 'Croissance de 30-50% selon les espèces présentes',
      potentialIssues: [
        {
          component: 'Transformateur',
          risk: 'Élevé',
          description: 'La végétation pourrait entrer en contact avec le transformateur d\'ici 3 ans si non entretenue.'
        },
        {
          component: 'Ligne électrique',
          risk: 'Moyen',
          description: 'Branches au-dessus de la ligne nécessiteront un élagage dans les 1-2 ans.'
        },
        {
          component: 'Poteau',
          risk: 'Faible',
          description: 'Peu de risque à court terme, mais surveillance recommandée.'
        }
      ],
      recommendations: [
        'Planifier un élagage préventif dans les 12 prochains mois',
        'Programmer une inspection de suivi dans 18 mois',
        'Établir un plan de gestion de la végétation sur 5 ans',
        'Considérer l\'installation d\'équipement de protection supplémentaire'
      ]
    };
    
    const result: FutureResult = {
      futureImage,
      analysis: futureAnalysis
    };
    
    // Cache the result
    cacheResponse('future', imageHash, result);
    
    return result;
  } catch (error) {
    console.error('Error generating future projection with OpenAI:', error);
    throw error;
  }
}

// Function to generate a future image using DALL-E
export async function generateFutureImage(imageData: string): Promise<string> {
  try {
    // In a real implementation, we would use OpenAI's DALL-E API to generate an image
    // For the demo, we'll just return the original image
    return imageData;
    
    /* 
    // This would be the actual implementation with OpenAI
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "Generate a future version of this electrical infrastructure image showing 5-year vegetation growth around the components. Show trees and vegetation that have grown considerably and may pose risks to the electrical equipment.",
      n: 1,
      size: "1024x1024",
    });
    
    // In a real app, we'd need to convert the URL to base64 or download the image
    const futureImageUrl = response.data[0].url;
    // Then fetch the image and convert to base64...
    return futureImageUrl;
    */
  } catch (error) {
    console.error('Error generating future image with DALL-E:', error);
    throw error;
  }
}