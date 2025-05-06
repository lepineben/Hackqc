import { motion } from 'framer-motion'

type SkeletonVariant = 'card' | 'text' | 'image' | 'circle' | 'button' | 'input'
type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface SkeletonLoaderProps {
  variant?: SkeletonVariant
  size?: SkeletonSize
  count?: number
  className?: string
  shape?: 'rounded' | 'square' | 'circle'
  animate?: boolean
}

const variantClasses: Record<SkeletonVariant, string> = {
  card: 'w-full h-48',
  text: 'w-full h-4',
  image: 'w-full aspect-square',
  circle: 'rounded-full',
  button: 'h-10 rounded-md',
  input: 'h-10 rounded-md',
}

const sizeClasses: Record<SkeletonSize, string> = {
  xs: 'w-16',
  sm: 'w-24',
  md: 'w-32',
  lg: 'w-48',
  xl: 'w-64',
  full: 'w-full',
}

const shapeClasses = {
  rounded: 'rounded-md',
  square: 'rounded-none',
  circle: 'rounded-full',
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  size = 'full',
  count = 1,
  className = '',
  shape = 'rounded',
  animate = true,
}) => {
  // Create an array based on count
  const items = [...Array(count).keys()]

  // Define animation variants
  const shimmerAnimation = animate ? 'animate-pulse' : ''
  
  // Construct the classes
  const baseClasses = [
    'bg-secondary-200',
    variant !== 'circle' ? shapeClasses[shape] : 'rounded-full',
    variantClasses[variant],
    variant !== 'card' && variant !== 'image' ? sizeClasses[size] : '',
    shimmerAnimation,
    className,
  ].join(' ')

  return (
    <div className="w-full">
      {items.map((index) => (
        <div
          key={index}
          className={`${baseClasses} ${index !== count - 1 ? 'mb-2' : ''}`}
        ></div>
      ))}
    </div>
  )
}

export default SkeletonLoader