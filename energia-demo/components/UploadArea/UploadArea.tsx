import { useState, useCallback, useRef } from 'react'

type UploadAreaProps = {
  onFileUpload: (file: File) => void
}

const UploadArea = ({ onFileUpload }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const validateFile = (file: File): boolean => {
    // Accept only image files
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez télécharger un fichier image (JPEG, PNG, etc.).')
      return false
    }
    
    // Check for reasonable file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('L\'image est trop volumineuse. Veuillez télécharger une image de moins de 10 Mo.')
      return false
    }
    
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setErrorMessage(null)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileUpload(file)
      }
    }
  }, [onFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        onFileUpload(file)
      }
    }
  }, [onFileUpload])

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 h-72 md:h-96
          flex flex-col items-center justify-center text-center
          transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
        onClick={handleButtonClick}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/*"
          className="hidden"
        />
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-16 w-16 mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        
        <p className="text-lg font-medium mb-2">
          {isDragging ? 'Déposez l\'image ici' : 'Glissez et déposez une image ici'}
        </p>
        <p className="text-sm text-gray-500 mb-4">ou</p>
        <button 
          type="button" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
        >
          Parcourir les fichiers
        </button>
        <p className="text-xs text-gray-400 mt-4">Accepte JPG, PNG et autres formats d'image jusqu'à 10 Mo</p>
        
        {errorMessage && (
          <p className="mt-4 text-red-500 text-sm">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}

export default UploadArea