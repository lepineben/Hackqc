import type { NextApiRequest, NextApiResponse } from 'next'
import { getNetworkStatus, getCachedResponseWithStatus, getImageHash, cacheResponse, getFallbackAnalysisData, getFallbackImage, CacheStatus } from '../../lib/cache'
import { analyzeImage, AnalysisResult } from '../../lib/openai'
import { getDemoStatus, simulateProcessingDelay } from '../../lib/demoMode'

type ErrorResponse = {
  error: string;
}

type AnalysisResponseWithMeta = AnalysisResult & {
  _meta?: {
    source: string;
    status: string;
    processTime: number;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponseWithMeta | ErrorResponse>
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
    const imageHash = await getImageHash(image);
    
    // Create a response function with metadata
    const createResponse = (data: AnalysisResult, source: string, status: string) => {
      const responseWithMeta: AnalysisResponseWithMeta = {
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
    const { status: cacheStatus, data: cachedData } = getCachedResponseWithStatus('analyze', imageHash);
    
    // Return cached data if valid
    if (cacheStatus === 'hit') {
      console.log(`Cache hit for analyze (${imageHash})`);
      return res.status(200).json(createResponse(cachedData, 'cache', 'hit'));
    }
    
    // If demo mode is enabled or we're offline, use demo data
    if (demoStatus.enabled) {
      console.log(`Demo mode enabled (${demoStatus.mode}) - using demo/fallback data`);
      
      // Simulate processing delay for realism
      await simulateProcessingDelay('analysis');
      
      // Get fallback data
      const fallbackData = getFallbackAnalysisData();
      
      // Cache it for future use
      cacheResponse('analyze', imageHash, fallbackData, 'fallback');
      
      return res.status(200).json(createResponse(fallbackData, 'demo', demoStatus.mode));
    }
    
    // If stale cache data and offline, use it
    if (cacheStatus === 'stale' && !networkStatus.online) {
      console.log(`Using stale cache data for analyze (${imageHash}) - offline mode`);
      return res.status(200).json(createResponse(cachedData, 'cache', 'stale'));
    }
    
    // Process the image with OpenAI Vision API
    try {
      console.log(`Processing image with OpenAI API (${imageHash.substr(0, 8)}...)`);
      const result = await analyzeImage(image);
      
      // Return the result
      return res.status(200).json(createResponse(result, 'api', 'fresh'));
    } catch (apiError) {
      console.error('Error from OpenAI API:', apiError);
      
      // If stale cache data exists, use it
      if (cacheStatus === 'stale') {
        console.log(`Using stale cache data after API error (${imageHash})`);
        return res.status(200).json(createResponse(cachedData, 'cache', 'stale_fallback'));
      }
      
      // Fall back to demo data on API error
      const fallbackData = getFallbackAnalysisData();
      
      // Cache it for future use
      cacheResponse('analyze', imageHash, fallbackData, 'fallback');
      
      return res.status(200).json(createResponse(fallbackData, 'fallback', 'api_error'));
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    
    // Return fallback data for demo reliability
    const fallbackData = getFallbackAnalysisData();
    
    return res.status(200).json(createResponse(fallbackData, 'fallback', 'error'));
  }
  
  // Helper function to create response with metadata
  function createResponse(data: AnalysisResult, source: string, status: string): AnalysisResponseWithMeta {
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