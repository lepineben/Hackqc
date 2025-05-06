import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import Layout from '../../components/Layout'
import ComparisonView from '../../components/ComparisonView'
import FutureInfoPanel from '../../components/FutureInfoPanel'
import ProcessingAnimation from '../../components/ProcessingAnimation'
import { FutureResult } from '../../lib/openai'

export default function Future() {
  const router = useRouter()
  const { imageId } = router.query
  
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [futureImage, setFutureImage] = useState<string | null>(null)
  const [futureData, setFutureData] = useState<FutureResult['analysis'] | null>(null)
  const [viewMode, setViewMode] = useState<'toggle' | 'sideBySide'>('toggle') 
  const [activeView, setActiveView] = useState<'current' | 'future'>('current')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState(0)
  
  useEffect(() => {
    if (!imageId) return
    
    // Set the current image from the URL parameter
    const image = decodeURIComponent(imageId as string)
    setCurrentImage(image)
    
    // Call the generate-future API
    const generateFuture = async () => {
      try {
        setProcessingStep(1)
        
        // Simulate processing steps for better UX
        const timer1 = setTimeout(() => setProcessingStep(2), 1000)
        const timer2 = setTimeout(() => setProcessingStep(3), 2000)
        
        const response = await axios.post('/api/generate-future', { image })
        
        // Clear the timers if the response comes back quickly
        clearTimeout(timer1)
        clearTimeout(timer2)
        
        setProcessingStep(4)
        
        setFutureImage(response.data.futureImage)
        setFutureData(response.data.analysis)
        
        setTimeout(() => {
          setLoading(false)
          setActiveView('future') // Automatically switch to future view when loaded
        }, 500)
      } catch (err) {
        console.error('Error generating future projection:', err)
        setError('Échec de la génération de la projection future. Veuillez réessayer.')
        setLoading(false)
      }
    }
    
    generateFuture()
  }, [imageId])
  
  const toggleView = () => {
    setActiveView(activeView === 'current' ? 'future' : 'current')
  }
  
  const switchViewMode = () => {
    setViewMode(viewMode === 'toggle' ? 'sideBySide' : 'toggle')
  }
  
  const getProcessingMessage = (step: number) => {
    switch (step) {
      case 1:
        return 'Analyse de l\'image en cours...'
      case 2:
        return 'Prédiction de la croissance végétative...'
      case 3:
        return 'Génération de la projection future...'
      case 4:
        return 'Finalisation de l\'analyse...'
      default:
        return 'Traitement en cours...'
    }
  }
  
  const goToHome = () => {
    router.push('/')
  }
  
  const goToAnalysis = () => {
    if (imageId) {
      router.push(`/analysis?imageId=${encodeURIComponent(imageId as string)}`)
    }
  }
  
  return (
    <Layout>
      <Head>
        <title>ÉnergIA - Projection future</title>
        <meta name="description" content="Projection future de la croissance végétative" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <button
            onClick={goToHome}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </button>
          
          <button
            onClick={goToAnalysis}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'analyse
          </button>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Projection de croissance végétative</h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <ProcessingAnimation step={processingStep} totalSteps={4} />
            <p className="mt-4 text-lg font-medium">{getProcessingMessage(processingStep)}</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p className="font-bold">Erreur:</p>
            <p>{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retour
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap gap-2">
                <button 
                  onClick={toggleView}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeView === 'current' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {activeView === 'current' ? 'Voir projection future' : 'Voir état actuel'}
                </button>
                <button 
                  onClick={switchViewMode}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
                >
                  {viewMode === 'toggle' ? 'Vue côte à côte' : 'Vue comparaison'}
                </button>
              </div>
              
              {currentImage && futureImage && (
                <ComparisonView
                  currentImage={currentImage}
                  futureImage={futureImage}
                  viewMode={viewMode}
                  activeView={activeView}
                />
              )}
              
              <div className="mt-4 bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Comment interpréter:</span> Cette simulation montre la croissance potentielle de la végétation sur 5 ans et son impact sur les infrastructures électriques.
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-1/3">
              <FutureInfoPanel 
                data={futureData} 
                viewMode={activeView}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}