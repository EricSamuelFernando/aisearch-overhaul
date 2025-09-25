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
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import useAddProperty from '@/hooks/api/user/useAddProperty';
import { useParams } from 'next/navigation';
import { error } from '@/components/alert/notify';
import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@mantine/core';
import { Upload } from 'lucide-react';

export function SharedRepoDocumentUpload({userId , propertyId , repo , url}:any) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [loading , setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createRepoWithUploadedFile:{mutate,data ,status}}= useRepoManagementApi()
  const queryClient = useQueryClient();
  const {uploadNewFile} = useAddProperty()
  // const = (e:any) => {
  //   console.log(files[0])

  //   // // Add other metadata here if required
  //   mutate(files[0]);
  // };
  const handleUpload = async () => {
    if (!files || files.length === 0) {
      console.error("No files selected");
      return;
    }
    setLoading(true)
  
    for (const file of files) {
      if (file.type !== "application/pdf") {
        console.warn(`${file.name} is not a PDF. Skipping...`);
        continue;
      }
  
      console.log(file, userId, propertyId)
      try {
        const { key } = await uploadNewFile(file, userId, propertyId);
  
        const payload = {
          uploadedFile: {
            fileName: file.name,
            fileSize: file.size,
            fileUrl: key,
            fileType: file.type,
          },
          createRepoManagementInput: {
            name: repo || 'shared-repo',
            url: url || '/shared-repo',
            propertyId,
            createdBy: userId,
            parentFolderName: 'shared-repo',
            isArchived: false,
          },
        };
  
     mutate(payload, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAllRepos', propertyId] });
            // ✅ re-fetch repo data
          },
          onError: (err) => {
            error({ message: err?.message || 'Upload failed' });
          },
        });
      } catch (err) {
        console.error(`❌ Failed to upload ${file.name}:`, err);
      }
    }
    setLoading(false)
    setDialogOpen(false);

  };
  
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
    <Dialog >
      <DialogTrigger asChild>
      <span
          onClick={() => setDialogOpen(true)}
          className=' cursor-pointer text-left p-4 px-8 flex items-center gap-2 w-fit  text-sm font-bold border border-black rounded-full bg-transparent  border-black  my-2'
        ><Upload />   Upload </span>
      </DialogTrigger>
      <DialogContent className='rounded-none py-8 sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='font-noraml my-4 text-left text-2xl'>
            Upload File 
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
            className='min-w-[7.5rem] px-6 flex gap-2'
            type='submit'
            disabled={loading}
            onClick={handleUpload}
          >
            {loading && <Loader size={20} color='orange' />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
