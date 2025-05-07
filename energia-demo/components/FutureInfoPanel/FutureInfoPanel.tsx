import React from 'react';
import { FutureAnalysis } from '../../lib/openai';

type RiskLevel = 'Élevé' | 'Très élevé' | 'Moyen' | 'Faible' | 'Critique' | 'Très faible';

type RiskColorMap = {
  [key in RiskLevel]: string;
};

type FutureInfoPanelProps = {
  data: FutureAnalysis | null;
  viewMode: 'current' | 'future';
};

const FutureInfoPanel: React.FC<FutureInfoPanelProps> = ({ data, viewMode }) => {
  if (!data) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Analyse indisponible</h2>
        <p>Les données d'analyse ne sont pas disponibles pour le moment.</p>
      </div>
    );
  }

  // Risk level color mapping
  const riskColors: RiskColorMap = {
    'Très élevé': 'bg-red-700',
    'Critique': 'bg-red-600',
    'Élevé': 'bg-red-500',
    'Moyen': 'bg-yellow-500',
    'Faible': 'bg-green-500',
    'Très faible': 'bg-green-700'
  };

  // Get color class based on risk level
  const getRiskColorClass = (risk: string): string => {
    return riskColors[risk as RiskLevel] || 'bg-gray-500';
  };

  if (viewMode === 'current') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="bg-green-100 rounded-md p-3 mb-4">
          <h2 className="text-xl font-bold text-green-800">État actuel</h2>
          <p className="text-sm text-green-700">
            Basculez vers la vue future pour voir la projection de la croissance végétative
            et les risques potentiels dans 5 ans.
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Mesures recommandées</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Effectuer une inspection régulière</li>
            <li>Mettre en place un plan d'entretien</li>
            <li>Documenter l'état actuel pour référence future</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="bg-amber-100 rounded-md p-3 mb-4">
        <h2 className="text-xl font-bold text-amber-800">Projection future</h2>
        <p className="text-sm text-amber-700">
          Projection estimée pour <span className="font-bold">{data.projectionDate}</span>
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Croissance végétative</h3>
        <div className="bg-gray-100 p-3 rounded-md">
          <p className="text-sm">{data.vegetationGrowth}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Risques potentiels</h3>
        <div className="space-y-3">
          {data.potentialIssues.map((issue, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{issue.component}</span>
                <span className={`text-xs text-white px-2 py-1 rounded-full ${getRiskColorClass(issue.risk)}`}>
                  {issue.risk}
                </span>
              </div>
              <p className="text-sm text-gray-700">{issue.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Recommandations</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          {data.recommendations.map((recommendation, index) => (
            <li key={index} className="text-gray-700">{recommendation}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Note:</p>
          <p>Cette projection est basée sur les taux de croissance moyens des espèces végétales identifiées et les conditions climatiques typiques de la région.</p>
        </div>
      </div>
    </div>
  );
};

export default FutureInfoPanel;