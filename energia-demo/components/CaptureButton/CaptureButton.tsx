import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Image from 'next/image'

type CaptureButtonProps = {
  onClick?: () => void
}

const CaptureButton = ({ onClick }: CaptureButtonProps) => {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  
  useEffect(() => {
    // Animate the button entrance after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  const handleClick = () => {
    setIsPressed(true)
    
    // Add a short delay for the button animation effect
    setTimeout(() => {
      if (onClick) {
        onClick()
      } else {
        router.push('/capture')
      }
    }, 150)
  }
  
  return (
    <div className="fixed bottom-8 md:bottom-12 inset-x-0 flex justify-center z-50">
      <div
        className={`relative transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-12'
        }`}
      >
        {/* Pulse animation */}
        <div
          className={`absolute -inset-4 rounded-full bg-blue-400 opacity-30 transition-transform duration-300 ${
            isHovered ? 'animate-ping' : ''
          }`}
          style={{ animationDuration: '2s' }}
        ></div>
        
        {/* Shadow effect */}
        <div
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 blur-md transition-all duration-300"
          style={{ 
            opacity: isHovered ? 0.8 : 0.5,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        ></div>
        
        {/* Main button */}
        <button 
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            setIsPressed(false)
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className={`relative bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-10 md:py-5 md:px-12 rounded-full text-xl md:text-2xl shadow-lg transition-all duration-300 ${
            isPressed 
              ? 'transform scale-95 shadow-inner from-blue-700 to-blue-800' 
              : isHovered 
                ? 'transform scale-105 shadow-xl from-blue-500 to-blue-600' 
                : ''
          }`}
        >
          <div className="flex items-center justify-center">
            <span className="mr-2">CAPTURE</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}

export default CaptureButton