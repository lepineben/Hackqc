import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
import { getImageHash, getCachedResponse, cacheResponse, getFallbackAnalysisData } from '../../lib/cache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type AnalysisResponse = {
  components: Array<{
    type: string;
    confidence: number;
    details: string;
    condition: string;
    risks: string;
  }>;
  annotations: Array<{
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
  }>;
}

type ErrorResponse = {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalysisResponse | ErrorResponse>
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
    const cachedResult = getCachedResponse('analyze', imageHash)
    
    if (cachedResult) {
      return res.status(200).json(cachedResult)
    }
    
    // For demo reliability, just return fallback data
    // In a real implementation, we would call OpenAI API here
    /* 
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify electrical infrastructure components in this image and provide details about each component." },
            { type: "image_url", image_url: { url: image } }
          ]
        }
      ],
      max_tokens: 500
    })
    
    // Process the response
    const result = {
      components: processOpenAIResponse(response),
      annotations: generateAnnotations(response)
    }
    
    // Cache the result
    cacheResponse('analyze', imageHash, result)
    
    return res.status(200).json(result)
    */
    
    // For the demo, use fallback data
    const fallbackData = getFallbackAnalysisData()
    
    // Cache the result
    cacheResponse('analyze', imageHash, fallbackData)
    
    return res.status(200).json(fallbackData)
  } catch (error) {
    console.error('Error analyzing image:', error)
    
    // Return fallback data for demo reliability
    return res.status(200).json(getFallbackAnalysisData())
  }
}