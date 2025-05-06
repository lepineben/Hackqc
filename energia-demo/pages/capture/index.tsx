import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../../components/Layout'
import UploadArea from '../../components/UploadArea'
import ImagePreview from '../../components/ImagePreview'
import ProcessingAnimation from '../../components/ProcessingAnimation'
import { Alert, Button } from '../../components/ui'

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  }
  
  return (
    <Layout title="Capture Image - ÉnergIA">
      <div className="container mx-auto p-4 min-h-[80vh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-800 mb-2 font-display">
            Capture d'infrastructure
          </h1>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Prenez une photo de l'infrastructure électrique pour l'analyser ou téléchargez une image existante
          </p>
        </motion.div>
        
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <Alert 
                type="error" 
                title="Erreur" 
                onDismiss={() => setHasError(false)}
              >
                {errorMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div 
              key="capture"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col"
            >
              <motion.div variants={itemVariants} className="flex justify-center mb-6 space-x-4">
                <Button 
                  variant={captureMethod === 'camera' ? 'primary' : 'secondary'}
                  onClick={() => setCaptureMethod('camera')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Utiliser la caméra
                </Button>
                <Button 
                  variant={captureMethod === 'upload' ? 'primary' : 'secondary'}
                  onClick={() => setCaptureMethod('upload')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Télécharger une image
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {captureMethod === 'camera' ? (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="webcam-container w-full max-w-2xl mx-auto text-center"
                    >
                      <div className="card p-4 md:p-6 mb-4 overflow-hidden">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            facingMode: "environment"
                          }}
                          onUserMediaError={handleCameraError}
                          className="w-full rounded-lg mb-4 max-h-[60vh] object-contain mx-auto"
                        />
                      </div>
                      <Button 
                        variant="primary"
                        size="lg"
                        onClick={captureImage}
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        }
                      >
                        Prendre une photo
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full max-w-2xl"
                    >
                      <UploadArea onFileUpload={handleFileUpload} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex items-center justify-center"
            >
              <ProcessingAnimation />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex items-center justify-center"
            >
              <ImagePreview 
                image={image} 
                onConfirm={confirmImage} 
                onRetake={() => setImage(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}