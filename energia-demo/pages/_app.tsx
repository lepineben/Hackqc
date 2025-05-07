import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import Head from 'next/head'

// Ultra-simplified app initialization to avoid any loading issues
function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true on client-side
  useEffect(() => {
    setIsClient(true);
    
    // Simplified initialization - no async loading
    console.log('App initialized');
  }, []);
  
  // Just render immediately
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      {isClient ? <Component {...pageProps} /> : null}
    </>
  );
}

export default MyApp