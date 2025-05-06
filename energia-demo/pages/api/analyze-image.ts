import type { NextApiRequest, NextApiResponse } from 'next'
import { isOnline, getFallbackAnalysisData } from '../../lib/cache'
import { analyzeImage, AnalysisResult } from '../../lib/openai'

type ErrorResponse = {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResult | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }
    
    // If demo mode is enabled or we're offline, use fallback data
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !isOnline()) {
      return res.status(200).json(getFallbackAnalysisData())
    }
    
    // Process the image with OpenAI Vision API
    try {
      const result = await analyzeImage(image)
      return res.status(200).json(result)
    } catch (apiError) {
      console.error('Error from OpenAI API:', apiError)
      // Fall back to demo data on API error
      return res.status(200).json(getFallbackAnalysisData())
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    
    // Return fallback data for demo reliability
    return res.status(200).json(getFallbackAnalysisData())
  }
}