'use client';

import Link from 'next/link';
import { Accordion, AccordionTitle } from '@/components/customs/accordion';
import Heading from '@/components/heading';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { AgentOfferResponse } from '@/interfaces/property.interface';
import { useRouter, useSearchParams } from 'next/navigation';
import DocumentCard from './document-card';
import { AgentInfoCard } from '../agent/agent-info-card';
import { AgentPropertyCard } from '../agent/agent-property-card';
import { OfferSummaryCard } from './offer-summary-card';
import { useAppSelector } from '@/lib/hook';
import parse from 'html-react-parser';
// Dummy Offer
// const dummyOffer: AgentOfferResponse = {
//   _id: 'dummy-id',
//   buyer: {
//     fullname: 'John Doe',
//     email: 'john.doe@example.com',
//     mobile: {
//       raw_mobile: '+1234567890',
//       number_body: '123-456-7890',
//     },
//   },
//   buyerAgent: {
//     fullname: 'Jane Smith',
//     email: 'jane.smith@example.com',
//     licence_number: 'LIC12345',
//     mobile: {
//       raw_mobile: '+0987654321',
//       number_body: '098-765-4321',
//     },
//   },
//   offerCommentCount: 3,
//   offerPrice: {
//     amount: 500000,
//     currency: 'USD',
//   },
//   financeType: 'cash',
//   downPayment: {
//     amount: 200000,
//     currency: 'USD',
//   },
//   loanAmount: {
//     amount: 300000,
//     currency: 'USD',
//   },
//   documents: [
//     {
//       _id: 'doc1',
//       name: 'Proof of Funds',
//     },
//     {
//       _id: 'doc2',
//       name: 'Pre-Approval Letter',
//     },
//   ],
//   property: {
//     propertyName: 'Luxury Villa',
//     brokers: [{ name: 'Top Realty' }],
//     propertyAddressDetails: {
//       formattedAddress: '123 Main St, Beverly Hills, CA',
//       province: 'CA',
//       postalCode: '90210',
//     },
//   },
// };

function TransactionOffersDetail() {
  const params = useSearchParams();
  const router = useRouter()
  const id = params?.get('id');
  const type = params?.get('type')
  const { getOfferDetails } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = getOfferDetails;
  const offer = (data?.data?.data as AgentOfferResponse)
  const loading = isLoading || isFetching;
  const {selectedOffer} = useAppSelector(state =>  state.property)
  console.log(selectedOffer)
  return (
    <section className='grid grid-cols-9 gap-8'>
      {false ? (
        <div className='col-span-9 flex justify-center'>Loading...</div>
      ) : (
        <>
          <div className='col-span-6'>
            <div className='text-md text-ocOrange'>
              <span className='cursor-pointer' onClick={() => router.back()}>
                Offers
              </span>{' '}
              <span>&gt;</span> <span>{offer?.property?.propertyName}</span>
            </div>

            <section>
              <Heading title='Presented By' className='py-8 text-2xl' />
              <div className='flex flex-wrap gap-8'>
                <AgentInfoCard
                  profile={selectedOffer?.createdBy?.profile || ""}
                  name={`${selectedOffer?.createdBy?.firstName} ${selectedOffer?.createdBy?.lastName} `}
                  // licence={selectedOffer?.buyerAgent?.licence_number}
                  mail={selectedOffer?.createdBy?.email}
                  phone={selectedOffer?.createdBy?.phone}
                />
                <AgentInfoCard
                  name={`${selectedOffer?.createdBy?.firstName} ${selectedOffer?.createdBy?.lastName} `}
                  // licence={selectedOffer?.buyerAgent?.licence_number}
                  mail={selectedOffer?.createdBy?.email}
                  phone={selectedOffer?.createdBy?.phone}
                />
              </div>
            </section>

            <section className='mt-8 p-4'>
              <Accordion
                title={<AccordionTitle title='Letter & Special Terms' />}
                defaultOpen={true}
              >
                <div className='flex flex-col gap-2'>
                  <p className='font-bold text-md'>Cover letter</p>
             
                <p className='py-8'>
              {' '}
              {selectedOffer?.coverLetter
                ? parse(selectedOffer.coverLetter)
                : 'No cover letter available'}
            </p>
                <p className='font-bold text-md'>Special Terms</p>
                {/* {selectedOffer?.specialTerms} */}
                {selectedOffer?.specialTerms
                ? parse(selectedOffer.specialTerms)
                : 'No cover letter available'}
                
                </div>
               
                
              
              </Accordion>
              <Accordion title={<AccordionTitle title='Documents' />}>
                {offer?.documents?.length < 1 ? (
                  <div className='text-gray-500'>No Documents Submitted</div>
                ) : (
                  <div className='space-y-4'>
                    {offer?.documents.map((doc) => (
                      <DocumentCard
                        key={doc._id}
                        documentId={doc._id}
                        title={doc.name}
                        description=''
                      />
                    ))}
                  </div>
                )}
              </Accordion>
            </section>
          </div>

          <div className='col-span-3 space-y-6'>
            <AgentPropertyCard
              moreAddressDetails={`${offer?.property?.propertyAddressDetails?.province} ${offer?.property?.propertyAddressDetails?.postalCode}`}
              address={offer?.property?.propertyAddressDetails?.formattedAddress}
            />
            <Heading title='Summary of Terms' className='text-xl font-bold' />
            <OfferSummaryCard offer={selectedOffer} />
          </div>
        </>
      )}
    </section>
  );
}

export default TransactionOffersDetail;
