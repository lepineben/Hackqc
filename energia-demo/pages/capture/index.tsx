import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Webcam from 'react-webcam'
import Layout from '../../components/Layout'
import UploadArea from '../../components/UploadArea'
import ImagePreview from '../../components/ImagePreview'
import ProcessingAnimation from '../../components/ProcessingAnimation'

export default function Capture() {
  const router = useRouter()
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera')
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const webcamRef = useRef<Webcam>(null)
  
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setImage(imageSrc)
      setHasError(false)
    } else {
      setHasError(true)
      setErrorMessage('Could not access webcam. Please try again or use file upload.')
    }
  }, [webcamRef])
  
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string)
        setHasError(false)
      }
    }
    reader.onerror = () => {
      setHasError(true)
      setErrorMessage('Failed to read the file. Please try a different one.')
    }
    reader.readAsDataURL(file)
  }
  
  const confirmImage = async () => {
    setIsProcessing(true)
    
    try {
      // In a real implementation, we would send the image to the server here
      // For the demo, we'll use a timeout to simulate processing time
      setTimeout(() => {
        // Add the image to URL to preserve across page navigation
        // In a real implementation, we would store the image in server or use an ID
        router.push('/analysis?imageId=' + encodeURIComponent(image || ''))
      }, 3000)
    } catch (error) {
      setIsProcessing(false)
      setHasError(true)
      setErrorMessage('Error processing image. Please try again.')
    }
  }
  
  const handleCameraError = useCallback(() => {
    setCaptureMethod('upload')
    setHasError(true)
    setErrorMessage('Camera access denied or not available. Please use file upload instead.')
  }, [])
  
  return (
    <Layout title="Capture Image - ÉnergIA">
      <div className="container mx-auto p-4 min-h-screen flex flex-col">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Capture Electrical Infrastructure Image
        </h1>
        
        {hasError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        
        {!image ? (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-center mb-4 space-x-4">
              <button 
                onClick={() => setCaptureMethod('camera')}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                  captureMethod === 'camera' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                Use Camera
              </button>
              <button 
                onClick={() => setCaptureMethod('upload')}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                  captureMethod === 'upload' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                Upload Image
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              {captureMethod === 'camera' ? (
                <div className="webcam-container w-full max-w-2xl mx-auto text-center">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "environment"
                    }}
                    onUserMediaError={handleCameraError}
                    className="w-full rounded-lg shadow-lg mb-4 max-h-[60vh] object-contain mx-auto"
                  />
                  <button 
                    onClick={captureImage}
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors"
                  >
                    Take Photo
                  </button>
                </div>
              ) : (
                <UploadArea onFileUpload={handleFileUpload} />
              )}
            </div>
          </div>
        ) : isProcessing ? (
          <div className="flex-1 flex items-center justify-center">
            <ProcessingAnimation />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <ImagePreview 
              image={image} 
              onConfirm={confirmImage} 
              onRetake={() => setImage(null)} 
            />
          </div>
        )}
      </div>
    </Layout>
  )
}