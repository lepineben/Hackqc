import { useState, useEffect } from 'react'
import Image from 'next/image'

type ComparisonViewProps = {
  currentImage: string
  futureImage: string
  viewMode: 'toggle' | 'sideBySide'
  activeView: 'current' | 'future'
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  currentImage,
  futureImage,
  viewMode,
  activeView
}) => {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  // Handle slider drag - for both mouse and touch events
  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragMove = (clientX: number, element: HTMLDivElement) => {
    if (!isDragging) return
    
    const container = element.getBoundingClientRect()
    const newPosition = ((clientX - container.left) / container.width) * 100
    setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDragMove(e.clientX, e.currentTarget)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX, e.currentTarget)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Add global event listeners for mouse/touch up
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragging(false)
    }

    window.addEventListener('mouseup', handleGlobalDragEnd)
    window.addEventListener('touchend', handleGlobalDragEnd)
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalDragEnd)
      window.removeEventListener('touchend', handleGlobalDragEnd)
    }
  }, [])

  if (viewMode === 'sideBySide') {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative w-full aspect-square max-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute top-0 left-0 bg-green-600 text-white text-xs font-bold px-2 py-1 m-2 rounded z-10">
            ACTUEL
          </div>
          <div className="relative w-full h-full">
            {currentImage && (
              <Image
                src={currentImage.startsWith('data:') ? currentImage : `/${currentImage}`}
                alt="Image actuelle"
                layout="fill"
                objectFit="contain"
              />
            )}
          </div>
        </div>
        <div className="relative w-full aspect-square max-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute top-0 left-0 bg-amber-600 text-white text-xs font-bold px-2 py-1 m-2 rounded z-10">
            PROJECTION 2030
          </div>
          <div className="relative w-full h-full">
            {futureImage && (
              <Image
                src={futureImage.startsWith('data:') ? futureImage : `/${futureImage}`}
                alt="Projection future"
                layout="fill"
                objectFit="contain"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Toggle view mode
  if (activeView === 'current') {
    return (
      <div className="relative w-full aspect-square max-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 bg-green-600 text-white text-xs font-bold px-2 py-1 m-2 rounded z-10">
          ACTUEL
        </div>
        <div className="relative w-full h-full">
          {currentImage && (
            <Image
              src={currentImage.startsWith('data:') ? currentImage : `/${currentImage}`}
              alt="Image actuelle"
              layout="fill"
              objectFit="contain"
            />
          )}
        </div>
      </div>
    )
  }

  // Slider view - using futureImage
  return (
    <div 
      className="relative w-full aspect-square max-h-[600px] bg-gray-100 rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={() => setIsDragging(false)}
      onTouchCancel={() => setIsDragging(false)}
    >
      <div className="absolute top-0 left-0 bg-amber-600 text-white text-xs font-bold px-2 py-1 m-2 rounded z-10">
        PROJECTION 2030
      </div>
      {/* Future image base layer */}
      <div className="relative w-full h-full">
        {futureImage && (
          <Image
            src={futureImage.startsWith('data:') ? futureImage : `/${futureImage}`}
            alt="Projection future"
            layout="fill"
            objectFit="contain"
          />
        )}
      </div>
      
      {/* Current image overlay with slider */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full">
          {currentImage && (
            <Image
              src={currentImage.startsWith('data:') ? currentImage : `/${currentImage}`}
              alt="Image actuelle"
              layout="fill"
              objectFit="contain"
              className="object-cover"
            />
          )}
        </div>
        
        {/* Slider handle */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-1 bg-white cursor-ew-resize"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-green-600 flex items-center justify-center cursor-ew-resize">
            <div className="text-xs font-bold select-none">▶◀</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonView