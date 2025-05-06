import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="relative"
          >
            {/* Pulse animation */}
            <motion.div
              animate={{ 
                scale: isHovered ? [1, 1.5, 1] : 1,
                opacity: isHovered ? [0.3, 0.2, 0.3] : 0.3
              }}
              transition={{ 
                duration: 2, 
                repeat: isHovered ? Infinity : 0,
                repeatType: "loop"
              }}
              className="absolute -inset-4 rounded-full bg-primary-400 opacity-30"
            ></motion.div>
            
            {/* Shadow effect */}
            <motion.div
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                opacity: isHovered ? 0.8 : 0.5
              }}
              transition={{ duration: 0.3 }}
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 blur-md"
            ></motion.div>
            
            {/* Main button */}
            <motion.button 
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
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className={`relative bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-10 md:py-5 md:px-12 rounded-full text-xl md:text-2xl shadow-lg ${
                isPressed 
                  ? 'shadow-inner from-primary-700 to-primary-800' 
                  : isHovered 
                    ? 'shadow-xl from-primary-500 to-primary-600' 
                    : ''
              }`}
              animate={{ 
                boxShadow: isPressed 
                  ? "inset 0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
                  : isHovered 
                    ? "0 10px 25px -5px rgba(59, 130, 246, 0.5)" 
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center font-display">
                <span className="mr-2">CAPTURE</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CaptureButton