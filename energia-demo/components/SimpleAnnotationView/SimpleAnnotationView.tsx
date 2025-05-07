import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { OpenAIAnnotation } from '../../lib/openai';

type SimpleAnnotationViewProps = {
  image: string;
  annotations: OpenAIAnnotation[];
  activeAnnotation?: string | null;
  onAnnotationClick?: (id: string) => void;
};

const SimpleAnnotationView: React.FC<SimpleAnnotationViewProps> = ({
  image,
  annotations,
  activeAnnotation = null,
  onAnnotationClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Update container size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    // Initial measurement
    handleResize();

    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle image load to get its dimensions
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setIsImageLoaded(true);
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Image */}
      <div className="relative w-full h-full overflow-hidden">
        <img
          src={image}
          alt="Infrastructure image"
          className="max-w-full max-h-full object-contain mx-auto"
          onLoad={handleImageLoad}
        />
      </div>

      {/* Annotations */}
      {isImageLoaded && containerSize.width > 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {annotations.map((annotation) => {
            // Ensure all necessary properties exist
            if (!annotation.geometry || 
                typeof annotation.geometry.x === 'undefined' || 
                typeof annotation.geometry.y === 'undefined' || 
                typeof annotation.geometry.width === 'undefined' || 
                typeof annotation.geometry.height === 'undefined') {
              return null;
            }

            // For coordinates given as percentages (0-100)
            const isPercentageFormat = 
              annotation.geometry.x >= 0 && annotation.geometry.x <= 100 &&
              annotation.geometry.y >= 0 && annotation.geometry.y <= 100 &&
              annotation.geometry.width <= 100 &&
              annotation.geometry.height <= 100;
            
            // Calculate scaling for the annotation based on container vs image size
            const scaleX = containerSize.width / Math.max(imageSize.width, 1);
            const scaleY = containerSize.height / Math.max(imageSize.height, 1);
            const scale = Math.min(scaleX, scaleY);

            // Calculate position for maintaining aspect ratio
            const imageDisplayWidth = imageSize.width * scale;
            const imageDisplayHeight = imageSize.height * scale;
            
            // Center the image horizontally and vertically
            const offsetX = (containerSize.width - imageDisplayWidth) / 2;
            const offsetY = (containerSize.height - imageDisplayHeight) / 2;

            // Final position and size - handle percentage values
            let x, y, width, height;
            
            if (isPercentageFormat) {
              // Treat coordinates as percentages of image dimensions
              x = (annotation.geometry.x / 100) * imageDisplayWidth + offsetX;
              y = (annotation.geometry.y / 100) * imageDisplayHeight + offsetY;
              width = (annotation.geometry.width / 100) * imageDisplayWidth;
              height = (annotation.geometry.height / 100) * imageDisplayHeight;
            } else {
              // Treat as absolute pixel values (existing behavior)
              x = annotation.geometry.x * scale + offsetX;
              y = annotation.geometry.y * scale + offsetY;
              width = annotation.geometry.width * scale;
              height = annotation.geometry.height * scale;
            }

            const isActive = activeAnnotation === annotation.id;

            return (
              <div
                key={annotation.id}
                className={`absolute border-2 transition-all duration-200 pointer-events-auto cursor-pointer ${
                  isActive ? 'border-blue-500 bg-blue-500 bg-opacity-20' : 'border-white'
                }`}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  height: `${height}px`
                }}
                onClick={() => onAnnotationClick && onAnnotationClick(annotation.id)}
              >
                <div
                  className={`absolute top-0 left-0 transform -translate-y-full -translate-x-4 px-2 py-1 text-xs font-medium rounded-md ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-300'
                  }`}
                >
                  {annotation.data?.label || 'Unknown'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimpleAnnotationView;