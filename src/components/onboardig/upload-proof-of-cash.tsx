import Heading from '@/components/heading';
import { usePreApprovalContext } from '@/providers/pre-approval-provider';
import { FileUpload } from '@/components/file-upload';
import { Icons } from '@/components/icons';
import useFileUpload from '@/hooks/api/UseFileUpload';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

export function CashProofUpload() {
  const { methods } = usePreApprovalContext();

  const {
    files,
    uploadProgress,
    uploadResults,
    isUploading,
    setFiles,
    handleUpload,
    fileKeys,
  } = useFileUpload();

  const handleFile = (file: FileList) => {
    methods.setValue('proofOfFunds', file);
    setFiles('proofOfFunds', file);
  };

  return (
    <section className='flex h-full flex-col justify-center md:w-3/5'>
      <Heading
        className='mb-8 font-normal sm:text-2xl md:text-3xl lg:text-3xl'
        title='Upload File'
      />

      <FileUpload
        setFile={handleFile}
        label={
          <label className='mb-1 flex items-center gap-x-1'>
            <span className=''>Proof of funds</span>
            <Icons.Warning className='h-4 w-4' />
          </label>
        }
      />

      <Button
        disabled={!files || Object.keys(files).length === 0 || isUploading}
        className='inline-flex w-max disabled:bg-gray-500'
        onClick={handleUpload}
      >
        {isUploading ? <Loader className='w-max animate-spin pr-2' /> : null}{' '}
        Upload File
      </Button>

      <ul>
        {Object.entries(files).flatMap(([key, fileList]) =>
          fileList
            ? Array.from(fileList).map((file) => (
                <li className='py-2 text-md' key={file.name}>
                  {file.name} - {uploadProgress[file.name] || 0}% -{' '}
                  {uploadResults[file.name] || 'Pending'}
                </li>
              ))
            : null,
        )}
      </ul>
    </section>
  );
}
