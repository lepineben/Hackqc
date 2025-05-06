import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Loading component to avoid hydration mismatch
const LoadingScreen = dynamic(
  () => import('../components/LoadingScreen'),
  { ssr: false }
)

// Initialize demo mode and caching functions on client-side only
const initializeFunctions = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Dynamically import initialization functions to avoid SSR issues
    const { initializeDemoMode } = await import('../lib/demoMode');
    await initializeDemoMode();
    console.log('App initialized with demo mode and caching');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// Simplified app with minimal initialization
function MyApp({ Component, pageProps }: AppProps) {
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true on client-side
  useEffect(() => {
    setIsClient(true);
    
    // Initialize app functions and demo mode
    initializeFunctions()
      .catch(err => {
        console.error("Error initializing app:", err);
      })
      .finally(() => {
        // Set a timeout to ensure we don't get stuck in loading state
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      });
  }, []);
  
  // Handle loading state
  if (isLoading && isClient) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      {isClient ? <Component {...pageProps} /> : <div />}
    </>
  );
}

export default MyApp