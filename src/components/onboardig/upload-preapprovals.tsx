'use client';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { usePreApprovalContext } from '@/providers/pre-approval-provider';
import { Loader } from 'lucide-react';
import useFileUpload from '../../hooks/api/UseFileUpload';
import { FileUpload } from '../file-upload';
import { Icons } from '../icons';

type Props = {};

function PreApprovalFileUpload({}: Props) {
  const { methods } = usePreApprovalContext();

  const {
    files,
    uploadProgress,
    uploadResults,
    isUploading,
    setFiles,
    handleUpload,
  } = useFileUpload();

  return (
    <section className='flex h-full flex-col justify-center md:w-3/5'>
      <Heading
        className='mb-8 font-normal sm:text-2xl md:text-3xl lg:text-3xl'
        title='Upload Files'
      />

      <FileUpload
        setFile={(file: FileList) => {
          methods.setValue('preApprovalDocument', file);
          setFiles('preApprovalDocument', file);
        }}
        label={
          <label className='flex items-center gap-x-1'>
            <span>Pre Approval Document</span>{' '}
            <Icons.Warning className='h-4 w-4' />
          </label>
        }
      />
      <FileUpload
        setFile={(file: FileList) => {
          methods.setValue('proofOfDownPayment', file);
          setFiles('proofOfDownPayment', file);
        }}
        label={
          <label className='flex items-center gap-x-1'>
            <span>Proof of Down Payment</span>{' '}
            <Icons.Warning className='h-4 w-4' />
          </label>
        }
      />

      <Button
        className='inline-flex w-max disabled:bg-gray-500'
        onClick={handleUpload}
        disabled={!files || Object.keys(files).length !== 2 || isUploading}
      >
        {isUploading ? <Loader className='animate-spin pr-2' /> : null} Upload
        All
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

export default PreApprovalFileUpload;
