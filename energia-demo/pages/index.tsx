import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Layout from '../components/Layout'
import InfoPanel from '../components/InfoPanel'

// Import Map component with client-side only rendering
const Map = dynamic(() => import('../components/Map'), { ssr: false })

const Home: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false)
  
  // Only render client-specific components after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Default location (Montreal)
  const defaultLocation = {
    lat: 45.50170,
    lng: -73.56730
  }
  
  return (
    <Layout title="ÉnergIA - Accueil">
      <div className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-800 mb-2 font-display">
            Bienvenue sur ÉnergIA
          </h1>
          <p className="text-secondary-600 max-w-2xl">
            Analysez l'infrastructure électrique et visualisez l'impact futur de la végétation
          </p>
        </motion.div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mb-6">
          {isMounted ? (
            <Map location={defaultLocation} />
          ) : (
            <div className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          )}
          
          <div className="mt-6">
            <h2 className="text-xl font-bold text-secondary-800 mb-4">
              Information sur la zone
            </h2>
            
            {isMounted ? (
              <InfoPanel location={{
                name: "Montréal - Centre-Ville",
                coordinates: defaultLocation,
                status: "normal",
                vegetation: 35
              }} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                <div className="bg-gray-100 h-20 rounded-md"></div>
                <div className="bg-gray-100 h-20 rounded-md"></div>
              </div>
            )}
          </div>
        </div>

        <motion.div 
          className="fixed bottom-8 inset-x-0 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Link href="/capture" 
            className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Capture d'image
          </Link>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Home