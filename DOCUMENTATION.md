# ÉnergIA - System Documentation

## Table of Contents
- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [User Flow](#user-flow)
- [Component Breakdown](#component-breakdown)
- [API Endpoints](#api-endpoints)
- [Demo Mode & Reliability Features](#demo-mode--reliability-features)
- [Image Processing Pipeline](#image-processing-pipeline)
- [Storage & Cache Management](#storage--cache-management)
- [Error Handling](#error-handling)
- [Technical Reference](#technical-reference)

## Project Overview

ÉnergIA is a web application prototype developed for Hydro-Québec's hackathon. The application enables citizens to take photos of electrical infrastructure, which are then analyzed using AI to identify components and project future vegetation growth that could impact the infrastructure. The primary focus is creating a compelling 2-minute demo that showcases this concept.

### Key Features
- Map-based home screen showing electrical infrastructure locations
- Image capture via camera or file upload
- AI analysis of electrical infrastructure components
- Visualization of future vegetation growth and potential risks
- Educational information about electrical infrastructure

### Technology Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: react-webcam, react-image-annotation, leaflet maps
- **AI Integration**: OpenAI API (GPT-4o for analysis, GPT-image-1 for future projections)
- **Storage**: Browser sessionStorage and localStorage
- **Animations**: Framer Motion

## System Architecture

The ÉnergIA application follows a client-server architecture using Next.js for both frontend rendering and API endpoints. The application is designed to be highly resilient with multiple fallback mechanisms to ensure reliable demos.

### High-Level Architecture
```
┌─────────────────────────────────┐
│            Frontend             │
│  ┌─────┐  ┌──────┐  ┌────────┐  │
│  │Home │  │Capture│  │Analysis│  │
│  └─────┘  └──────┘  └────────┘  │
│           ┌────────────┐        │
│           │Future Vision│        │
│           └────────────┘        │
└─────────────────┬───────────────┘
                  │
┌─────────────────┼───────────────┐
│       Next.js API Routes        │
│  ┌──────────────┬────────────┐  │
│  │analyze-image │generate-   │  │
│  │              │future      │  │
│  └──────────────┴────────────┘  │
└─────────────────┬───────────────┘
                  │
┌─────────────────┼───────────────┐
│        Service Layer            │
│ ┌────────┐ ┌─────┐ ┌─────────┐  │
│ │OpenAI  │ │Cache│ │DemoMode │  │
│ └────────┘ └─────┘ └─────────┘  │
└─────────────────────────────────┘
```

### Core System Components
1. **Frontend Pages**: React components for user interaction
2. **API Routes**: Server-side endpoints for AI processing
3. **Service Layer**: Utilities for OpenAI integration, caching, and demo mode

### Design Principles
- Mobile-first responsive design
- Progressive enhancement with graceful degradation
- Extensive caching for reliability
- Multiple fallback mechanisms for demos

## User Flow

The application follows a linear flow designed to guide users through the process of capturing, analyzing, and exploring future projections of electrical infrastructure.

### 1. Home Screen
- Displays a map with electrical infrastructure locations
- Features a prominent capture button
- Provides information about the application purpose

### 2. Capture Screen
- Offers two capture methods:
  - Camera capture (using device camera)
  - File upload (drag & drop or file browser)
- Shows a preview of the captured image
- Processes and normalizes the image before analysis

### 3. Analysis Screen
- Displays the analyzed image with component annotations
- Shows a list of identified electrical components
- Provides detailed information about selected components
- Includes a "Vision Futur" button to proceed to the next step

### 4. Future Vision Screen
- Shows a projection of future vegetation growth
- Displays potential issues and risk assessments
- Provides maintenance recommendations
- Includes navigation to return to analysis or home

## Component Breakdown

### Page Components

#### Home Page (`/pages/index.tsx`)
- Serves as the application entry point
- Renders a map component with location markers
- Displays the capture button for navigation

#### Capture Page (`/pages/capture/index.tsx`)
- Manages camera and upload interfaces
- Handles image capture, validation, and compression
- Processes captured images before sending to analysis
- Key states:
  - `captureMethod`: Controls which capture interface is shown (camera/upload)
  - `image`: Stores the captured/uploaded image data
  - `isProcessing`: Controls loading state during processing

#### Analysis Page (`/pages/analysis/index.tsx`)
- Displays the analyzed image with component annotations
- Shows detailed component information
- Provides navigation to the future vision
- Key states:
  - `image`: The original captured image
  - `displayedImage`: The image shown (could be with annotations)
  - `analysisData`: Component information from AI analysis
  - `activeAnnotation`: Currently selected component

#### Future Page (`/pages/future/index.tsx`)
- Shows the future projection of vegetation growth
- Displays risk assessments and recommendations
- Provides navigation back to analysis or home
- Key states:
  - `currentImage`: Original image
  - `futureImage`: Generated future projection
  - `futureData`: Analysis data for the future projection
  - `processingStep`: Current step in the processing animation

### UI Components

#### Layout Component
- Provides consistent page structure with header and footer
- Manages page transitions using Framer Motion
- Responsive design for mobile and desktop

#### Map Component
- Displays an interactive Leaflet map
- Shows markers for electrical infrastructure
- Client-side only rendering with dynamic imports

#### CaptureButton Component
- Animated button for initiating image capture
- Features hover and click animations
- Navigates to the capture page

#### ProcessingAnimation Component
- Shows animated loading state during processing
- Displays step-based progress information
- Configurable for different processing steps

#### AnalysisInfoPanel Component
- Displays list of detected components
- Shows detailed information for selected components
- Features confidence indicators and risk assessments

#### FutureInfoPanel Component
- Shows future projection information
- Displays risk levels and recommendations
- Provides educational content about vegetation growth

#### ComparisonView Component
- Enables toggling between current and future images
- Features interactive slider for side-by-side comparison
- Supports touch and mouse interactions

#### SimpleAnnotationView Component
- Displays image with annotation boxes
- Handles annotation scaling and positioning
- Supports click interactions for component selection

## API Endpoints

### `/api/analyze-image`

#### Purpose
Analyzes an image to identify electrical infrastructure components and assess their condition.

#### Request Format
- **Method**: POST
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,..."
  }
  ```

#### Response Format
```typescript
{
  components: [
    {
      type: string,          // Component type (e.g., "Pylône de transmission")
      confidence: number,    // Confidence score (0-1)
      details: string,       // Component details
      condition: string,     // Component condition
      risks: string          // Vegetation-related risks
    }
  ],
  annotations: [
    {
      id: string,            // Unique identifier
      type: string,          // Annotation type (usually "rectangle")
      geometry: {
        x: number,           // X position (percentage)
        y: number,           // Y position (percentage)
        width: number,       // Width (percentage)
        height: number       // Height (percentage)
      },
      data: {
        label: string,       // Component name
        description: string  // Description
      }
    }
  ],
  meta: {
    timestamp: number,       // UNIX timestamp
    source: string,          // "api", "cache", "demo", "fallback"
    model?: string,
    version?: string
  }
}
```

#### Implementation Details
- Uses OpenAI's GPT-4o model for image analysis
- Specifically crafted prompt for electrical infrastructure
- Response parsing to extract structured component data
- Includes caching with 24-hour TTL
- Demo mode fallbacks for reliable presentations

### `/api/generate-future`

#### Purpose
Generates a future projection of vegetation growth around electrical infrastructure.

#### Request Format
- **Method**: POST
- **Content-Type**: application/json
- **Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,..."
  }
  ```

#### Response Format
```typescript
{
  futureImage: string,       // base64-encoded future image
  analysis: {
    projectionDate: string,  // Future date (e.g., "Mai 2030")
    vegetationGrowth: string, // Description of vegetation growth
    potentialIssues: [
      {
        component: string,   // Component name
        risk: string,        // Risk level (e.g., "Élevé", "Moyen", "Faible")
        description: string  // Issue description
      }
    ],
    recommendations: string[], // Recommended actions
    meta: {
      timestamp: number,     // UNIX timestamp
      source: string,        // "api", "cache", "demo", "fallback"
      version?: string
    }
  }
}
```

#### Implementation Details
- Uses OpenAI's GPT-image-1 for image generation
- Specifically crafted prompt for realistic vegetation growth
- Response includes both generated image and analysis data
- Includes caching with 3-day TTL
- Demo mode provides pre-generated images for reliability

## Demo Mode & Reliability Features

The ÉnergIA application includes a comprehensive demo mode designed to ensure reliable presentations without requiring internet access or valid API keys.

### Demo Mode Activation
- **Environment Variable**: `NEXT_PUBLIC_DEMO_MODE=true`
- **Toggle Script**: `toggle-mode.sh` script for easy switching
- **Automatic Activation**: Activates when API keys are missing
- **Network Detection**: Switches to demo mode when offline

### Demo Features
- **Pre-cached Images**: Five demo images (01.jpg through 05.jpg)
- **Annotated Versions**: Pre-generated annotations (XX_boxes.jpg)
- **Future Projections**: Pre-generated future images (XX_future.jpg)
- **Simulated Processing**: Realistic delays and progress indicators

### Reliability Features
- **Image Forcing**: Always uses image "02" for reliable demos
- **Multiple Fallbacks**: Cascading fallback system for all resources
- **Storage Quota Management**: Cleanup strategies for storage limits
- **Network Resilience**: Functions offline with pre-cached data
- **Error Recovery**: Graceful degradation with informative messages

### Demo Data Structure
- **Analysis Data**: Pre-defined component information for each demo image
- **Future Projections**: Pre-defined risk assessments and recommendations
- **Visual Assets**: Pre-generated annotated and future images

## Image Processing Pipeline

### 1. Image Capture & Normalization
- **Capture**: Via webcam or file upload
- **Validation**: Image type and size checks
- **Normalization**: Ensuring consistent base64 format
- **Compression**:
  - Canvas-based compression for large images
  - Target width of 1024px
  - JPEG quality of 0.8
  - Size-aware optimization

### 2. Image Storage
- **Storage Method**:
  - Uses sessionStorage with unique keys
  - Storage key format: `energia_image_${Date.now()}`
  - Falls back to demo mode if storage fails

### 3. Image Analysis
- **Real API Mode**:
  1. Image sent to `/api/analyze-image` endpoint
  2. OpenAI GPT-4o processes image
  3. Response parsed for components and annotations
  4. Results cached and returned to client

- **Demo Mode**:
  1. Predefined demo image used (02_boxes.jpg)
  2. Pre-defined analysis data returned
  3. Simulated processing delay for realistic UX

### 4. Future Projection
- **Real API Mode**:
  1. Image sent to `/api/generate-future` endpoint
  2. OpenAI GPT-image-1 generates future projection
  3. Response includes generated image and analysis
  4. Results cached and returned to client

- **Demo Mode**:
  1. Pre-generated future image used (02_future.jpg)
  2. Pre-defined future data returned
  3. Simulated processing steps for realistic UX

## Storage & Cache Management

### Storage Types
- **sessionStorage**: For current session images
- **localStorage**: For caching and demo settings
- **In-memory Cache**: For immediate access to recent data

### Cache Implementation
- **Structure**: `{ [key: string]: CacheEntry }`
- **Entry Format**:
  ```typescript
  {
    data: any,              // Cached data
    timestamp: number,      // Creation time
    expires: number,        // Expiration time
    source: 'api' | 'demo' | 'fallback',
    hash?: string,          // Content hash
    meta?: Object           // Additional metadata
  }
  ```

### Cache Types & TTL
- **Analysis**: 24 hours
- **Future**: 3 days
- **Future Images**: 7 days
- **Demo/Fallback**: 30 days

### Quota Management
- **Monitoring**: Checks storage usage with `navigator.storage.estimate()`
- **Threshold**: Warns at 80% quota usage
- **Cleanup Strategy**: Removes oldest and non-essential entries first
- **Pruning**: Removes entries by priority when quota exceeded

## Error Handling

### Types of Errors Handled
- **API Errors**: Missing keys, timeouts, response parsing issues
- **Network Errors**: Offline detection, connection quality issues
- **Storage Errors**: Quota exceeded, missing data, data corruption
- **Resource Errors**: Missing files, format issues, path resolution

### Error Recovery Strategy
1. Try optimum path (API call)
2. Check for cached data
3. Fall back to demo data if available
4. Use emergency fallback data as last resort
5. Show user-friendly error message if all else fails

### User Experience During Errors
- **Loading Animations**: Continue showing loading state
- **Error Messages**: User-friendly messages without technical details
- **Retry Options**: Allow users to retry operations
- **Graceful Degradation**: Show partial content when possible

## Technical Reference

### Key Configuration Parameters
- **Environment Variables**:
  - `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI API key
  - `NEXT_PUBLIC_DEMO_MODE`: Enable/disable demo mode
  - `NEXT_PUBLIC_API_MODE`: API mode configuration

- **Caching Configuration**:
  - `MAX_STORAGE_SIZE`: 5MB default
  - `QUOTA_WARNING_THRESHOLD`: 80%
  - `DEFAULT_CACHE_TTL`: 24 hours (86400000ms)

- **Processing Configuration**:
  - `MAX_IMAGE_WIDTH`: 1024px for compression
  - `IMAGE_QUALITY`: 0.8 (JPEG compression)
  - `MIN_PROCESSING_DELAY`: 1000ms (for demo mode)
  - `MAX_PROCESSING_DELAY`: 3000ms (for demo mode)

### Client-Side State Management
- Uses React's `useState` and `useEffect` for state management
- URL parameters for state persistence between pages
- `sessionStorage` for image data transfer
- `localStorage` for long-term cache and settings

### Server-Side Implementation
- Next.js API routes for server-side processing
- OpenAI API integration for image analysis and generation
- Server-side only import of API credentials
- TypeScript for type safety throughout the application

### Demo Mode Implementation
- `lib/demoMode/index.ts` manages demo mode status and scenarios
- Keyboard shortcut (Ctrl+Shift+D) for toggling demo mode
- `localStorage` for persisting demo settings
- Automatic activation when API keys are missing

### Data Flow Diagram
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Home   │───►│ Capture │───►│Analysis │───►│ Future  │
└─────────┘    └────┬────┘    └────┬────┘    └────┬────┘
                    │              │              │
                    ▼              ▼              ▼
               ┌─────────────────────────────────────┐
               │          sessionStorage             │
               └───────────────────┬─────────────────┘
                                   │
                                   ▼
               ┌─────────────────────────────────────┐
               │         API Endpoints               │
               │  ┌────────────┐  ┌────────────┐    │
               │  │analyze-image│  │gen-future  │    │
               │  └──────┬─────┘  └──────┬─────┘    │
               └─────────┼──────────────┼───────────┘
                         │              │
               ┌─────────┼──────────────┼───────────┐
               │ ┌───────▼────┐  ┌──────▼─────┐     │
               │ │OpenAI Vision│  │OpenAI Image│     │
               │ └────────────┘  └────────────┘     │
               │           OpenAI API                │
               └─────────────────────────────────────┘
```

This comprehensive documentation should provide a thorough understanding of the ÉnergIA system, its components, and how they interact to deliver the application functionality.