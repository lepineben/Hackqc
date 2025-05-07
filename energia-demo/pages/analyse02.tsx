import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function DirectAnalysis() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Hardcoded data specifically for the 02.jpg image
  const components = [
    {
      type: 'Pylône de transmission',
      confidence: 0.97,
      details: 'Structure métallique, ligne haute tension 120kV',
      condition: 'Excellent état, peinture récente',
      risks: 'Végétation dense au pied du pylône, attention à la croissance rapide'
    },
    {
      type: 'Lignes haute tension',
      confidence: 0.94,
      details: 'Câbles conducteurs en aluminium, 120kV',
      condition: 'Bon état général, aucun dommage visible',
      risks: 'Corridor de passage étroit, arbres à proximité des limites de sécurité'
    },
    {
      type: 'Isolateurs',
      confidence: 0.91,
      details: 'Isolateurs en porcelaine, chaînes multiples',
      condition: 'État correct, légère usure visible',
      risks: 'Aucun risque lié à la végétation'
    }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleFutureVision = () => {
    router.push('/future');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-lg font-medium">Analyse en cours...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-6"
          >
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-full min-h-[400px]">
                <img
                  src="/demo-images/02_boxes.jpg"
                  alt="Analyse d'infrastructure"
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Composants détectés</h2>
                
                <div className="space-y-3">
                  {components.map((component, idx) => (
                    <motion.div 
                      key={idx} 
                      className="border-b border-gray-100 pb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-800">{component.type}</h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {Math.round(component.confidence * 100)}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{component.details}</p>
                      
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">État</div>
                        <div className="text-sm">{component.condition}</div>
                      </div>
                      
                      <div className="mt-1">
                        <div className="text-xs text-gray-500">Risques</div>
                        <div className="text-sm">{component.risks}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <motion.button 
                className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors shadow-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFutureVision}
              >
                VISION FUTUR
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}