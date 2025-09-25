'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileWithPath } from '@mantine/dropzone';
import { useState } from 'react';
import HorizontalDropzone from '@/components/file-dropzone';
import { nanoid } from 'nanoid';
import { Icons } from '@/components/icons';

export function ProofOfFundsUpload() {
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const preview = files.map((file) => (
    <div key={nanoid()} className='my-4 flex items-center gap-x-8'>
      <p>{file.name}</p>
      <Icons.Trash
        onClick={() => setFiles([])}
        className='cursor-poinyer h-4 w-4'
      />
    </div>
  ));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className='w-full text-left'>Proof Of Funds</span>
      </DialogTrigger>
      <DialogContent className='rounded-none py-8 sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='font-noraml my-4 text-left text-2xl'>
            Upload File ( Proof of Funds )
          </DialogTitle>
        </DialogHeader>

        <HorizontalDropzone
          setFiles={setFiles}
          buttonText='Browswe Files'
          dropdownText={
            <>
              <p className='text-black'>Drag Files to Upload</p>
              <span>Or</span>
            </>
          }
          buttonProps={{ className: 'w-max px-8', variant: 'outline' }}
        />
        {preview}

        <DialogFooter>
          <Button
            roundness='full'
            className='min-w-[7.5rem] px-6'
            type='submit'
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
