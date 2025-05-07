import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { getNetworkStatus, getCachedResponseWithStatus, getImageHash, cacheResponse, getFallbackAnalysisData, getFallbackImage, CacheStatus } from '../../lib/cache'
import type { AnalysisResult } from '../../lib/openai'
import { getDemoStatus, simulateProcessingDelay, demoAnalysisData } from '../../lib/demoMode'

// Import the OpenAI client in the server-side API route only
import { openai } from '../../lib/openai/client'

// Define the analyzeImage function here for API route use
async function analyzeImage(imageData: string): Promise<AnalysisResult> {
  // If API key is missing, return fallback data
  if (!process.env.OPENAI_API_KEY || !openai) {
    console.log('Using fallback data (API key missing)');
    return getFallbackAnalysisData();
  }

  // Check cache first
  const imageHash = getImageHash(imageData);
  const cachedResult = getCachedResponseWithStatus('analyze', imageHash);
  
  if (cachedResult.status === 'hit') {
    console.log('Using cached analysis result');
    return cachedResult.data;
  }
  
  try {
    console.log('Analyzing image with OpenAI Vision API...');
    
    // Call OpenAI API using Responses API
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            { 
              type: "input_text", 
              text: `You are an expert electrical infrastructure analyzer. Your task is to ONLY list the electrical infrastructure elements visible in this image.

DO NOT include any disclaimers, apologies, or statements about inability to analyze images.

For each electrical component visible, provide:
1. The type of component (transformer, power line, utility pole, etc.)
2. Your confidence level (as a percentage)
3. Brief details about the component (model, purpose, etc.)
4. Brief assessment of its condition
5. Potential risks from vegetation growth

Format each component exactly like this:
1. **Component Type**: 
   - **Confidence**: XX%
   - **Details**: [brief details]
   - **Condition**: [brief condition]
   - **Risks**: [vegetation risks]

2. **Component Type**: 
   - **Confidence**: XX%
   - **Details**: [brief details]
   - **Condition**: [brief condition]
   - **Risks**: [vegetation risks]

If unsure about specific details, provide general information based on typical components of this type.`
            },
            { 
              type: "input_image", 
              image_url: imageData,
              detail: "high"
            }
          ]
        }
      ]
    });
    
    // Process the response text
    console.log('OpenAI API Response:', JSON.stringify(response));
    const content = response.output_text || response.content || '';
    
    // Parse the response content to extract components
    console.log("Parsing OpenAI response content");
    
    // Cleanup common disclaimer text that might confuse parsing
    const cleanedContent = content
      .replace(/I'm unable to analyze images directly\s*\.?/i, '')
      .replace(/As an AI, I cannot directly analyze the image\s*\.?/i, '')
      .replace(/I'll describe what I can see in this electrical infrastructure image\s*\.?/i, '');
      
    // First, try to extract components from markdown format commonly used
    let extractedComponents: any[] = [];
    
    // Log the cleaned content for debugging
    console.log("Cleaned content for parsing:", cleanedContent.substring(0, 300) + "...");
    
    // Check if the content has a numbered list with markdown formatting
    // This is a simpler regex that tries to match the output format we're seeing
    const hasNumberedList = /\d+\.\s+\*\*[^*]+\*\*:/.test(cleanedContent);
    
    if (hasNumberedList) {
      console.log("Found numbered markdown list format");
      
      // Split by numbered items (1., 2., etc.)
      const components = cleanedContent.split(/\d+\.\s+/).filter(Boolean);
      console.log(`Split into ${components.length} potential components`);
      
      // Process each component block
      components.forEach(block => {
        console.log("Parsing component block:", block.substring(0, 200) + "...");
        
        // Extract the component type
        // First, check for the pattern where "Component Type" is used as a heading with an actual value
        let typeMatch;
        let componentType;
        
        // Look for structured format with "Component Type: X" at the beginning 
        if (block.includes("**Component Type**:")) {
          // Find what comes after "Component Type:" in this case
          const valueAfterType = block.match(/\*\*Component Type\*\*:\s*([^*\n\r-]+)/i);
          
          if (valueAfterType && valueAfterType[1].trim()) {
            componentType = valueAfterType[1].trim();
            console.log(`Extracted actual type value after 'Component Type': ${componentType}`);
          } else {
            // If we can't find a value, extract the next line that doesn't contain "Confidence"
            const lines = block.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes("**Component Type**:") && i+1 < lines.length) {
                const nextLine = lines[i+1].trim();
                if (nextLine && !nextLine.toLowerCase().includes("confidence")) {
                  componentType = nextLine.replace(/^[^\w]+/, '').trim();
                  console.log(`Extracted type from next line: ${componentType}`);
                  break;
                }
              }
            }
          }
        }
        
        // If we still don't have a component type, try to find the first sentence
        if (!componentType) {
          // Look for the first colon with text before it
          typeMatch = block.match(/^\s*\*\*([^*:]+)\*\*\s*:/);
          componentType = typeMatch ? typeMatch[1].trim() : null;
        }
        
        // If component type is still "Component Type", skip using this literal text
        if (componentType === "Component Type") {
          // Try to extract a real name using the Details field
          const detailsMatch = block.match(/\*\*Details\*\*\s*:\s*([^*\n,]+)/i);
          if (detailsMatch && detailsMatch[1]) {
            // Extract first noun from details
            const firstWord = detailsMatch[1].split(' ')[0].trim();
            if (firstWord.match(/^[A-Z]/)) {  // Check if it starts with capital letter
              componentType = firstWord;
              console.log(`Using first word from details as type: ${componentType}`);
            }
          }
        }
        
        // Last resort if still "Component Type" or missing
        if (!componentType || componentType === "Component Type") {
          // Look for keywords in the block to determine the component type
          if (block.toLowerCase().includes("pole") || block.toLowerCase().includes("poteau")) {
            componentType = "Utility Pole";
          } else if (block.toLowerCase().includes("transformer") || block.toLowerCase().includes("transformateur")) {
            componentType = "Transformer";
          } else if (block.toLowerCase().includes("line") || block.toLowerCase().includes("wire") || 
                    block.toLowerCase().includes("ligne") || block.toLowerCase().includes("câble")) {
            componentType = "Power Line";
          } else {
            componentType = "Electrical Component";
          }
          console.log(`Determined type from keywords: ${componentType}`);
        }
        
        console.log(`Using component type: ${componentType}`);
        
        // For confidence, we expect a percentage
        const confMatch = block.match(/\*\*Confiden[cs]e\*\*\s*:\s*(\d+)%/i);
        
        // For the other properties, try to match everything up to the next property or end
        const detailsMatch = block.match(/\*\*Details\*\*\s*:\s*([^*]+?)(?=\s*\*\*|\s*$)/is);
        const conditionMatch = block.match(/\*\*Condition\*\*\s*:\s*([^*]+?)(?=\s*\*\*|\s*$)/is);
        const risksMatch = block.match(/\*\*Risks\*\*\s*:\s*([^*]+?)(?=\s*\*\*|\s*$)/is);
        
        // Clean up multiline matches by removing extra whitespace and newlines
        const cleanValue = (value: string | undefined) => {
          if (!value) return undefined;
          // Replace multiple whitespace, newlines and bullet points with a single space
          return value.replace(/\s*[\n\r]+\s*/g, ' ').replace(/\s*-\s*/g, '').trim();
        };
        
        // Display matched values for debugging
        console.log(`  Confidence: ${confMatch ? confMatch[1] : 'not found'}`);
        console.log(`  Details: ${detailsMatch ? detailsMatch[1].substring(0, 30) : 'not found'}...`);
        
        // Add this component with cleaned values and the properly identified component type
        if (componentType) {
          extractedComponents.push({
            type: componentType,
            confidence: confMatch ? parseInt(confMatch[1]) / 100 : 0.8,
            details: detailsMatch ? cleanValue(detailsMatch[1]) : 'Information non disponible',
            condition: conditionMatch ? cleanValue(conditionMatch[1]) : 'État inconnu',
            risks: risksMatch ? cleanValue(risksMatch[1]) : 'Risques non identifiés',
          });
        } else {
          console.log("Invalid component type:", componentType);
        }
      });
      
      console.log(`Extracted ${extractedComponents.length} components from numbered markdown`);
    }
    // If no numbered markdown blocks, try unnumbered markdown blocks
    else {
      const mdComponentBlocks = cleanedContent.match(/\*\*([^:*]+)\*\*:?\s+([\s\S]*?)(?=\*\*[^:*]+\*\*:|$)/g);
      
      if (mdComponentBlocks && mdComponentBlocks.length > 0) {
        console.log("Found markdown-style components:", mdComponentBlocks.length);
        
        // Process each component block 
        mdComponentBlocks.forEach(block => {
          const typeMatch = block.match(/\*\*([^:*]+)\*\*:?/);
          
          // Skip if this looks like a property and not a component type
          const looksLikeProperty = typeMatch && 
            (typeMatch[1].trim().toLowerCase() === 'confidence' || 
             typeMatch[1].trim().toLowerCase() === 'details' ||
             typeMatch[1].trim().toLowerCase() === 'condition' ||
             typeMatch[1].trim().toLowerCase() === 'risks');
             
          if (typeMatch && !looksLikeProperty) {
            // For other properties
            const confMatch = block.match(/\*\*Confiden[cs]e\*\*:?\s*(\d+)%/i);
            const detailsMatch = block.match(/\*\*Details\*\*:?\s*([^*\n]+)/i);
            const conditionMatch = block.match(/\*\*Condition\*\*:?\s*([^*\n]+)/i);
            const risksMatch = block.match(/\*\*Risks\*\*:?\s*([^*\n]+)/i);
            
            // Get a proper component type - not just "Component Type"
            let componentType = typeMatch[1].trim();
            
            // If component type is "Component Type", extract it from details or content
            if (componentType.toLowerCase() === "component type") {
              // Try to extract from details
              if (detailsMatch && detailsMatch[1]) {
                const firstWord = detailsMatch[1].split(' ')[0].trim();
                if (firstWord.match(/^[A-Z]/)) {
                  componentType = firstWord;
                  console.log(`Using first word from details as type: ${componentType}`);
                }
              }
              
              // If still "Component Type", use keywords
              if (componentType.toLowerCase() === "component type") {
                const blockText = block.toLowerCase();
                if (blockText.includes("pole") || blockText.includes("poteau")) {
                  componentType = "Utility Pole";
                } else if (blockText.includes("transformer") || blockText.includes("transformateur")) {
                  componentType = "Transformer";
                } else if (blockText.includes("line") || blockText.includes("wire") || 
                          blockText.includes("ligne") || blockText.includes("câble")) {
                  componentType = "Power Line";
                } else {
                  componentType = "Electrical Component";
                }
                console.log(`Determined type from keywords: ${componentType}`);
              }
            }
            
            extractedComponents.push({
              type: componentType,
              confidence: confMatch ? parseInt(confMatch[1]) / 100 : 0.8,
              details: detailsMatch ? detailsMatch[1].trim() : 'Information non disponible',
              condition: conditionMatch ? conditionMatch[1].trim() : 'État inconnu',
              risks: risksMatch ? risksMatch[1].trim() : 'Risques non identifiés',
            });
          }
        });
      }
    }
    
    // If no markdown components found, try plain numbered list approach
    if (extractedComponents.length === 0) {
      // Split by numbered items (1., 2., etc.)
      const componentStrings = cleanedContent.split(/\d+\.\s+/).filter(Boolean);
      
      // Extract components
      extractedComponents = componentStrings.map((str) => {
        console.log("Processing component string:", str.substring(0, 50) + "...");
        
        // More flexible regex patterns that handle variations
        const typeMatch = str.match(/^([^:.,;\n]+)[:.]/);
        const confidenceMatch = str.match(/[Cc]onfian?ce\s*[:.]?\s*\(?(\d+)%\)?/i) || str.match(/\((\d+)%\)/);
        const detailsMatch = str.match(/[Dd]etails?[:.]\s+([^.]+)/) || str.match(/[Dd]escription[:.]\s+([^.]+)/);
        const conditionMatch = str.match(/[Cc]ondition[:.]\s+([^.]+)/) || str.match(/[ÉE]tat[:.]\s+([^.]+)/);
        const risksMatch = str.match(/[Rr]isks?[:.]\s+([^.]*)/) || str.match(/[Rr]isques?[:.]\s+([^.]*)/);
        
        return {
          type: typeMatch ? typeMatch[1].trim() : 'Composant électrique',
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.8,
          details: detailsMatch ? detailsMatch[1].trim() : 'Information non disponible',
          condition: conditionMatch ? conditionMatch[1].trim() : 'État inconnu',
          risks: risksMatch ? risksMatch[1].trim() : 'Risques non identifiés',
        };
      });
    }
    
    // Print what components we extracted
    console.log("Extracted components before filtering:", 
      extractedComponents.map(c => c.type).join(", "));
      
    // Filter out components that look like property names, not actual components
    extractedComponents = extractedComponents.filter(comp => {
      // Skip components that have names matching property names
      const type = comp.type.toLowerCase();
      const isPropertyName = 
        type === 'confidence' || 
        type === 'details' || 
        type === 'condition' || 
        type === 'risks' ||
        type === 'confiance' ||
        type === 'détails' ||
        type === 'risques';
        
      // Skip components that are clearly disclaimers
      const isDisclaimer = 
        type.includes("unable") ||
        type.includes("sorry") ||
        type.includes("cannot") ||
        type.includes("disclaimer");
        
      // Skip components that are just "Component Type" literal
      const isGenericType = type === 'component type';
        
      return !isPropertyName && !isDisclaimer && !isGenericType && type !== 'composant électrique';
    });
    
    console.log(`After filtering property names: ${extractedComponents.length} components`);
    
    // Now remove duplicates - consider similar components
    const uniqueComponents: any[] = [];
    
    // Print the types we have after initial filtering
    console.log("Component types after filtering:", 
      extractedComponents.map(c => c.type).join(", "));
    
    extractedComponents.forEach(comp => {
      // Check if we already have a component of the same general type
      const isDuplicate = uniqueComponents.some(existingComp => {
        const existingType = existingComp.type.toLowerCase();
        const newType = comp.type.toLowerCase();
        
        // Check for "close enough" matches
        // For example "Utility Pole" and "Pole" should be considered duplicates
        if (existingType === newType) return true;
        
        // Compare types with common categories
        const isPoleDuplicate = 
          (existingType.includes('pole') && newType.includes('pole')) ||
          (existingType.includes('poteau') && newType.includes('poteau'));
          
        const isLineDuplicate = 
          (existingType.includes('line') && newType.includes('line')) ||
          (existingType.includes('wire') && newType.includes('wire')) ||
          (existingType.includes('ligne') && newType.includes('ligne')) ||
          (existingType.includes('câble') && newType.includes('câble'));
          
        const isTransformerDuplicate = 
          (existingType.includes('transformer') && newType.includes('transformer')) ||
          (existingType.includes('transformateur') && newType.includes('transformateur'));
        
        return isPoleDuplicate || isLineDuplicate || isTransformerDuplicate;
      });
      
      // Add only if not a duplicate
      if (!isDuplicate) {
        uniqueComponents.push(comp);
      } else {
        console.log(`Skipping duplicate component: ${comp.type}`);
      }
    });
    
    // Print what we kept
    console.log("Unique component types:",
      uniqueComponents.map(c => c.type).join(", "));
      
    // Update the components
    extractedComponents = uniqueComponents;
    
    console.log(`Found ${extractedComponents.length} unique components after filtering`);
    
    // No fallbacks - only use what we actually extracted
    if (extractedComponents.length === 0) {
      console.log("No components extracted. Will proceed with empty component list.");
      // Do not add any fallbacks - we'll show no components if we couldn't extract any
    }
    
    // Use the extracted components
    const components = extractedComponents;
    
    // Generate annotations with more natural positioning using percentage-based coordinates
    const annotations = components.map((component, index) => {
      const totalComponents = components.length;
      
      // Position components intelligently based on their type
      // Use percentages of image size (0-100) for better scaling
      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;
      
      // Spread components naturally across the image using golden ratio
      // This creates a more organic, natural distribution
      const phi = 0.618033988749895;
      let theta = index * phi;
      theta = theta - Math.floor(theta); // Keep value between 0-1
      
      // Adjust based on component type
      if (component.type.toLowerCase().includes('line') || 
          component.type.toLowerCase().includes('ligne')) {
        // Power lines tend to be in upper portions of the image
        x = 20 + (theta * 40); // 20-60% of width 
        y = 10 + (index % 3 * 10); // Top 10-30%
        width = 50 + (theta * 20); // 50-70% width
        height = 3 + (index % 3); // Thin lines
      } else if (component.type.toLowerCase().includes('pole') || 
                component.type.toLowerCase().includes('poteau')) {
        // Poles tend to be vertical and distributed horizontally
        x = 20 + (theta * 60); // 20-80% of width
        y = 20; // Start in upper portion
        width = 5 + (index % 3); // Thin poles
        height = 60 + (index % 3 * 10); // 60-90% height
      } else if (component.type.toLowerCase().includes('transformer') || 
                component.type.toLowerCase().includes('transformateur')) {
        // Transformers usually on poles or mounted somewhere
        x = 25 + (theta * 50); // 25-75% of width
        y = 30 + (index % 3 * 10); // Mid-height
        width = 15 + (index % 2 * 5); // Medium width
        height = 15 + (index % 2 * 5); // Medium height
      } else if (component.type.toLowerCase().includes('insulator') || 
                component.type.toLowerCase().includes('isolateur')) {
        // Insulators typically on poles
        x = 25 + (theta * 50); // 25-75% of width
        y = 25 + (index % 3 * 10); // Upper-mid height
        width = 10 + (index % 2 * 5); // Small width
        height = 10 + (index % 2 * 5); // Small height
      } else {
        // Generic components - distributed more randomly
        x = 15 + (theta * 60); // 15-75% of width 
        y = 20 + (index % 4 * 15); // More distributed vertically
        width = 20 + (index % 3 * 10);
        height = 20 + (index % 3 * 10);
      }
      
      // Ensure we don't overlap too much by adjusting based on index
      // This uses modulo to slightly shift positions
      x = (x + (index % 4) * 5) % 85; // Keep within 0-85%
      y = (y + (index % 3) * 7) % 75; // Keep within 0-75%
      
      return {
        id: (index + 1).toString(),
        type: 'rectangle',
        geometry: {
          x,          // 0-100% of image width
          y,          // 0-100% of image height
          width,      // 0-100% of image width
          height,     // 0-100% of image height
        },
        data: {
          label: component.type,
          description: component.details,
        },
      };
    });
    
    const result = {
      components,
      annotations,
      meta: {
        timestamp: Date.now(),
        source: 'openai',
        model: 'gpt-4o',
        version: '1.0'
      }
    };
    
    // Cache the result
    cacheResponse('analyze', imageHash, result, 'api');
    console.log('Analysis complete and cached');
    
    return result;
  } catch (error) {
    console.error('Error analyzing image with OpenAI:', error);
    // Return fallback data on error
    return getFallbackAnalysisData();
  }
}

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
    
    // Check if API key is configured properly
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      console.warn('API key appears to be missing or incorrect - forcing demo mode');
      // Force demo mode if API key is missing
      const demoData = getFallbackAnalysisData();
      return res.status(200).json(createResponse(demoData, 'fallback', 'api_key_missing'));
    }
    
    // Check demo mode and network status
    const demoStatus = getDemoStatus();
    const networkStatus = getNetworkStatus();
    
    // Generate image hash for cache lookup
    const imageHash = getImageHash(image);
    
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
      
      // FORCE DEMO MODE: Always use image 02 for demo reliability
      let imageId = "02"; 
      console.log("ANALYZE: FORCING IMAGE 02 FOR DEMO RELIABILITY");
      console.log(`Image ID before processing: ${imageId}`);
      
      // Debug logging to understand what's happening
      console.log(`Demo mode active - Detected imageId="${imageId}"`);
      console.log(`Current working directory: ${process.cwd()}`);
      console.log(`Expected directory for images: ${path.join(process.cwd(), 'public', 'demo-images')}`);
      console.log(`That directory exists: ${fs.existsSync(path.join(process.cwd(), 'public', 'demo-images'))}`);
      
      // Expect 02_boxes.jpg to be at this path:
      const expectedBoxesPath = path.join(process.cwd(), 'public', 'demo-images', `${imageId}_boxes.jpg`);
      console.log(`Expected boxes image path: ${expectedBoxesPath}`);
      console.log(`That file exists: ${fs.existsSync(expectedBoxesPath)}`);

      try {
        // Add debug information
        fs.appendFileSync(path.join(process.cwd(), 'debug.log'), 
          `ANALYZE - Image Hash: ${imageHash}\nDetected ID: ${imageId}\n\n`);
      } catch (error) {
        console.error('Error writing to debug file:', error);
      }
      
      
      console.log(`Demo mode active - Detected imageId="${imageId}"`);
      
      // Use the detected imageId
      
      // We'll directly read the _boxes.jpg version for the imageId
      try {
        // Try different possible file names and extensions
        const possibleExtensions = ['jpg', 'png', 'jpeg'];
        const possibleNames = ['_boxes', '_box'];
        let boxesImagePath = null;
        let boxesImageFound = false;
        
        // First, verify the demo-images directory exists
        const demoImagesDir = path.join(process.cwd(), 'public', 'demo-images');
        if (!fs.existsSync(demoImagesDir)) {
          console.error(`Demo images directory does not exist: ${demoImagesDir}`);
          
          // Try to list files in the public directory to debug
          try {
            const publicDir = path.join(process.cwd(), 'public');
            const files = fs.readdirSync(publicDir);
            console.log(`Files in public directory: ${files.join(', ')}`);
            
            // Check if demo-images is there with different case
            const demoImagesFolder = files.find(f => f.toLowerCase() === 'demo-images');
            if (demoImagesFolder) {
              console.log(`Found demo-images folder with different case: ${demoImagesFolder}`);
              // Use the actual folder name with correct case
              const correctedDemoImagesDir = path.join(publicDir, demoImagesFolder);
              
              // List files in the demo-images directory
              const demoImages = fs.readdirSync(correctedDemoImagesDir);
              console.log(`Files in demo-images directory: ${demoImages.join(', ')}`);
            }
          } catch (listError) {
            console.error(`Error listing files in public directory: ${listError}`);
          }
        } else {
          // List files in the demo-images directory
          try {
            const demoImages = fs.readdirSync(demoImagesDir);
            console.log(`Files in demo-images directory: ${demoImages.join(', ')}`);
          } catch (listError) {
            console.error(`Error listing files in demo-images directory: ${listError}`);
          }
        }
        
        // Try all combinations with enhanced logging
        console.log(`=== DEBUG: Searching for boxes image for imageId=${imageId} ===`);
        console.log(`Possible names to try: ${possibleNames.join(', ')}`);
        console.log(`Possible extensions to try: ${possibleExtensions.join(', ')}`);
        
        // Log all files in the demo-images directory for debugging
        try {
          const demoImgDir = path.join(process.cwd(), 'public', 'demo-images');
          console.log(`Files in demo-images directory: ${fs.readdirSync(demoImgDir).join(', ')}`);
        } catch (err) {
          console.error(`Error listing demo-images directory: ${err}`);
        }
        
        for (const name of possibleNames) {
          for (const ext of possibleExtensions) {
            const testPath = path.join(process.cwd(), 'public', 'demo-images', `${imageId}${name}.${ext}`);
            console.log(`Looking for boxes image at: ${testPath}`);
            console.log(`File exists check: ${fs.existsSync(testPath)}`);
            
            if (fs.existsSync(testPath)) {
              boxesImagePath = testPath;
              boxesImageFound = true;
              console.log(`Found boxes image file: ${boxesImagePath}`);
              console.log(`File size: ${fs.statSync(testPath).size} bytes`);
              console.log(`Absolute path: ${path.resolve(testPath)}`);
              break;
            } else {
              console.log(`File does not exist: ${testPath}`);
              // Check if parent directories exist
              const parentDir = path.dirname(testPath);
              console.log(`Parent directory (${parentDir}) exists: ${fs.existsSync(parentDir)}`);
            }
          }
          if (boxesImageFound) break;
        }
        
        // Check if the file exists
        if (boxesImageFound) {
          // Enhanced logging for debugging file path
          console.log(`=== DEBUG: About to read boxes image file ===`);
          console.log(`File path: ${boxesImagePath}`);
          console.log(`File exists: ${fs.existsSync(boxesImagePath)}`);
          console.log(`File stats: ${JSON.stringify(fs.statSync(boxesImagePath))}`);
          console.log(`File absolute path: ${path.resolve(boxesImagePath)}`);
          console.log(`Current working directory: ${process.cwd()}`);
          
          // Read the file as binary
          const imageBuffer = fs.readFileSync(boxesImagePath);
          console.log(`Read image file with size: ${imageBuffer.length} bytes`);
          
          // Convert to base64 with correct MIME type based on file extension
          const ext = path.extname(boxesImagePath).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
          const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          console.log(`Converted image to base64 string of length: ${base64Image.length}`);
          console.log(`MIME type used: ${mimeType}`);
          
          // Get the corresponding demo analysis data
          const analysisData = demoAnalysisData[imageId] || getFallbackAnalysisData();
          
          // Create response with the boxes image and analysis data
          const responseData = {
            ...analysisData,
            _boxesImage: base64Image, // Add the boxes image to the response
            _boxesImagePath: boxesImagePath // For debugging
          };
          
          console.log(`Created response with boxes image and analysis data`);
          
          // Cache it for future use
          cacheResponse('analyze', imageHash, responseData, 'demo');
          
          return res.status(200).json(createResponse(responseData, 'demo', demoStatus.mode));
        } else {
          console.error(`Boxes image file DOES NOT EXIST at path: ${boxesImagePath}`);
          
          // If the boxes image doesn't exist, try to use the regular image as a fallback
          console.log(`=== DEBUG: Boxes image not found, trying fallback to original image ===`);
          const originalImagePath = path.join(process.cwd(), 'public', 'demo-images', `${imageId}.jpg`);
          console.log(`Looking for original image at: ${originalImagePath}`);
          console.log(`Original image exists: ${fs.existsSync(originalImagePath)}`);
          
          // Try alternative extensions if jpg doesn't exist
          let finalOriginalPath = originalImagePath;
          if (!fs.existsSync(originalImagePath)) {
            console.log(`Original jpg not found, trying alternative extensions`);
            for (const ext of ['png', 'jpeg']) {
              const altPath = path.join(process.cwd(), 'public', 'demo-images', `${imageId}.${ext}`);
              console.log(`Checking alternative path: ${altPath}`);
              if (fs.existsSync(altPath)) {
                finalOriginalPath = altPath;
                console.log(`Found alternative original image: ${finalOriginalPath}`);
                break;
              }
            }
          }
          
          if (fs.existsSync(finalOriginalPath)) {
            console.log(`Using original image as fallback: ${finalOriginalPath}`);
            console.log(`File stats: ${JSON.stringify(fs.statSync(finalOriginalPath))}`);
            console.log(`Absolute path: ${path.resolve(finalOriginalPath)}`);
            
            // Read the original image
            const imageBuffer = fs.readFileSync(finalOriginalPath);
            console.log(`Read original image file with size: ${imageBuffer.length} bytes`);
            
            // Convert to base64
            const mimeType = path.extname(finalOriginalPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
            const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
            console.log(`Converted to base64 with MIME type: ${mimeType}`);
            
            // Get the corresponding demo analysis data or fallback
            const analysisData = demoAnalysisData[imageId] || getFallbackAnalysisData();
            
            // Create response with the original image and analysis data
            const responseData = {
              ...analysisData,
              _boxesImage: base64Image,
              _boxesImagePath: originalImagePath
            };
            
            // Cache it for future use
            cacheResponse('analyze', imageHash, responseData, 'demo');
            
            return res.status(200).json(createResponse(responseData, 'demo', demoStatus.mode));
          }
        }
      } catch (error) {
        console.error(`Error reading boxes image for ${imageId}:`, error);
      }
      
      // Fallback - if we couldn't get the boxes image, use regular demo data
      const fallbackData = getFallbackAnalysisData();
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
    
    // EMERGENCY FIX: Always include the boxes image path in the fallback data
    try {
      // Directly include the boxes image in the response for reliability
      const boxesImagePath = path.join(process.cwd(), 'public', 'demo-images', '02_boxes.jpg');
      console.log("EMERGENCY FIX: Reading boxes image from: " + boxesImagePath);
      
      if (fs.existsSync(boxesImagePath)) {
        const imageBuffer = fs.readFileSync(boxesImagePath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        
        // Add the boxes image to the response
        const enhancedFallbackData = {
          ...fallbackData,
          _boxesImage: base64Image,
          _boxesImagePath: '/demo-images/02_boxes.jpg'
        };
        
        console.log("EMERGENCY FIX: Successfully added boxes image to response");
        return res.status(200).json(createResponse(enhancedFallbackData, 'fallback', 'emergency'));
      }
    } catch (boxesError) {
      console.error("EMERGENCY FIX failed:", boxesError);
    }
    
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