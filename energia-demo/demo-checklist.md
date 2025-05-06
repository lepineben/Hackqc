# ÉnergIA Demo Checklist

This checklist is designed to ensure a successful demo presentation of the ÉnergIA application for the Hydro-Québec hackathon.

## Pre-Presentation Day Setup

- [ ] Verify all dependencies are installed: `npm install --legacy-peer-deps`
- [ ] Build production version: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Ensure all demo images are accessible and cached
- [ ] Verify all environment variables are properly set in .env.local
- [ ] Test all demo scenarios at least once
- [ ] Create a backup copy of the project on a USB drive
- [ ] Prepare backup demo video recording
- [ ] Ensure presentation device meets system requirements
- [ ] Check browser compatibility on presentation device

## Presentation Day Morning Checklist

- [ ] Arrive at venue at least 1 hour before scheduled presentation
- [ ] Set up presentation equipment and test connections
- [ ] Start local server: `npm run dev` (or `npm start` for production build)
- [ ] Verify application loads correctly
- [ ] Test network connection at venue
- [ ] Enable demo mode (Ctrl+Shift+D) and verify it's working
- [ ] Test all 5 demo scenarios to ensure they load properly
- [ ] Prepare backup video for quick access if needed
- [ ] Test audio/video equipment if using for presentation
- [ ] Run through complete demo flow once
- [ ] Verify device battery is charged or connected to power

## Immediately Before Presentation

- [ ] Close unnecessary applications to free up system resources
- [ ] Ensure presentation display settings are correct (resolution, scaling)
- [ ] Open browser to application homepage
- [ ] Reset demo to desired starting scenario
- [ ] Verify demo mode is active (indicator should be visible)
- [ ] Check that browser zoom level is set to 100%
- [ ] Disable any notifications or popup blockers
- [ ] Ensure device will not go to sleep during presentation
- [ ] Have USB backup ready for quick access

## Demo Flow Script

### 1. Introduction (30 seconds)
- [ ] Show homepage with map
- [ ] Briefly explain the purpose of ÉnergIA
- [ ] Point out key areas of the interface

### 2. Image Capture (30 seconds)
- [ ] Navigate to Capture page
- [ ] Demonstrate webcam capture or image upload
- [ ] Show image preview and confirmation step
- [ ] Point out processing animation

### 3. Analysis Results (30 seconds)
- [ ] Show analysis page with annotations
- [ ] Highlight component identification
- [ ] Demonstrate clicking on a component to show details
- [ ] Explain key information for infrastructure components

### 4. Future Projection (30 seconds)
- [ ] Navigate to future projection view
- [ ] Demonstrate toggle between current and future states
- [ ] Show comparison slider functionality
- [ ] Highlight key risk areas and recommendations

### 5. Wrap-up & Benefits (30 seconds)
- [ ] Return to home or summary view
- [ ] Recap key benefits for Hydro-Québec
- [ ] Mention any future development possibilities
- [ ] Thank the audience

## Emergency Recovery Procedures

### If Network Fails
1. Activate demo mode if not already active (Ctrl+Shift+D)
2. Continue presentation using pre-cached demo data
3. Mention that the app is designed to work offline with cached data

### If Application Crashes
1. Quickly restart the browser
2. Navigate back to the application
3. Enable demo mode (Ctrl+Shift+D)
4. Resume demo from appropriate scenario

### If Demo Mode Fails
1. Use backup video recording
2. Explain that it's a recording of the application
3. Narrate the key features as the video plays

## After Presentation

- [ ] Be prepared to answer technical questions
- [ ] Note any issues encountered for future improvement
- [ ] Collect any feedback provided by judges or audience
- [ ] Backup any new data or notes from the presentation

## Contacts

- Technical Support: [Team Member Name] - [Phone Number]
- Backup Presenter: [Team Member Name] - [Phone Number]
- Venue IT Support: [Contact Information]