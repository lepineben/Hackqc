import Image from 'next/image'
import { useState, useEffect } from 'react'

type ImagePreviewProps = {
  image: string
  onConfirm: () => void
  onRetake: () => void
}

const ImagePreview = ({ image, onConfirm, onRetake }: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [imageValid, setImageValid] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    // Reset zoom level when image changes
    setZoomLevel(1)
    
    // Check if the image is valid by loading it
    const img = new window.Image()
    img.onload = () => {
      setIsLoading(false)
      setImageValid(true)
    }
    img.onerror = () => {
      setIsLoading(false)
      setImageValid(false)
    }
    img.src = image
  }, [image])

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1))
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="animate-pulse bg-gray-200 rounded-lg h-72 md:h-96 flex items-center justify-center">
          <p className="text-gray-500">Chargement de l'image...</p>
        </div>
      </div>
    )
  }

  if (!imageValid) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Image invalide. Veuillez réessayer.</p>
        </div>
        <button
          onClick={onRetake}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-72 md:h-96 overflow-hidden">
          {/* Image with zoom */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={image}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex bg-white bg-opacity-75 rounded-md shadow-md">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Prêt à analyser?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Cette image sera analysée pour détecter les composants d'infrastructure électrique et évaluer la végétation.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onRetake}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Reprendre
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
              >
                Analyser l'image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagePreview