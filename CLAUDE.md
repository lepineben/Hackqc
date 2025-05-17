# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ÉnergIA is a web application prototype for Hydro-Québec's hackathon that enables citizens to take photos of electrical infrastructure. The app uses AI to analyze these photos, identify components, and project future vegetation growth that could impact the infrastructure. The primary focus is creating a compelling 2-minute demo that showcases the concept.

## Development Setup

### Environment Setup
- The project is a Next.js React application **built with TypeScript** located in `/energia-demo` directory
- Install dependencies with `npm install --legacy-peer-deps` (legacy flag needed for react-image-annotation)
- Run development server with `npm run dev`
- Build for production with `npm run build`
- Start production server with `npm start`

### Development Progress
- Check `DEVELOPMENT_LOG.md` in the energia-demo directory for detailed progress tracking
- This log documents completed tasks, current status, and upcoming work
- Always update this log when completing significant work

### Key Dependencies
- React/Next.js - Frontend framework
- react-webcam - For camera access
- leaflet - For map display
- react-image-annotation - For overlay annotations
- axios - For API requests
- tailwind CSS - For styling

## Project Structure

Once implemented, the project will follow this structure:
- `/components` - Reusable React components
- `/pages` - Next.js page components and API routes:
  - `/index.tsx` - Home screen with map
  - `/capture.tsx` - Camera/upload interface
  - `/analysis.tsx` - Analysis results screen
  - `/future.tsx` - Future projection view
  - `/api/analyze-image.tsx` - API route for image analysis
  - `/api/generate-future.tsx` - API route for future projection
- `/public` - Static assets
- `/lib` - Utility functions, including caching mechanisms
- `/styles` - CSS styles

## Core Features

1. **Home Screen**: Map display with location indicator and capture button
2. **Image Capture**: Browser camera access or file upload alternative
3. **Image Analysis**: Display annotated image with component information
4. **Future Projection**: Toggle between current and AI-generated future views

## Important Implementation Notes

1. **Demo Reliability**:
   - Implement caching mechanisms for API responses
   - Create fallback to pre-cached responses for offline operation
   - Prepare test images with consistent results

2. **OpenAI Integration**:
   - Set up environment variables for API keys
   - Implement error handling with fallbacks
   - Use pre-cached responses for demo reliability

3. **Performance Considerations**:
   - Optimize for 2-minute demo flow
   - Ensure all API responses return within 5 seconds
   - Focus on reliability over completeness

## Development Workflow

1. **Task Management**:
   - Check the completed tasks in `DEVELOPMENT_LOG.md`
   - Update the log after completing each task
   - Follow the implementation priorities in the PRD

2. **Code Continuity**:
   - Review existing code before making changes
   - Maintain consistent coding style across the project
   - Ensure all components use TypeScript properly

3. **Testing**:
   - Test each feature as it's implemented
   - Verify features work in offline mode
   - Ensure responsive design works on different screen sizes