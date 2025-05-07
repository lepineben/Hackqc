#!/bin/bash
# Script to toggle between demo mode and live API mode

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Error: .env.local not found!"
  exit 1
fi

# Check if we're currently in demo mode
if grep -q "NEXT_PUBLIC_DEMO_MODE=true" .env.local; then
  # Currently in demo mode, switch to live mode
  echo "Switching from DEMO mode to LIVE mode..."
  
  # Create a backup of current demo config
  cp .env.local .env.local.demo
  
  # Update the environment file
  sed -i '' 's/NEXT_PUBLIC_DEMO_MODE=true/NEXT_PUBLIC_DEMO_MODE=false/g' .env.local
  echo "LIVE mode activated! The app will now use real API calls."
  echo "To switch back to demo mode, run this script again."
  
else
  # Currently in live mode, switch to demo mode
  echo "Switching from LIVE mode to DEMO mode..."
  
  # Create a backup of current live config
  cp .env.local .env.local.live
  
  # Update the environment file
  sed -i '' 's/NEXT_PUBLIC_DEMO_MODE=false/NEXT_PUBLIC_DEMO_MODE=true/g' .env.local
  echo "DEMO mode activated! The app will now use pre-cached data."
  echo "To switch back to live mode, run this script again."
fi

echo "⚠️  You may need to restart the development server for changes to take effect."
echo "    Press Ctrl+C to stop the server and run 'npm run dev' again."