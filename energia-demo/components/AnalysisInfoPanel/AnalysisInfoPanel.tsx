import { useState } from 'react';
import { AnalysisResult, OpenAIComponent } from '../../lib/openai';

interface AnalysisInfoPanelProps {
  data: AnalysisResult | null;
}

const AnalysisInfoPanel: React.FC<AnalysisInfoPanelProps> = ({ data }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  if (!data || !data.components || data.components.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Analyse d'infrastructure</h2>
        <p className="text-gray-600">Aucune donnée d'analyse disponible.</p>
      </div>
    );
  }
  
  const getComponentById = (id: string): OpenAIComponent | undefined => {
    const index = parseInt(id) - 1;
    return data.components[index];
  };
  
  const selectedDetails = selectedComponent 
    ? getComponentById(selectedComponent)
    : null;
  
  // Helper function to render confidence bar
  const renderConfidence = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const getColorClass = () => {
      if (percentage >= 90) return 'bg-green-500';
      if (percentage >= 70) return 'bg-yellow-500';
      return 'bg-red-500';
    };
    
    return (
      <div className="mt-1">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Confiance</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getColorClass()}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Helper function to render risk level indicator
  const renderRiskIndicator = (risk: string) => {
    const riskText = risk.toLowerCase();
    let colorClass = 'bg-green-100 text-green-800';
    
    if (riskText.includes('élevé') || riskText.includes('imminent') || riskText.includes('critique')) {
      colorClass = 'bg-red-100 text-red-800';
    } else if (riskText.includes('moyen') || riskText.includes('modéré') || riskText.includes('attent')) {
      colorClass = 'bg-yellow-100 text-yellow-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {risk || 'Aucun risque identifié'}
      </span>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Analyse d'infrastructure</h2>
      
      {/* Components List */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Composants détectés</h3>
        <div className="space-y-2">
          {data.components.map((component, index) => (
            <div 
              key={index}
              className={`p-3 rounded-md border border-gray-200 cursor-pointer transition-all duration-200 ${
                selectedComponent === (index + 1).toString() 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedComponent((index + 1).toString())}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-800">{component.type}</h4>
                {renderRiskIndicator(component.risks)}
              </div>
              {renderConfidence(component.confidence)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected Component Details */}
      {selectedDetails && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium text-gray-700 mb-3">Détails du composant</h3>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Type</h4>
              <p className="text-gray-800">{selectedDetails.type}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Détails</h4>
              <p className="text-gray-800">{selectedDetails.details}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">État</h4>
              <p className="text-gray-800">{selectedDetails.condition}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Risques liés à la végétation</h4>
              <p className="text-gray-800">{selectedDetails.risks}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Educational Content */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Information éducative</h3>
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">Saviez-vous que?</span> La végétation est responsable de près de 40% des pannes d'électricité au Québec.
          </p>
          <p className="text-sm text-gray-700">
            Une surveillance régulière et un entretien préventif peuvent réduire significativement les risques d'interruption de service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisInfoPanel;