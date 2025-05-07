# ÉnergIA Test Plan

This document outlines the comprehensive testing approach for the ÉnergIA demo application, ensuring all components work reliably for the Hydro-Québec hackathon presentation.

## 1. Environment Setup

### Test Cases:
- **ES-01**: Verify local server starts correctly
  - Steps: Run `npm run dev` in the energia-demo directory
  - Expected: Server starts without errors, application loads at http://localhost:3000
  
- **ES-02**: Confirm all dependencies are loaded
  - Steps: Check browser console for any missing dependency errors
  - Expected: No console errors related to missing libraries or components
  
- **ES-03**: Test network connectivity
  - Steps: Check network requests in browser developer tools
  - Expected: All network requests succeed when online
  
- **ES-04**: Verify fallback to offline mode works
  - Steps: Disable network connection and reload the application
  - Expected: Application loads using cached demo data, demo mode activates automatically

## 2. Home Screen

### Test Cases:
- **HS-01**: Verify map loads correctly
  - Steps: Open home page and check if map renders
  - Expected: Leaflet map displays with proper styling
  
- **HS-02**: Confirm location indicator appears
  - Steps: Check if the marker is visible on the map
  - Expected: Location marker appears with the correct icon
  
- **HS-03**: Test information panel displays correctly
  - Steps: Check if InfoPanel component is visible with proper data
  - Expected: Panel shows location information and status indicators
  
- **HS-04**: Verify CAPTURE button works
  - Steps: Click on the capture button
  - Expected: Navigation to /capture page occurs smoothly

## 3. Image Capture

### Test Cases:
- **IC-01**: Test webcam access
  - Steps: Open capture page and check if webcam initializes
  - Expected: Camera feed displays (if camera available) or fallback option provided
  
- **IC-02**: Verify file upload alternative works
  - Steps: Click on upload option and select a test image
  - Expected: Image preview displays correctly after upload
  
- **IC-03**: Confirm image preview displays correctly
  - Steps: Capture or upload an image
  - Expected: Preview shows with confirmation controls
  
- **IC-04**: Test confirmation step
  - Steps: Click on confirm button after image capture/upload
  - Expected: Proceeds to processing step
  
- **IC-05**: Verify processing animation works
  - Steps: Submit an image for processing
  - Expected: Processing animation displays with progress indicators

## 4. Analysis Results

### Test Cases:
- **AR-01**: Confirm image loads with annotations
  - Steps: Complete image processing and check analysis view
  - Expected: Image displays with bounding box annotations around components
  
- **AR-02**: Verify information panel shows correct data
  - Steps: Check component information panel
  - Expected: Panel shows detailed information about detected components
  
- **AR-03**: Test component selection
  - Steps: Click on different annotations
  - Expected: Info panel updates to show selected component details
  
- **AR-04**: Test VISION FUTUR button
  - Steps: Click on the future vision button
  - Expected: Navigation to /future page occurs

## 5. Future Projection

### Test Cases:
- **FP-01**: Verify future image loads correctly
  - Steps: Navigate to future projection page
  - Expected: Future projection image loads
  
- **FP-02**: Test toggle between current and future views
  - Steps: Use toggle controls to switch between views
  - Expected: Smooth transition between current and future images
  
- **FP-03**: Test comparison slider
  - Steps: Use the comparison slider
  - Expected: Slider smoothly reveals portions of each image
  
- **FP-04**: Confirm information panel updates appropriately
  - Steps: Check information panel in future view
  - Expected: Panel shows future projection data and recommendations

## 6. Error Scenarios

### Test Cases:
- **ES-01**: Test with network disconnected
  - Steps: Disable network and use the application
  - Expected: Application falls back to demo mode and cached responses
  
- **ES-02**: Verify fallback to cached responses
  - Steps: Process a previously analyzed image with network disabled
  - Expected: Analysis displays using cached data
  
- **ES-03**: Test with invalid images
  - Steps: Upload corrupt or unsupported file formats
  - Expected: User-friendly error message displays
  
- **ES-04**: Verify error recovery mechanisms
  - Steps: Cause an error (e.g., API timeout) and check recovery
  - Expected: Application handles error gracefully with fallback

## 7. Demo Mode

### Test Cases:
- **DM-01**: Test activation of demo mode
  - Steps: Use Ctrl+Shift+D shortcut to toggle demo mode
  - Expected: Demo mode indicator appears
  
- **DM-02**: Test scenario switching
  - Steps: Expand demo controls and switch scenarios
  - Expected: Scenario changes and appropriate images are used
  
- **DM-03**: Verify pre-generated responses are used
  - Steps: Process images in demo mode
  - Expected: Analysis completes quickly using pre-cached responses
  
- **DM-04**: Test complete demo flow in demo mode
  - Steps: Run through entire capture-analyze-future flow in demo mode
  - Expected: All steps complete successfully with demo data

## 8. Performance

### Test Cases:
- **PF-01**: Verify all transitions complete within expected time
  - Steps: Time page transitions and animations
  - Expected: All transitions complete within 500ms
  
- **PF-02**: Confirm total demo can be completed in 2 minutes
  - Steps: Time a complete demo run
  - Expected: Complete flow from home to future projection can be completed in under 2 minutes

## Test Execution Checklist

For each test run, record the following:
- Date and time of test
- Test environment (browser, device, network conditions)
- Test case IDs executed
- Pass/Fail status for each case
- Detailed notes for any failures
- Screenshots or recordings of issues

## Known Issues and Workarounds

1. **Camera Access on Some Browsers**
   - Issue: Some browsers may block camera access by default
   - Workaround: Use file upload option instead
   
2. **Large Image Processing**
   - Issue: Very large images may cause processing delays
   - Workaround: Use images under 2MB for reliable performance
   
3. **Mobile Browser Compatibility**
   - Issue: Some features may have limited functionality on older mobile browsers
   - Workaround: Use recent versions of Chrome or Safari on mobile