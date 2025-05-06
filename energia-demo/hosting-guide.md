# ÉnergIA Local Hosting Guide

This guide outlines how to set up and run the ÉnergIA demo application on a local machine for the Hydro-Québec hackathon presentation.

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15+, or Ubuntu 20.04+
- **CPU**: Intel i5 or equivalent (2.0 GHz+)
- **RAM**: 8GB
- **Storage**: 1GB free space
- **Browser**: Chrome 90+, Edge 90+, Firefox 90+, Safari 14+

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, or Ubuntu 22.04+
- **CPU**: Intel i7 or equivalent (3.0 GHz+)
- **RAM**: 16GB
- **Storage**: 2GB free space
- **Browser**: Chrome 100+, Edge 100+
- **Internet**: Reliable connection (5 Mbps+)

## Development Environment Setup

### Node.js Installation
1. Download and install Node.js (LTS version 16.x or 18.x) from [nodejs.org](https://nodejs.org/)
2. Verify installation:
   ```
   node --version
   npm --version
   ```

### Application Setup
1. Clone or extract the ÉnergIA project
2. Navigate to the project directory:
   ```
   cd /path/to/energia-demo
   ```
3. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
   Note: The `--legacy-peer-deps` flag is necessary due to compatibility issues with react-image-annotation

### Environment Configuration
1. Create a `.env.local` file in the project root:
   ```
   cp .env.example .env.local
   ```
2. Edit `.env.local` to set the required environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_DEMO_MODE=true
   ```

## Running the Application

### Development Mode
1. Start the development server:
   ```
   npm run dev
   ```
2. Access the application at [http://localhost:3000](http://localhost:3000)
3. Changes to the code will automatically reload the application

### Production Mode
1. Build the application:
   ```
   npm run build
   ```
2. Start the production server:
   ```
   npm start
   ```
3. Access the application at [http://localhost:3000](http://localhost:3000)

## Offline Mode Setup

To ensure the application works reliably without internet access:

1. Start the application with internet access
2. Enable demo mode (Ctrl+Shift+D)
3. Navigate through all scenarios to cache the demo images
4. Verify offline capability by disconnecting from internet and refreshing the page
5. Confirm all demo scenarios still work

## Multi-device Access

If you need to access the application from multiple devices on the same network:

1. Find your computer's local IP address:
   - Windows: Open Command Prompt and type `ipconfig`
   - macOS: Open System Preferences > Network
   - Linux: Open Terminal and type `ip addr show`

2. Start the server with the host flag:
   ```
   npm run dev -- -H 0.0.0.0
   ```
   or for production:
   ```
   npm start -- -H 0.0.0.0
   ```

3. Access from other devices using:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

## Performance Optimization

For optimal performance during the presentation:

1. Restart your computer before the presentation
2. Close all unnecessary applications
3. Disable automatic updates and virus scans during the demo
4. Use a wired internet connection if possible
5. Turn off power-saving features and screen savers
6. Set the browser to full screen mode (F11)
7. Pre-warm the application by navigating through all pages

## Backup Options

### Backup Installation
1. Create a complete copy of the working application on a USB drive
2. Include node_modules directory to avoid needing internet for installation
3. Test the backup copy on a different machine before the presentation

### Local Backup Server
For mission-critical presentations, consider running two instances:
1. Primary instance on the presentation laptop
2. Secondary instance on another device on the same network
3. If primary fails, quickly switch to the secondary

## Troubleshooting

### Port Already in Use
```
Error: Port 3000 is already in use
```
Solution:
```
npx kill-port 3000
npm run dev
```

### Missing Dependencies
```
Error: Cannot find module '...'
```
Solution:
```
rm -rf node_modules
npm install --legacy-peer-deps
```

### White Screen or Blank Page
Solution:
1. Check the browser console for errors
2. Try a different browser
3. Clear browser cache and reload

### Network Issues
If the application can't connect to the OpenAI API:
1. Verify internet connection
2. Confirm API key is correctly set in .env.local
3. Enable demo mode for offline operation