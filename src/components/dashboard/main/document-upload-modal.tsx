import React, { useState } from 'react';
import useFileUpload from '@/hooks/api/UseFileUpload';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  setFileDetails: (details: { name: string; url: string,type:string }) => void;
  onUploadSuccess: (
    name: string,
    type: string,
    url: string,
  ) => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  setFileDetails
}) => {
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_SEARCH_ENDPOINT || "https://ai.snaphomz.com";
  const { files, setFiles, handleUpload, thumbnails } = useFileUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setFiles('file', files);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await axios.post(`${AI_SEARCH_ENDPOINT}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("File upload result: ",result?.data);
      
      if(selectedFile){
        setFileDetails({
          name:selectedFile.name,
          url:result?.data?.file_url,
          type:selectedFile.type
        })
        onUploadSuccess(selectedFile.name,selectedFile.type,result?.data?.file_url);
      }
      setIsUploading(false);
      return result?.data?.file_url;
    } catch (err: any) {
      console.error("Error:", err);
      throw err;
    }
    setIsUploading(false);
  };
  const handleUploadFile = async () => {
    console.log("Selected file : ",selectedFile);
    
    if (selectedFile) {
      setIsUploading(true);
      const url = await handleFileUpload(selectedFile)
      onClose();
      return url;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='relative min-w-[28rem] max-w-2xl overflow-x-hidden rounded-lg bg-white p-8 shadow-lg md:min-w-[32rem]'>
        <button className='absolute right-2 top-2 text-2xl' onClick={onClose}>
          &times;
        </button>
        <h2 className='mb-6 text-xl font-semibold'>Upload Document</h2>
        <div className='flex flex-col items-center border-2 border-dashed border-gray-400 p-4'>
          <label className='cursor-pointer'>
            <input type='file' className='hidden' onChange={handleFileChange} />
            <div className='flex flex-col items-center'>
              <p className='text-black'>Drag files to upload</p>
              <p className='my-4 text-gray-500'>or</p>
              <div className='rounded-full border border-black px-14 py-2'>
                Browse Files
              </div>
            </div>
          </label>
        </div>
        {selectedFile && (
          <div className='mt-4 flex items-center'>
            <span>{selectedFile.name}</span>
            <button
              className='text-red-500'
              onClick={() => setSelectedFile(null)}
            >
              &times;
            </button>
          </div>
        )}
        <div className='flex justify-end'>
          <button
            className={`mt-4 flex items-center justify-center rounded-full px-14 py-2 ${
              isUploading ? 'bg-gray-400' : 'bg-black'
            } text-white ${isUploading ? 'cursor-not-allowed' : ''}`}
            onClick={handleUploadFile}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader className='animate-spin' size={20} />
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
