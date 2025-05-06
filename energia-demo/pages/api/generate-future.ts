import type { NextApiRequest, NextApiResponse } from 'next'
import { isOnline, getFallbackFutureData } from '../../lib/cache'
import { generateFuture, FutureResult } from '../../lib/openai'

type ErrorResponse = {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FutureResult | ErrorResponse>
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
      // For demo purposes, we use the original image
      return res.status(200).json({
        futureImage: image,
        analysis: getFallbackFutureData()
      })
    }
    
    // Process the image with OpenAI for future projection
    try {
      const result = await generateFuture(image)
      return res.status(200).json(result)
    } catch (apiError) {
      console.error('Error from OpenAI API:', apiError)
      // Fall back to demo data on API error
      return res.status(200).json({
        futureImage: image,
        analysis: getFallbackFutureData()
      })
    }
  } catch (error) {
    console.error('Error generating future projection:', error)
    
    // Return fallback data for demo reliability
    return res.status(200).json({
      futureImage: req.body.image,
      analysis: getFallbackFutureData()
    })
  }
}