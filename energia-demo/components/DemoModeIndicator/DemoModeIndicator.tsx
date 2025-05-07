import React, { useState, useEffect } from 'react';
// Import just the types and functions we need, not the whole module
// This prevents any server-only code from being imported on the client
import { 
  getDemoStatus, 
  DEMO_SCENARIOS, 
  changeScenario, 
  deactivateDemoMode 
} from '../../lib/demoMode';

interface DemoModeIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ 
  position = 'bottom-right' 
}) => {
  const [demoActive, setDemoActive] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [scenarios, setScenarios] = useState<Array<{id: string, name: string}>>([]);
  
  // Position classes
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };
  
  // Check if demo mode is active
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const checkDemoStatus = () => {
      const { enabled, scenario } = getDemoStatus();
      setDemoActive(enabled);
      
      if (enabled && DEMO_SCENARIOS[scenario]) {
        setScenarioName(DEMO_SCENARIOS[scenario].name);
      }
    };
    
    // Process scenario list
    const scenarioList = Object.entries(DEMO_SCENARIOS).map(([id, data]) => ({
      id,
      name: data.name
    }));
    setScenarios(scenarioList);
    
    // Initial check
    checkDemoStatus();
    
    // Set up an interval to check periodically (for keyboard shortcut changes)
    const interval = setInterval(checkDemoStatus, 1000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Only render if demo mode is active
  if (!demoActive) return null;
  
  // Handle scenario change
  const handleScenarioChange = (scenarioId: string) => {
    changeScenario(scenarioId);
    setExpanded(false);
  };
  
  // Handle demo mode deactivation
  const handleDeactivate = () => {
    deactivateDemoMode();
  };
  
  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-amber-600 text-white rounded-lg shadow-lg transition-all duration-300 ${expanded ? 'w-56 p-3' : 'w-auto p-2'}`}
    >
      {/* Collapsed mode - just show indicator */}
      {!expanded ? (
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="h-3 w-3 rounded-full bg-white mr-2 animate-pulse"></div>
          <div>Demo Mode: {scenarioName}</div>
        </div>
      ) : (
        /* Expanded mode - show controls */
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Demo Mode Controls</h4>
            <button 
              className="text-white hover:text-amber-200"
              onClick={() => setExpanded(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">Current Scenario:</div>
            <select 
              value={scenarioName}
              onChange={(e) => {
                const scenario = scenarios.find(s => s.name === e.target.value);
                if (scenario) handleScenarioChange(scenario.id);
              }}
              className="w-full px-2 py-1 bg-amber-700 text-white rounded border border-amber-400"
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.name}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-2 border-t border-amber-500 flex justify-between">
            <button
              onClick={handleDeactivate}
              className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded text-sm"
            >
              Exit Demo Mode
            </button>
            
            <button
              onClick={() => setExpanded(false)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoModeIndicator;