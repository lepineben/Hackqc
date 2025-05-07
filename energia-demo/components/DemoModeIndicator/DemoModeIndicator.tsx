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
  
  // Always return null to hide the demo mode indicator completely
  return null;
};

export default DemoModeIndicator;