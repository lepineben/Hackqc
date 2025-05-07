import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../../components/Layout'
import UploadArea from '../../components/UploadArea'
import ImagePreview from '../../components/ImagePreview'
import ProcessingAnimation from '../../components/ProcessingAnimation'
import { Alert, Button } from '../../components/ui'

// Import Webcam directly to prevent ref issues
import Webcam from 'react-webcam';

export default function Capture() {
  const router = useRouter()
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera')
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isWebcamReady, setIsWebcamReady] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  
  // Only render client-specific components after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
          setImage(imageSrc)
          setHasError(false)
        } else {
          throw new Error('Failed to capture image')
        }
      } catch (err) {
        console.error('Error capturing image:', err)
        setHasError(true)
        setErrorMessage('Failed to capture image. Please try again or use file upload.')
      }
    } else {
      setHasError(true)
      setErrorMessage('Webcam not initialized. Please try again or use file upload.')
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
  
  // Helper function to normalize base64 image data
  const normalizeBase64 = (base64Data: string) => {
    // Ensure base64 data has the correct prefix
    if (!base64Data.startsWith('data:image')) {
      return `data:image/jpeg;base64,${base64Data.replace(/^data:image\/\w+;base64,/, '')}`;
    }
    return base64Data;
  }

  // Helper function to compress large images
  const compressImage = (base64Image: string, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Only compress if the image is larger than maxWidth
        if (img.width <= maxWidth) {
          resolve(base64Image);
          return;
        }
        
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          // Fallback if context cannot be created
          resolve(base64Image);
        }
      };
      img.onerror = () => {
        // Fallback if image fails to load
        resolve(base64Image);
      }
      img.src = base64Image;
    });
  }

  const confirmImage = async () => {
    setIsProcessing(true)
    
    try {
      // Process the image before sending to analysis
      if (image) {
        // Normalize and compress the image
        const normalizedImage = normalizeBase64(image);
        const compressedImage = await compressImage(normalizedImage);
        
        // EMERGENCY FIX: Don't use sessionStorage, use a flag to indicate demo mode
        try {
          // Try to store in sessionStorage but handle quota errors
          const imageKey = `energia_image_${Date.now()}`;
          sessionStorage.setItem(imageKey, compressedImage);
          
          // Redirect to analysis page with the image key
          // We'll use a timeout to simulate processing time
          setTimeout(() => {
            router.push(`/analysis?imageKey=${encodeURIComponent(imageKey)}`);
          }, 3000);
        } catch (storageError) {
          console.warn("Storage error, falling back to demo mode:", storageError);
          
          // FALLBACK: Use direct navigation to analysis with demo mode flag
          setTimeout(() => {
            // Use a special mode parameter to indicate we want demo mode
            router.push(`/analysis?demoMode=true`);
          }, 3000);
        }
      } else {
        throw new Error('No image available');
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setIsProcessing(false);
      setHasError(true);
      setErrorMessage('Error processing image. Please try again.');
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
        {/* Removed the test buttons since the main flow is working now */}
        
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
        
        {/* Only render the main content after client-side hydration */}
        {isMounted ? (
          <>
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
                            {isMounted && (
                              <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                  facingMode: "environment"
                                }}
                                onUserMedia={() => {
                                  console.log("Webcam ready!");
                                  setIsWebcamReady(true);
                                }}
                                onUserMediaError={handleCameraError}
                                className="w-full rounded-lg mb-4 max-h-[60vh] object-contain mx-auto"
                              />
                            )}
                          </div>
                          <Button 
                            variant="primary"
                            size="lg"
                            onClick={captureImage}
                            disabled={!isWebcamReady}
                            icon={
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            }
                          >
                            {isWebcamReady ? 'Prendre une photo' : 'Chargement de la caméra...'}
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
          </>
        ) : (
          // Simple loading placeholder while client-side code initializes
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-secondary-600">Chargement de l'interface...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}