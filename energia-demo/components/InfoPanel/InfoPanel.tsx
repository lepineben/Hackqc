import { useState, useEffect } from 'react'

type LocationData = {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: string;
  vegetation: number;
}

type InfoPanelProps = {
  location: LocationData;
}

interface ZoneInfo {
  name: string
  type: string
  vegetation: string
  risk: string
  lastInspection: string
  nextInspection: string
  infrastructureCount: number
  maintenanceStatus: 'good' | 'warning' | 'critical'
}

const getColorByStatus = (status: string) => {
  switch(status) {
    case 'good': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

const InfoPanel = ({ location }: InfoPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo>({
    name: location.name || "Montréal - Centre-Ville",
    type: "Urbaine",
    vegetation: location.vegetation > 60 ? "Élevée" : location.vegetation > 30 ? "Moyenne" : "Faible",
    risk: location.vegetation > 60 ? "Élevé" : location.vegetation > 30 ? "Moyen" : "Faible",
    lastInspection: "15 jan. 2024",
    nextInspection: "15 jan. 2025",
    infrastructureCount: 8,
    maintenanceStatus: location.status === "critical" ? "critical" : 
                       location.status === "warning" ? "warning" : "good"
  });
  
  // Simulate data loading when location changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, [location]);
  
  return (
    <div 
      className={`bg-white p-5 rounded-lg shadow-lg mb-4 transition-all duration-500 border border-gray-100 ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-800">Information sur la zone</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getColorByStatus(zoneInfo.maintenanceStatus)}`}>
          {zoneInfo.maintenanceStatus === 'good' && 'État: Bon'}
          {zoneInfo.maintenanceStatus === 'warning' && 'État: À surveiller'}
          {zoneInfo.maintenanceStatus === 'critical' && 'État: Critique'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-sm font-medium text-gray-600">Zone</p>
          <p className="font-semibold">{zoneInfo.name}</p>
          <p className="text-xs text-gray-500 mt-1">Type: {zoneInfo.type}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-sm font-medium text-gray-600">Coordonnées</p>
          <p className="font-mono text-sm">{location.coordinates.lat.toFixed(5)}, {location.coordinates.lng.toFixed(5)}</p>
          <p className="text-xs text-gray-500 mt-1">Région: Québec, Canada</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-sm font-medium text-gray-600">Végétation</p>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: zoneInfo.vegetation === 'Faible' ? '30%' : zoneInfo.vegetation === 'Moyenne' ? '60%' : '90%' }}
              ></div>
            </div>
            <span className="ml-2 text-sm">{zoneInfo.vegetation}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Niveau de risque: {zoneInfo.risk}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="text-sm font-medium text-gray-600">Inspections</p>
          <p className="text-sm">Dernière: <span className="font-medium">{zoneInfo.lastInspection}</span></p>
          <p className="text-sm">Prochaine: <span className="font-medium">{zoneInfo.nextInspection}</span></p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm">
            <span className="font-medium">Infrastructures:</span> {zoneInfo.infrastructureCount} équipements 
            détectés dans cette zone
          </p>
          <button className="text-blue-600 text-sm hover:text-blue-800 transition-colors">
            Voir tout
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel