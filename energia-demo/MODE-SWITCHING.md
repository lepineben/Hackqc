# ÉnergIA Demo - Mode Switching Guide

This application can run in two different modes:

## Demo Mode
- Uses pre-cached demo data and images
- Does not require an OpenAI API key
- Works offline and is reliable for presentations
- Indicated by "DEMO" badge in the header

## Live API Mode
- Makes real API calls to OpenAI
- Requires a valid OpenAI API key
- Provides real analysis of uploaded or captured images
- Indicated by "LIVE API" badge in the header

## Switching Between Modes

### Option 1: Using the Toggle Script (Recommended)
```bash
# Run the toggle script to switch between modes
./toggle-mode.sh
```

This script will:
1. Check which mode you're currently in
2. Switch to the other mode
3. Create a backup of your previous configuration
4. Notify you that you need to restart the server

### Option 2: Manual Switching
1. Edit the `.env.local` file
2. Change `NEXT_PUBLIC_DEMO_MODE` to either `true` or `false`
3. Restart the development server

## API Key Configuration

When running in Live API mode, you need a valid OpenAI API key with access to:
- GPT-4o (for vision analysis)
- GPT-image-1 (for image generation)

The API key should be set in `.env.local`:
```
OPENAI_API_KEY=your_key_here
```

## Troubleshooting

### Stuck Loading Screen
If the app gets stuck on a loading screen:
1. Switch to demo mode using `./toggle-mode.sh`
2. Restart the development server
3. Once the app is working in demo mode, you can try switching back

### Missing API Key Error
If you see errors about a missing API key:
1. Make sure you've set a valid key in `.env.local`
2. Check that you've restarted the server after changing the key
3. Verify your OpenAI account has access to the required models