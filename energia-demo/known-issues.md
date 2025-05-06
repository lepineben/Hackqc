# ÉnergIA Known Issues and Workarounds

This document outlines known issues in the ÉnergIA demo application and provides workarounds to ensure a smooth presentation experience.

## Camera Access Issues

### Issue:
Some browsers or devices may restrict camera access or require explicit permissions. This can cause the webcam capture to fail or show permission errors.

### Workarounds:
1. **Use File Upload Instead**:
   - Click on the "Upload Image" option instead of using the camera
   - Select a pre-saved demo image from your device

2. **Pre-authorize Camera**:
   - Before presentation, visit the capture page and accept camera permissions
   - Keep the browser open between tests to maintain permissions

3. **Browser Settings**:
   - In Chrome: Go to Settings > Privacy and Security > Site Settings > Camera
   - Add localhost to the allowed sites list

## Network Connectivity Issues

### Issue:
Venue Wi-Fi may be unreliable or unavailable, potentially affecting OpenAI API calls for image analysis.

### Workarounds:
1. **Enable Demo Mode**:
   - Use the keyboard shortcut Ctrl+Shift+D to enable demo mode
   - Demo mode uses pre-cached responses and works offline

2. **Pre-cache Demo Images**:
   - Before presentation, load all demo scenarios while connected to the internet
   - This ensures all necessary data is stored in the browser's cache

3. **Mobile Hotspot Backup**:
   - Have a mobile hotspot available as a backup internet connection
   - Test the application with this hotspot before the presentation

## Browser Compatibility Issues

### Issue:
Some features may not work consistently across all browsers, particularly on older versions.

### Workarounds:
1. **Use Chrome or Edge**:
   - The application is fully tested on Google Chrome and Microsoft Edge
   - Avoid using Internet Explorer or older browsers

2. **Update Browser**:
   - Ensure the browser is updated to the latest version
   - Clear browser cache before the presentation

3. **Disable Extensions**:
   - Some browser extensions might interfere with the application
   - Use incognito/private mode to temporarily disable extensions

## Performance Issues

### Issue:
Processing large images or complex scenes might cause performance delays, especially on less powerful devices.

### Workarounds:
1. **Use Optimized Demo Images**:
   - Stick to the provided demo images which are optimized for performance
   - Avoid uploading very high-resolution images during the demo

2. **Close Other Applications**:
   - Close unnecessary applications and browser tabs
   - Restart the browser before the presentation

3. **Pre-warm the Application**:
   - Open and interact with all parts of the application before the presentation
   - This helps with initial loading times and caching

## Local Storage Limitations

### Issue:
The application uses localStorage for caching, which has a size limit (typically 5-10MB). Exceeding this limit can cause caching to fail.

### Workarounds:
1. **Clear Old Cache Data**:
   - In browser developer tools: Application > Storage > Local Storage
   - Clear old items if needed before the presentation

2. **Limit Demo Scenarios**:
   - Stick to 2-3 key demo scenarios rather than loading all possible scenarios
   - Focus on the most impressive or relevant scenarios for the presentation

3. **Monitor Storage Usage**:
   - Before presentation, check localStorage usage in developer tools
   - Ensure at least 3MB of free space is available

## Animation and Transition Glitches

### Issue:
Some animations or transitions may appear choppy on certain devices or when the browser is under heavy load.

### Workarounds:
1. **Reduce Browser Load**:
   - Close unnecessary tabs and applications
   - Avoid running other intensive processes during the demo

2. **Hardware Acceleration**:
   - Ensure hardware acceleration is enabled in browser settings
   - In Chrome: Settings > System > Use hardware acceleration when available

3. **Presentation Mode**:
   - Use browser full-screen mode (F11) for smoother rendering
   - Disable screen savers and power-saving features

## Recovery Procedures

If the application becomes unresponsive or crashes during the presentation:

1. **Quick Refresh**:
   - Press F5 to refresh the browser
   - The application should restore to the last state due to caching

2. **Reset Demo Mode**:
   - Press Ctrl+Shift+D twice to toggle demo mode off and on
   - This will reset the demo controller to its initial state

3. **Backup Video**:
   - If technical issues persist, switch to the backup video recording
   - Have the video file readily accessible on the presentation device

4. **Browser Console**:
   - If needed, open browser developer tools (F12)
   - Check console for specific error messages to guide troubleshooting