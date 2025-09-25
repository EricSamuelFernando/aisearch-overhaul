import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { HeadingLevelTwo } from '@/components/heading';
import ManageDocument from '@/components/property/manage-document';
import AddDocumentButton from './add-document';
import { SharedRepoDocumentUpload } from './shared-repo-document-upload';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCheckUserAccess, useGetAllRepos, useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { useParams } from 'next/navigation';
import { DocumentCard } from '@/components/dashboard/main/DocumentCard';
import { formatDate } from '@/lib/utils';
import { EmptyPlaceholder } from '@/components/dashboard/main/EmptyPlaceholder';
import { downloadDocument } from '@/utils/downloadFunction';
import { useState } from 'react';

type Props = {};

function SharedRepo({}: Props) {
  const {user} = useAuth()
  console.log(user?.id)
  const params = useParams()
  const propertyId = params?.propertyId  as string
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const { data: repos = [], isLoading: reposLoading } = useGetAllRepos(propertyId);
  const [activeDocument, setActiveDocument] = useState<string | null>(null)
  console.log(propertyId)

  const { data: hasAccess, isLoading: accessCheckLoading } = useCheckUserAccess({
    repoId: repos?.[0]?.id,
    requiredAccessType: 'VIEW',
    enabled: !!repos?.[0]?.id &&  !!user?.id
  });
  const {requestRepoAccess}  = useRepoManagementApi()

  const handleDocumentClick = (document:any) => {
    setSelectedDocument(document)
  }

  const handleDocumentDelete = (document:any) => {
    setSelectedDocument(document)
    // deletePropertyDocumentMutate(document?._id)
  }

  const handleRequestAccess = () => {
    requestRepoAccess.mutate({
      repoId:repos[0]?.id,
      userId:user?.id,
      propertyId
    });
  };
  return (
    <section className='py-4'>
  
      <div className='my-10'>
        <HeadingLevelTwo className='mb-8'>My Documents</HeadingLevelTwo>

        <SharedRepoDocumentUpload userId={user?.id} propertyId={propertyId}/>

        {reposLoading ? ( <p>loading...</p>) 
        : (
          <section className="flex flex-wrap  mt-8 items-center gap-10">
            {repos[0]?.uploadedFiles != null && hasAccess && repos[0]?.uploadedFiles?.length > 0 ?
             (
              repos[0]?.uploadedFiles?.map((propertyDocument:any) => {
                const { month, day, year } = formatDate( propertyDocument.uploadedAt)
                const isSelected = selectedDocument?.id === propertyDocument?.id
                return (
                  <DocumentCard
                    className={isSelected ? 'bg-white' : 'bg-inherit'}
                    key={propertyDocument?._id}
                    url={propertyDocument?.fileUrl}
                    title={propertyDocument.fileName}
                    updatedDate={`Updated ${month} ${day}, ${year}`}
                    onClick={() => {
                      handleDocumentClick(propertyDocument)
                    }}
                    handleDocumentDelete={() =>
                      handleDocumentDelete(propertyDocument)
                    }
                    documentUrl={propertyDocument.fileUrl}
                    isOpen={activeDocument === propertyDocument._id}
                    setActiveDocument={() =>
                      setActiveDocument(
                        activeDocument === propertyDocument._id
                          ? null
                          : propertyDocument._id
                      )
                    }
                  />
                )
              })
            ) :

            !repos.length  ?
            (
              <EmptyPlaceholder
              transactionImage=''
                EmptyPlaceHolderImage="/assets/icons/document_icon.svg"
                title="Documents"
                description="No Documents yet"
              />
            )
            :
            <section className="w-full h-[40vh] flex items-center justify-center bg-gray-100 rounded-xl shadow-inner ">
            <div className="text-center px-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
            You don&apos;t have access to view this section
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Please request access to collaborate and upload or view documents for this property.
              </p>
              <button
                onClick={handleRequestAccess}
                className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 text-sm sm:text-base"
              >
                Request Access
              </button>
            </div>
          </section>
          }
          </section>
        )
        }
      </div>
    </section>
  );
}

export default SharedRepo
