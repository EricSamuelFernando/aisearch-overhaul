import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'


export interface FileUploadProps {
  label?: React.ReactNode
  setFiles: (files: File[]) => void
  className?: string
  initialFiles?: FileList
  inputClassName?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  setFiles,
  className,
  initialFiles,
  inputClassName
}) => {
  const [localFiles, setLocalFiles] = useState<FileList | null>(null)

  useEffect(() => {
    if (initialFiles) {
      setLocalFiles(initialFiles)
    }
  }, [initialFiles])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      const selectedFiles = Array.from(event.target.files)
      setLocalFiles(event.target.files)
      setFiles(selectedFiles)
    }
  }

  return (
    <div className={cn('w-full mb-4', className)}>
      {label ? label : null}

      <div className="mt-1">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className={cn(
            `block w-full text-sm cursor-pointer text-gray-500 border-[.5px] border-[#707070] rounded-md file:cursor-pointer file:mr-4 file:py-4 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/90 text-transparent`,
            inputClassName
          )}
        />
      </div>
    </div>
  )
}
