'use client';

import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { SharedRepoDocumentUpload } from './shared-repo-document-upload';
import { useAuth } from '@/shared/hooks/useAuth';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetAllRepos, useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { useSelector } from 'react-redux';
import { FileText, EllipsisVertical, Pencil, Download, X } from 'lucide-react';
import { useState } from 'react';
import { GeneralDocumentCard } from './document-card';
import { Skeleton } from '@mantine/core'; 
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  folderName: string;
  folderUrl: string;
  shared?: boolean;
  pId?:string;
  handleEditDocument?: (docId: string, docName: string) => void;
};

// export function SharedFolder({ folderName, folderUrl, shared }: Props) {
//   const { user } = useAuth();
//   const engagedProperty = useSelector((state: any) => state.property?.engagedProperty);
//   const params = useParams();
//   const propertyId = params?.propertyId as string;
//   const searchParams = useSearchParams();
//   const manageParam = searchParams?.get('manage');
//   const { data: repos = [], isLoading } = useGetAllRepos(propertyId, folderName, shared);

//   const [openDropdown, setOpenDropdown] = useState<number | null>(null);
//   const [editModal, setEditModal] = useState<{ open: boolean; doc: any | null }>({
//     open: false,
//     doc: null,
//   });
//   const [documentName, setDocumentName] = useState('');

//   const {removeUploadedFile} = useRepoManagementApi()

//   const handleDownload = (doc: any) => {
//     // Add your download logic here
//     console.log('Downloading', doc.fileUrl);
//   };

//   const handleEditDocument = (id: string, name: string) => {
//     // Add your update logic here
//     console.log(`Editing doc ${id} with new name: ${name}`);
//   };

//   const handleDelete = async (id:string) => {
//     try {
//       console.log(id)
//       removeUploadedFile.mutateAsync(id)
//       // router.push('/dashboard/')
//     } catch (error:any) {
//       console.log(error?.message)
//     }
         
//   } 

//   const uploadedFiles = repos?.[0]?.uploadedFiles || [];
//   console.log(engagedProperty?.participants?.[0])

//   return (
//     <section className="p-4">
//       <div className="pt-2 flex flex-col justify-center items-center">



//         <section className={`my-8 grid ${manageParam === 'documents' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
//           {uploadedFiles.length === 0 ? (
//             <p className="col-span-full text-center text-gray-500">
//               You haven’t uploaded any files yet.
//             </p>
//           ) : (
//             uploadedFiles.map((doc: any, index: number) =>
//               manageParam === 'documents' ? (
//                 <OfferDocumentCard
//                   key={index}
//                   fileName={doc?.fileName}
//                   fileUrl={doc?.fileUrl}
//                   fileKey={doc?.fileUrl}
//                   uploadedAt={doc?.uploadedAt}
//                   share={shared}
//                   idx={index}
//                   repoId={repos?.[0]?.id}
//                   buyer={engagedProperty?.participants?.[0]?.agent?.id}
//                 />
//               ) : (
//                 <GeneralDocumentCard
//                   key={doc.id}
//                   doc={doc}
//                   index={index}
//                   onDownload={handleDownload}
//                   onEditDocument={handleEditDocument}
//                   onDelete= {handleDelete}
//                 />
//               )
//             )
//           )}
//         </section>
//         <SharedRepoDocumentUpload
//           userId={user?.id}
//           propertyId={propertyId}
//           url={folderUrl}
//           repo={folderName}
//         />
//       </div>
//     </section>
//   );
// }


// Import Mantine Skeleton component


export function SharedFolder({ folderName, folderUrl, shared , pId,handleEditDocument }: Props) {
  const { user } = useAuth();
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty);
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const searchParams = useSearchParams();
  const manageParam = searchParams?.get('manage');
  const queryClient = useQueryClient();
  
  const { data: repos = [], isLoading, refetch } = useGetAllRepos(propertyId || pId, folderName, shared);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; doc: any | null }>({
    open: false,
    doc: null,
  });
  const [documentName, setDocumentName] = useState('');

  const { removeUploadedFile  , renameUploadedFile} = useRepoManagementApi();

  const handleDownload = (doc: any) => {
    // Add your download logic here
    console.log('Downloading', doc.fileUrl);
  };

  const handleDelete = async (id: string) => {
    try {
      await removeUploadedFile.mutateAsync(id);
      refetch();
    } catch (error: any) {
      console.log(error?.message);
    }
  };

  const uploadedFiles = repos?.[0]?.uploadedFiles || [];

  const handleEditHandler = async (id: string, fileName: string) => {
  try {

   // await handleEditDocument?.(id, documentName);
    await renameUploadedFile.mutateAsync({fileName,id})
    await refetch()
  } catch (error) {
    console.error("Error updating document:", error);
  }
};


  console.log("Uploaded files : ",uploadedFiles);
  

  return (
    <section className="p-1">
      <div className="pt-2 flex flex-col justify-center items-center">
        <section className={`my-8 w-full   ${manageParam === 'documents' ? 'flex flex-wrap' : ' grid grid-cols-1'} gap-4`}>
          {isLoading ? (
            // Skeleton loader displayed when data is loading
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={60} radius="md" />
            ))
          ) : uploadedFiles.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              You haven’t uploaded any files yet.
            </p>
          ) : (
            uploadedFiles.map((doc: any, index: number) =>
              manageParam === 'documents' ? (
                <OfferDocumentCard
                  key={doc.id}
                  fileName={doc?.fileName}
                  fileUrl={doc?.fileUrl}
                  fileKey={doc?.fileUrl}
                  uploadedAt={doc?.uploadedAt}
                  share={false}
                  docId={doc?.id}
                  idx={index}
                  repoId={repos?.[0]?.id}
                  onDelete={handleDelete}
                  buyer={engagedProperty?.participants?.[0]?.agent?.id}
                />
              ) : (
                <GeneralDocumentCard
                  key={doc.id}
                  doc={doc}
                  index={index}
                  onDownload={handleDownload}
                  onEditHandler={handleEditHandler}
                  onDelete={handleDelete}
                />
              )
            )
          )}
        </section>
        <SharedRepoDocumentUpload
          userId={user?.id}
          propertyId={propertyId || pId }
          url={folderUrl}
          repo={folderName}
        />
      </div>
    </section>
  );
}

