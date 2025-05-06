import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { initializeCache, loadCacheFromStorage } from '../lib/cache'
import { initializeDemoMode } from '../lib/demoMode'

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize cache and demo mode on client side
  useEffect(() => {
    // Load any existing cache from localStorage
    loadCacheFromStorage()
    
    // Initialize cache with pre-cached responses
    initializeCache()
    
    // Initialize demo mode with test images
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      initializeDemoMode()
    }
  }, [])
  
  return <Component {...pageProps} />
}

export default MyApp