import { useState, useEffect } from 'react'

type ProcessingAnimationProps = {
  step?: number;
  totalSteps?: number;
  customSteps?: string[];
  autoProgress?: boolean;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  step = 0,
  totalSteps = 5,
  customSteps,
  autoProgress = true
}) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(step)
  
  const defaultSteps = [
    'Analyse des composants électriques...',
    'Détection des caractéristiques de végétation...',
    'Évaluation de l\'état des infrastructures...',
    'Calcul de la densité de végétation...',
    'Préparation de l\'analyse détaillée...'
  ]
  
  const steps = customSteps || defaultSteps

  // Update progress when step changes externally
  useEffect(() => {
    if (!autoProgress) {
      setCurrentStep(step)
      // Calculate progress based on current step
      const progressValue = (step / (totalSteps - 1)) * 100
      setProgress(progressValue)
    }
  }, [step, totalSteps, autoProgress])
  
  useEffect(() => {
    if (!autoProgress) return
    
    // Simulate a longer processing time with steps
    const totalDuration = 7000 // 7 seconds total
    const incrementInterval = 70 // Update progress every 70ms
    const totalIncrements = totalDuration / incrementInterval
    const progressPerIncrement = 100 / totalIncrements
    
    // Each step takes equal percentage of the total duration
    const stepsCount = steps.length
    const progressPerStep = 100 / stepsCount
    
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = Math.min(prevProgress + progressPerIncrement, 100)
        
        // Update current step based on progress
        const stepIndex = Math.min(
          Math.floor(newProgress / progressPerStep),
          stepsCount - 1
        )
        
        setCurrentStep(stepIndex)
        
        return newProgress
      })
    }, incrementInterval)

    return () => clearInterval(interval)
  }, [steps.length, autoProgress])

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="mb-6">
        <svg 
          className="animate-spin h-16 w-16 text-blue-600 mx-auto" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Traitement de votre image
      </h3>
      
      <div className="mb-4">
        <p className="text-blue-600 font-medium mb-2">
          {steps[currentStep]}
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {Math.round(progress)}% complété
        </p>
      </div>
      
      <p className="text-sm text-gray-600">
        Veuillez patienter pendant l'analyse de votre image. Cela peut prendre quelques instants.
      </p>
      
      {/* Visual elements representing analysis */}
      <div className="mt-8 flex justify-center space-x-6">
        {[0, 1, 2].map((index) => (
          <div 
            key={index}
            className={`w-12 h-12 rounded-md border-2 transition-all duration-500 ease-in-out ${
              progress > (index + 1) * 30 
                ? 'border-blue-500 bg-blue-100 scale-110' 
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className={`
              h-full flex items-center justify-center
              transition-opacity duration-500
              ${progress > (index + 1) * 30 ? 'opacity-100' : 'opacity-30'}
            `}>
              {index === 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              )}
              {index === 1 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {index === 2 && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProcessingAnimation