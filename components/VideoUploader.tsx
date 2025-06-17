import React, { useState, useRef } from 'react'
import { Upload, FileVideo, X, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { formatBytes } from '@/lib/utils'

interface VideoUploaderProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  onRemoveFile?: () => void
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  disabled?: boolean
}

export function VideoUploader({
  onFileSelect,
  selectedFile,
  onRemoveFile,
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
  acceptedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'],
  disabled = false
}: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Unsupported file type. Please use: ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatBytes(maxSize)}`
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  if (selectedFile) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileVideo className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {formatBytes(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
              </p>
            </div>
          </div>
          {onRemoveFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-purple-400 bg-purple-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${
          disabled ? 'text-gray-300' : 'text-gray-400'
        }`} />
        
        <div className="space-y-2">
          <p className={`text-lg font-medium ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {dragActive ? 'Drop your video here' : 'Upload video file'}
          </p>
          <p className={`text-sm ${
            disabled ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Drag and drop or click to browse
          </p>
          <p className={`text-xs ${
            disabled ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Supported: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} 
            • Max size: {formatBytes(maxSize)}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
          className="mt-4"
        >
          Choose File
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}