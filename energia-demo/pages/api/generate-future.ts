import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
import { getImageHash, getCachedResponse, cacheResponse, getFallbackFutureData } from '../../lib/cache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type FutureResponse = {
  futureImage: string;
  analysis: {
    projectionDate: string;
    vegetationGrowth: string;
    potentialIssues: Array<{
      component: string;
      risk: string;
      description: string;
    }>;
    recommendations: string[];
  };
}

type ErrorResponse = {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FutureResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { image } = req.body
    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }
    
    // Check cache first
    const imageHash = getImageHash(image)
    const cachedResult = getCachedResponse('future', imageHash)
    
    if (cachedResult) {
      return res.status(200).json(cachedResult)
    }
    
    // For demo reliability, we'll use a pre-generated future image
    // In a real implementation, we would call OpenAI API here to generate the future image
    /* 
    // Call OpenAI API to generate future image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "Generate a future version of this electrical infrastructure image showing 5-year vegetation growth around the components. Show trees and vegetation that have grown considerably and may pose risks to the electrical equipment.",
      n: 1,
      size: "1024x1024",
    })
    
    const futureImageUrl = response.data[0].url
    // We would need to convert the URL to base64 for storing in our demo
    */
    
    // For the demo, use a pre-generated future image
    // In a real app, we'd generate this with OpenAI
    const futureImage = image // Replace with actual modified image
    
    const fallbackData = {
      futureImage,
      analysis: getFallbackFutureData()
    }
    
    // Cache the result
    cacheResponse('future', imageHash, fallbackData)
    
    return res.status(200).json(fallbackData)
  } catch (error) {
    console.error('Error generating future projection:', error)
    
    // Return fallback data for demo reliability
    const fallbackData = {
      futureImage: req.body.image, // Just use the original image for the demo
      analysis: getFallbackFutureData()
    }
    
    return res.status(200).json(fallbackData)
  }
}