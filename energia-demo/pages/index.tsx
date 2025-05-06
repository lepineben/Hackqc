import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
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
  
  // Staggered animations for children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  }
  
  return (
    <Layout title="ÉnergIA - Accueil">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="w-full"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-800 mb-2 font-display">
              Bienvenue sur ÉnergIA
            </h1>
            <p className="text-secondary-600">
              Analysez l'infrastructure électrique et visualisez l'impact futur de la végétation
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="card p-4 md:p-6 mb-6"
          >
            <div className="relative">
              <Map location={location} />
            </div>
            
            <motion.div 
              variants={itemVariants} 
              className="mt-6"
            >
              <InfoPanel location={location} />
            </motion.div>
          </motion.div>
          
          <div className="fixed bottom-0 left-0 right-0 z-10 pb-4 pointer-events-none">
            <div className="max-w-5xl mx-auto px-4">
              <motion.div 
                className="pointer-events-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                <CaptureButton />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}

export default Home