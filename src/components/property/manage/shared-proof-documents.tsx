import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { HeadingLevelTwo } from '@/components/heading';
import ManageDocument from '@/components/property/manage-document';
import AddDocumentButton from './add-document';

type Props = {};

export function SharedProofDocuments({}: Props) {
  return (
    <section className='py-4'>
      <ManageDocument />
      <div className='my-10'>
        <HeadingLevelTwo>My Documents</HeadingLevelTwo>

        <AddDocumentButton />

        <section className='my-8 flex gap-x-8'>
          <OfferDocumentCard />{' '}
        </section>
      </div>
    </section>
  );
}


