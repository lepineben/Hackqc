import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import AnalysisInfoPanel from '../../components/AnalysisInfoPanel';
import ProcessingAnimation from '../../components/ProcessingAnimation';
import { AnalysisResult } from '../../lib/openai';

// Import react-image-annotation with dynamic import to prevent SSR issues
const Annotation = dynamic(
  () => import('react-image-annotation').then(mod => mod.default),
  { ssr: false }
);

export default function Analysis() {
  const router = useRouter();
  const { imageId } = router.query;
  
  const [image, setImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId || typeof imageId !== 'string') return;
    
    // Set the image from the URL parameter
    setImage(decodeURIComponent(imageId));
    
    // Call the analyze API
    const analyzeImage = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/analyze-image', { 
          image: decodeURIComponent(imageId) 
        });
        setAnalysisData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error analyzing image:', err);
        setError('Échec de l\'analyse d\'image. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    analyzeImage();
  }, [imageId]);
  
  const handleFutureVision = () => {
    if (!imageId) return;
    router.push('/future?imageId=' + encodeURIComponent(imageId as string));
  };
  
  const handleAnnotationClick = (id: string) => {
    setActiveAnnotation(activeAnnotation === id ? null : id);
  };
  
  // Custom renderer for annotations to add interactive elements
  const renderContent = ({ annotation }: { annotation: any }) => {
    const isActive = activeAnnotation === annotation.id;
    return (
      <div 
        className={`annotation-label px-2 py-1 text-xs font-medium rounded ${
          isActive ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-300'
        }`}
        onClick={() => handleAnnotationClick(annotation.id)}
      >
        {annotation.data.label}
      </div>
    );
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
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image with annotations */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
            {image && analysisData ? (
              <div className="relative h-full min-h-[400px]">
                <Annotation
                  src={image}
                  annotations={analysisData.annotations || []}
                  type="rectangle"
                  renderContent={renderContent}
                  disableAnnotation={true}
                  disableSelector={true}
                  disableEditor={true}
                  activeAnnotationComparator={(a: any, b: any) => a.id === b}
                  activeAnnotations={activeAnnotation ? [activeAnnotation] : []}
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
      </div>
    </Layout>
  );
}