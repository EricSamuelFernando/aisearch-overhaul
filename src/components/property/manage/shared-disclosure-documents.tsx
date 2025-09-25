import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { HeadingLevelTwo } from '@/components/heading';
import ManageDocument from '@/components/property/manage-document';
import { SharedRepoDocumentUpload } from './shared-repo-document-upload';
import { useAuth } from '@/shared/hooks/useAuth';
import { useParams } from 'next/navigation';
import { useGetAllRepos } from '@/hooks/api/document/useRepoManagement';

type Props = {};

export function SharedDisclosureDocuments({}: Props) {

  const {user} = useAuth()
  console.log(user?.id)
  const params = useParams()
  const propertyId = params?.propertyId  as string
  const { data: repos = [], isLoading: reposLoading } = useGetAllRepos(propertyId , 'disclosure-document');
  console.log(repos)
 
  return (
    <section className='py-4'>
      {/* <ManageDocument /> */}
      <HeadingLevelTwo>Disclosure Documents</HeadingLevelTwo>
      <div className='my-10'>
       

        <SharedRepoDocumentUpload 
         userId={user?.id}
         propertyId={propertyId}
         url={'/disclosure-document'}
         repo={'disclosure-document'}
         />

        <section className='my-8 grid grid-cols-2 gap-8'>
          {
               repos?.[0]?.uploadedFiles?.map((doc:any , key:number) =>{
                return(
                  <OfferDocumentCard
                     fileName={doc?.fileName}
                     fileUrl={doc?.fileUrl}
                     fileKey={doc?.fileUrl}
                     uploadedAt={doc?.uploadedAt}
                     idx={key}
                   />
                )
               })

          }
          
          {/* <OfferDocumentCard />
          <OfferDocumentCard />
          <OfferDocumentCard /> */}
        </section>
      </div>
    </section>
  );
}


