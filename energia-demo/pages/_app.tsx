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
    
    // Always initialize demo mode to set up keyboard shortcuts
    // Demo mode will only activate fully if it's enabled in the config
    // or if triggered manually by the user
    initializeDemoMode()
  }, [])
  
  return <Component {...pageProps} />
}

export default MyApp