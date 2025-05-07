import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkStatus, getCachedResponseWithStatus, getImageHash, cacheResponse, getFallbackFutureData, getFallbackImage } from '../../lib/cache'
import type { FutureResult } from '../../lib/openai'
import { getDemoStatus, simulateProcessingDelay } from '../../lib/demoMode'

// Import the OpenAI client in the server-side API route only
import { openai } from '../../lib/openai/client'

// Define the generateFuture function here for API route use
async function generateFuture(imageData: string): Promise<FutureResult> {
  // If API key is missing, return fallback data
  if (!process.env.OPENAI_API_KEY || !openai) {
    console.log('Using fallback future data (API key missing)');
    return {
      futureImage: imageData,
      analysis: getFallbackFutureData()
    };
  }

  // Check cache first
  const imageHash = getImageHash(imageData);
  const cachedResult = getCachedResponseWithStatus('future', imageHash);
  
  if (cachedResult.status === 'hit') {
    console.log('Using cached future result');
    return cachedResult.data;
  }
  
  try {
    console.log('Generating future projection...');
    
    // Generate future image using the OpenAI Images API
    const standardPrompt = `Generate a realistic modified version of this image showing the same electrical infrastructure after 5 years of vegetation growth.`;
    
    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${standardPrompt}
      
      The image should be a photorealistic modification of an electrical infrastructure scene that shows:
      - The exact same infrastructure components (poles, lines, transformers) in the same positions
      - The same perspective and general composition
      - The same lighting conditions and weather
      - Only natural vegetation growth changes that would occur over 5 years
      
      This is for a utility company's vegetation management planning tool, so accuracy and realism are critical.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json"
    });
    
    let futureImage = imageData; // Default to original image
    
    // Extract the base64 image from the response
    if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].b64_json) {
      futureImage = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
    }
    
    // Generate analysis for the future projection
    const futureAnalysis = {
      projectionDate: 'Mai 2030',
      vegetationGrowth: 'Croissance de 30-50% selon les espèces présentes',
      potentialIssues: [
        {
          component: 'Electrical Components',
          risk: 'Moyen',
          description: 'Les structures électriques pourraient être affectées par la croissance de la végétation environnante dans les 5 prochaines années.'
        }
      ],
      recommendations: [
        'Planifier un élagage préventif dans les 12 prochains mois',
        'Programmer une inspection de suivi dans 18 mois',
        'Établir un plan de gestion de la végétation sur 5 ans',
        'Surveiller les zones avec croissance rapide de végétation'
      ],
      meta: {
        timestamp: Date.now(),
        source: 'generated',
        version: '1.0'
      }
    };
    
    const result = {
      futureImage,
      analysis: futureAnalysis
    };
    
    // Cache the result
    cacheResponse('future', imageHash, result, 'api');
    console.log('Future projection complete and cached');
    
    return result;
  } catch (error) {
    console.error('Error generating future projection with OpenAI:', error);
    // Return fallback data on error
    return {
      futureImage: imageData,
      analysis: getFallbackFutureData()
    };
  }
}

type ErrorResponse = {
  error: string;
}

type FutureResponseWithMeta = FutureResult & {
  _meta?: {
    source: string;
    status: string;
    processTime: number;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FutureResponseWithMeta | ErrorResponse>
) {
  const startTime = Date.now();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }
    
    // Check if API key is configured properly
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      console.warn('API key appears to be missing or incorrect - forcing demo mode');
      // Force demo mode if API key is missing
      const fallbackData = {
        futureImage: image,
        analysis: getFallbackFutureData()
      };
      return res.status(200).json(createResponse(fallbackData, 'fallback', 'api_key_missing'));
    }
    
    // Check demo mode and network status
    const demoStatus = getDemoStatus();
    const networkStatus = getNetworkStatus();
    
    // Generate image hash for cache lookup
    const imageHash = getImageHash(image);
    
    // Create a response function with metadata
    const createResponse = (data: FutureResult, source: string, status: string) => {
      const responseWithMeta: FutureResponseWithMeta = {
        ...data,
        _meta: {
          source,
          status,
          processTime: Date.now() - startTime
        }
      };
      return responseWithMeta;
    };
    
    // Try to get cached response first
    const { status: cacheStatus, data: cachedData } = getCachedResponseWithStatus('future', imageHash);
    
    // Return cached data if valid
    if (cacheStatus === 'hit') {
      console.log(`Cache hit for future projection (${imageHash})`);
      return res.status(200).json(createResponse(cachedData, 'cache', 'hit'));
    }
    
    // If demo mode is enabled or we're offline, use demo data
    if (demoStatus.enabled) {
      console.log(`Demo mode enabled (${demoStatus.mode}) - using demo/fallback data for future projection`);
      
      // Simulate processing delay for realism
      await simulateProcessingDelay('future projection');
      
      // Get fallback data
      const fallbackData = {
        futureImage: image, // For simplicity, use the original image
        analysis: getFallbackFutureData()
      };
      
      // Cache it for future use
      cacheResponse('future', imageHash, fallbackData, 'fallback');
      
      return res.status(200).json(createResponse(fallbackData, 'demo', demoStatus.mode));
    }
    
    // If stale cache data and offline, use it
    if (cacheStatus === 'stale' && !networkStatus.online) {
      console.log(`Using stale cache data for future projection (${imageHash}) - offline mode`);
      return res.status(200).json(createResponse(cachedData, 'cache', 'stale'));
    }
    
    // Process the image with OpenAI for future projection
    try {
      console.log(`Processing image for future projection with OpenAI API (${imageHash.substr(0, 8)}...)`);
      const result = await generateFuture(image);
      
      // Return the result
      return res.status(200).json(createResponse(result, 'api', 'fresh'));
    } catch (apiError) {
      console.error('Error from OpenAI API for future projection:', apiError);
      
      // If stale cache data exists, use it
      if (cacheStatus === 'stale') {
        console.log(`Using stale cache data after API error for future projection (${imageHash})`);
        return res.status(200).json(createResponse(cachedData, 'cache', 'stale_fallback'));
      }
      
      // Fall back to demo data on API error
      const fallbackData = {
        futureImage: image,
        analysis: getFallbackFutureData()
      };
      
      // Cache it for future use
      cacheResponse('future', imageHash, fallbackData, 'fallback');
      
      return res.status(200).json(createResponse(fallbackData, 'fallback', 'api_error'));
    }
  } catch (error) {
    console.error('Error generating future projection:', error);
    
    // Return fallback data for demo reliability
    const fallbackData = {
      futureImage: req.body.image,
      analysis: getFallbackFutureData()
    };
    
    return res.status(200).json(createResponse(fallbackData, 'fallback', 'error'));
  }
  
  // Helper function to create response with metadata
  function createResponse(data: FutureResult, source: string, status: string): FutureResponseWithMeta {
    return {
      ...data,
      _meta: {
        source,
        status,
        processTime: Date.now() - startTime
      }
    };
  }
}