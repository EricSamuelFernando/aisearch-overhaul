import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { HeadingLevelTwo } from '@/components/heading';
import ManageDocument from '@/components/property/manage-document';

type Props = {};

function DisclosureDocuments({}: Props) {
  return (
    <section className='py-4'>
      <ManageDocument />
      <div className='my-10'>
        <HeadingLevelTwo>Disclosure Documents</HeadingLevelTwo>

        <section className='my-8 grid grid-cols-2 gap-8'>
          <OfferDocumentCard />
          <OfferDocumentCard />
          <OfferDocumentCard />
          <OfferDocumentCard />
        </section>
      </div>
    </section>
  );
}

export default DisclosureDocuments;
