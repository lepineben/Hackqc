import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkStatus, getCachedResponseWithStatus, getImageHash, cacheResponse, getFallbackFutureData, getFallbackImage } from '../../lib/cache'
import { generateFuture, FutureResult } from '../../lib/openai'
import { getDemoStatus, simulateProcessingDelay } from '../../lib/demoMode'

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