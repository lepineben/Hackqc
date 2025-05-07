// Only import types from OpenAI to avoid client-side errors
import type { OpenAI } from 'openai';
import { getImageHash, getCachedResponse, cacheResponse } from '../cache';

// This file only contains type definitions and utility functions
// The actual OpenAI client is initialized in './client.ts' and should only be imported in API routes

// IMPORTANT: Do not import or use the OpenAI client directly in this file
// This file is designed to be safely importable on both client and server

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
    // For the Responses API, we get output_text directly
    const content = response.output_text || '';
    
    // Example format we expect from OpenAI:
    // "1. Transformer: High confidence (95%). Details: Distribution transformer, standard urban model. Condition: Good. Risks: Nearby vegetation could pose risk in coming years.
    // 2. Power Line: High confidence (92%). Details: Medium voltage line, likely 25kV. Condition: Fair. Risks: Nearby branches, pruning recommended within 6 months.
    // 3. Utility Pole: High confidence (98%). Details: Wooden pole, standard installation. Condition: Normal wear. Risks: No immediate risks identified."
    
    // Split content by numbered items and parse each component
    const componentStrings = content.split(/\d+\.\s+/).filter(Boolean);
    
    // If we don't get any matches, the response might not be properly formatted
    if (componentStrings.length === 0) {
      console.warn('Could not parse components from OpenAI response. Using default fallback.');
      return [
        {
          type: 'Electrical Component',
          confidence: 0.7,
          details: 'Electrical infrastructure detected in image',
          condition: 'Unknown condition',
          risks: 'Potential vegetation-related risks may exist',
        }
      ];
    }
    
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
// THIS IS NOW MOVED TO THE API ROUTE - kept here just as type documentation
// Do not call this function directly - annotations should be generated server-side
export function generateAnnotations(components: OpenAIComponent[]): OpenAIAnnotation[] {
  console.warn('generateAnnotations() should not be called directly - annotations should be generated server-side');
  return [];
}

// THESE FUNCTIONS SHOULD NOT BE CALLED DIRECTLY ON THE CLIENT
// They are kept here for compatibility but should be reimplemented in the API routes

// Function signature for analyzing an image using OpenAI Vision API
// This is only a stub - the actual implementation should be in the API route
export async function analyzeImage(imageData: string): Promise<AnalysisResult> {
  console.warn('analyzeImage() should not be called directly - use API route instead');
  
  // Check cache first
  const imageHash = getImageHash(imageData);
  const cachedResult = getCachedResponse('analyze', imageHash);
  
  if (cachedResult) {
    console.log('Using cached analysis result');
    return cachedResult;
  }
  
  throw new Error('analyzeImage() should only be called from server-side API routes');
}

// Function signature for generating a future projection
// This is only a stub - the actual implementation should be in the API route
export async function generateFuture(imageData: string): Promise<FutureResult> {
  console.warn('generateFuture() should not be called directly - use API route instead');
  
  // Check cache first
  const imageHash = getImageHash(imageData);
  const cachedResult = getCachedResponse('future', imageHash);
  
  if (cachedResult) {
    console.log('Using cached future projection result');
    return cachedResult;
  }
  
  throw new Error('generateFuture() should only be called from server-side API routes');
}

// Function signature for generating a future image
// This is only a stub - the actual implementation should be in the API route
export async function generateFutureImage(imageData: string): Promise<string> {
  console.warn('generateFutureImage() should not be called directly - use API route instead');
  
  // Check cache first using a hash of the input image plus a "future" prefix
  const imageHash = getImageHash(`future_${imageData}`);
  const cachedResult = getCachedResponse('futureImage', imageHash);
  
  if (cachedResult) {
    console.log('Using cached future image');
    return cachedResult;
  }
  
  // Default behavior - just return the original image
  return imageData;
}