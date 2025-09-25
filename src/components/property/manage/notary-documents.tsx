import React from 'react';
import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { HeadingLevelTwo } from '@/components/heading';
import ManageDocument from '@/components/property/manage-document';
import AddDocumentButton from '@/components/property/manage/add-document';

type Props = {};

function NotaryDocuments({}: Props) {
  return (
    <section className='py-4'>
      <ManageDocument />
      <div className='my-10'>
        <HeadingLevelTwo>Notary Sign</HeadingLevelTwo>
        <section className='my-8 flex gap-x-8'>
          <OfferDocumentCard />{' '}
        </section>
      </div>
    </section>
  );
}

export default NotaryDocuments;
