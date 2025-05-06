import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import ProcessingAnimation from '../../components/ProcessingAnimation';
import { AnalysisResult } from '../../lib/openai';

// Import components with client-side only rendering
const AnalysisInfoPanel = dynamic(
  () => import('../../components/AnalysisInfoPanel'),
  { ssr: false }
);

// Import our custom SimpleAnnotationView component instead of react-image-annotation
const SimpleAnnotationView = dynamic(
  () => import('../../components/SimpleAnnotationView'),
  { ssr: false }
);

export default function Analysis() {
  const router = useRouter();
  const { imageId, imageKey } = router.query;
  
  const [image, setImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to normalize base64 image data
  const normalizeBase64 = (base64Data: string) => {
    // Ensure base64 data has the correct prefix
    if (!base64Data.startsWith('data:image')) {
      return `data:image/jpeg;base64,${base64Data.replace(/^data:image\/\w+;base64,/, '')}`;
    }
    return base64Data;
  };

  useEffect(() => {
    // Don't proceed until we're mounted on client-side
    if (!isMounted) return;
    
    // Handle either imageKey or legacy imageId (for backward compatibility)
    const getImage = async () => {
      try {
        let imageData: string | null = null;
        
        // First check for imageKey (new method)
        if (imageKey && typeof imageKey === 'string') {
          // Get image from sessionStorage
          imageData = sessionStorage.getItem(decodeURIComponent(imageKey));
          if (!imageData) {
            throw new Error('Image not found in session storage');
          }
        } 
        // Then check for direct imageId (old method, for backward compatibility)
        else if (imageId && typeof imageId === 'string') {
          imageData = decodeURIComponent(imageId);
        }
        
        if (!imageData) {
          throw new Error('No image data available');
        }
        
        // Make sure the image is normalized
        const normalizedImage = normalizeBase64(imageData);
        setImage(normalizedImage);
        
        // Call the analyze API
        setLoading(true);
        const response = await axios.post('/api/analyze-image', { 
          image: normalizedImage
        });
        setAnalysisData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing image:', err);
        setError('Échec de l\'analyse d\'image. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    getImage();
  }, [imageId, imageKey, isMounted]);
  
  const handleFutureVision = () => {
    // If we have an image, store it in sessionStorage for future page
    if (image && isMounted) {
      const futureImageKey = `energia_future_image_${Date.now()}`;
      sessionStorage.setItem(futureImageKey, image);
      router.push('/future?imageKey=' + encodeURIComponent(futureImageKey));
    } 
    // Backward compatibility
    else if (imageId && typeof imageId === 'string') {
      router.push('/future?imageId=' + encodeURIComponent(imageId));
    }
    else if (imageKey && typeof imageKey === 'string') {
      router.push('/future?imageKey=' + encodeURIComponent(imageKey));
    }
  };
  
  const handleAnnotationClick = (id: string) => {
    setActiveAnnotation(activeAnnotation === id ? null : id);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout title="Analyse d'infrastructure - ÉnergIA">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <ProcessingAnimation />
          </div>
        </div>
      </Layout>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Layout title="Erreur - ÉnergIA">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retour
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Main content
  return (
    <Layout title="Analyse d'infrastructure - ÉnergIA">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analyse d'infrastructure</h1>
        
        {isMounted ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image with annotations */}
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              {image && analysisData ? (
                <div className="relative h-full min-h-[400px]">
                  <SimpleAnnotationView
                    image={image}
                    annotations={analysisData.annotations || []}
                    activeAnnotation={activeAnnotation}
                    onAnnotationClick={handleAnnotationClick}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-400">
                  Aucune image disponible
                </div>
              )}
            </div>
            
            {/* Information panel */}
            <div className="w-full md:w-1/3">
              <AnalysisInfoPanel data={analysisData} />
              <button 
                className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors shadow-sm"
                onClick={handleFutureVision}
              >
                VISION FUTUR
              </button>
            </div>
          </div>
        ) : (
          // Simple loading placeholder while client-side code initializes
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-secondary-600">Chargement de l'interface...</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}