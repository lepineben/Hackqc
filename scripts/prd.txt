# ÉnergIA - Hackathon Web App Demo PRD

## Project Overview
ÉnergIA is a web application prototype for Hydro-Québec's hackathon that enables citizens to take photos of electrical infrastructure. The app uses AI to analyze these photos, identify components, and project future vegetation growth that could impact the infrastructure. The primary focus is creating a compelling 2-minute demo that showcases the concept while being technically feasible to implement within 24 hours and can be hosted locally on the presenter's machine.

## Demo Requirements
- Total demo length: 2 minutes
- Target audience: Hackathon judges
- Demo environment: Web app running on presenter's laptop/machine with local hosting
- Success criteria: Demonstrate a complete user flow from taking a photo to receiving analysis and seeing future projection

## Core Demo User Journey

### 1. App Launch (15 seconds)
- Open web app in browser to show clean, modern interface with map background
- Brief explanation of app purpose
- Demonstrate location-aware information panel (can use fixed demo location)

### 2. Photo Capture (30 seconds)
- Demo presenter uses web app to:
  - Either take a live photo using laptop webcam 
  - Or upload a pre-selected test image of electrical infrastructure
- Show image preview and confirmation
- Demonstrate upload/processing animation (fixed duration for reliability)

### 3. AI Analysis Results (45 seconds)
- Show annotated image with bounding boxes around infrastructure components
- Display information panel with component details and educational content
- Highlight key insights about the electrical grid extracted from the image

### 4. Future Projection (30 seconds)
- Activate "VISION FUTUR" feature to show 5-year vegetation growth projection
- Compare current vs. future state with side-by-side or toggle view
- Show risk assessment and recommendations based on projected growth

## Technical Implementation Approach

### Frontend
- React web application (Create React App or Next.js)
- Pre-built UI components to accelerate development
- Responsive design focusing on laptop/desktop viewing
- Focus on the core demo screens only:
  - Home screen with map
  - Camera/upload interface
  - Analysis results screen with toggle for future view

### Backend
- Lightweight Node.js Express server or Next.js API routes
- Local hosting for demo reliability (no external hosting dependencies)
- No complex database required - use local file storage or simple JSON files
- Pre-generate certain responses for reliability during demo
- Option to run completely offline with pre-cached responses

### AI Integration
- OpenAI API integration for:
  - Vision analysis of electrical components
  - Image generation for future projection
- Implement error handling with fallback to pre-generated results

## MVP Feature Specifications

### 1. Home Screen
- **Must Have**:
  - Clean, modern UI with map background
  - Location indicator (can be hardcoded for demo)
  - "CAPTURE" button prominently displayed
  - Information panel showing contextual data
- **Testing Criteria**:
  - Screen renders correctly on target demo device
  - All UI elements properly aligned and responsive
  - "CAPTURE" button launches camera interface

### 2. Image Input System
- **Must Have**:
  - Browser camera access via WebRTC/getUserMedia
  - Alternative file upload option for pre-selected images
  - Preview and confirmation step
  - Upload/processing animation
- **Optional**:
  - Guidance for optimal photo capture
- **Testing Criteria**:
  - Camera access works in Chrome and Firefox
  - Image upload works with different file types (JPG, PNG)
  - Preview allows confirmation before proceeding
  - Fallback to file upload works when camera access is denied
  - Test with various image dimensions

### 3. Image Analysis Display
- **Must Have**:
  - Display of captured image with annotation overlays
  - Information panel showing detected components
  - "VISION FUTUR" button
- **Testing Criteria**:
  - Annotations render correctly on the image
  - Information panel displays expected content
  - UI responds appropriately to different image sizes
  - "VISION FUTUR" button activates as expected

### 4. Future Projection View
- **Must Have**:
  - Display of AI-generated future image showing vegetation growth
  - Toggle to switch between current and future views
  - Information panel updating with future-specific content
- **Testing Criteria**:
  - Future image loads and displays correctly
  - Toggle switches views smoothly
  - Information content updates appropriately

## Implementation Strategy

### Demo Reliability Approach
1. **Pre-selected Test Images**:
   - Prepare 2-3 specific test images of electrical infrastructure
   - Test extensively with these images to ensure consistent results
   - Use these same images during the actual demo

2. **Cached API Responses**:
   - Implement a caching layer for all API responses
   - For demo test images, pre-cache the OpenAI API responses
   - If API call fails during demo, seamlessly fall back to cached response

3. **Staged Demo Mode**:
   - Create a hidden "demo mode" that can be activated if needed
   - In demo mode, use pre-generated responses for each step
   - Should be indistinguishable from the real flow to viewers

### Testing Requirements
1. **Demo Path Testing**:
   - Test the complete demo flow 10+ times before presentation
   - Verify each step works consistently with test images
   - Test with both real API calls and fallback mechanisms

2. **Component Tests**:
   - Camera functionality reliability test
   - API integration tests with error simulation
   - UI rendering tests on target demo device
   - Network interruption tests with fallback verification

3. **Demo Environment Verification**:
   - Test in the actual presentation environment if possible
   - Verify network connectivity where demo will occur
   - Have backup hotspot available if needed
   - Prepare backup video recording of a successful demo run

## Technical Implementation Details

### Frontend Implementation
- **Framework**: React (Create React App or Next.js)
- **Key Packages**:
  - react-webcam for browser camera access
  - leaflet or google-maps-react for map display
  - react-image-annotation for overlay annotations
  - axios for API requests
  - tailwind CSS for rapid styling

### Backend Implementation
- **Framework**: Express.js (minimal) or Next.js API routes
- **Deployment**: Local hosting for demo with option to deploy on Vercel/Netlify
- **Caching Strategy**: Local file-based cache with pre-warmed responses
- **Offline Capability**: Full demo functionality without internet if needed

### AI Integration
- **OpenAI SDK** for Node.js
- **API Endpoints Needed**:
  - `/analyze-image` - Sends image to OpenAI Vision for analysis
  - `/generate-future` - Creates future projection using image generation
  
### Mock/Cache Strategy
- Pre-process test images through OpenAI APIs and save responses
- Create JSON mapping of image hashes to expected responses
- Implement fallback logic to use cached responses when needed

## Implementation Timeline (24-Hour Plan)

### Hour 0-6: Setup & Basic Structure
- Set up React web application project (Next.js or Create React App)
- Implement basic UI components and screens with responsive design
- Create minimal backend API routes
- Set up OpenAI API integration and test connections
- Prepare test images and data structure

### Hour 6-12: Core Functionality
- Implement webcam capture and file upload
- Create image analysis workflow with OpenAI API
- Build annotation display system for infrastructure elements
- Implement information panel components and styling

### Hour 12-18: Future Vision & Integration
- Connect to OpenAI for image generation (or prepare pre-generated images)
- Create toggling mechanism between current and future views
- Implement caching and fallback mechanisms for offline operation
- Pre-generate API responses for demo reliability

### Hour 18-22: Testing & Refinement
- Comprehensive testing of demo path on different browsers
- Fix critical bugs and UI issues
- Test with network disconnected to verify offline operation
- Create backup video recording of successful demo

### Hour 22-24: Final Preparation
- Rehearse demo presentation
- Prepare explanation scripts
- Set up local hosting environment for the demo
- Final verification of all components
- Document any known issues and workarounds

## Demo Success Verification Checklist

- [ ] Web app launches cleanly in Chrome and Firefox browsers
- [ ] Camera access or image upload works reliably with test images
- [ ] Analysis results appear within 5 seconds (real or cached)
- [ ] Annotations display correctly on the image
- [ ] Future vision toggle works smoothly
- [ ] UI appears professional and visually appealing
- [ ] Complete demo flow works end-to-end without errors
- [ ] Fallback mechanisms verified to work if API calls fail
- [ ] App functions when running completely offline (for demo reliability)
- [ ] Demo can be completed within 2-minute timeframe
- [ ] Backup video recording available if needed

## Known Limitations (For Team Awareness)
- App will focus on the demo flow only - many described features will be simulated
- Limited error handling outside the main demo path
- Works best with pre-tested images
- Future projection may use pre-generated images rather than real-time generation
- Information panels may contain partially hardcoded content for reliability
- Limited or no actual database integration

## Conclusion
This PRD outlines a focused, achievable plan for creating a compelling 2-minute demo of the ÉnergIA concept for the Hydro-Québec hackathon. By prioritizing the core user journey and implementing reliable fallbacks, the team can create a functional prototype that demonstrates the key value proposition within the 24-hour timeframe.
