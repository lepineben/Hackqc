import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Layout from '../components/Layout'
import Map from '../components/Map'
import InfoPanel from '../components/InfoPanel'
import CaptureButton from '../components/CaptureButton'
import Head from 'next/head'

const Home: NextPage = () => {
  const [location, setLocation] = useState({ lat: 45.5017, lng: -73.5673 }) // Montreal coordinates
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Simulate page load transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <Layout title="ÉnergIA - Accueil">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bienvenue sur ÉnergIA</h1>
            <p className="text-gray-600">
              Analysez l'infrastructure électrique et visualisez l'impact futur de la végétation
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
            <div className="relative">
              <Map location={location} />
            </div>
            
            <div className="mt-6">
              <InfoPanel location={location} />
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 z-10 pb-4 pointer-events-none">
            <div className="max-w-5xl mx-auto px-4">
              <div className="pointer-events-auto">
                <CaptureButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home