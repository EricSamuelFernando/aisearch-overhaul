'use client';

import { Accordion, AccordionTitle } from '@/components/customs/accordion';
import Heading from '@/components/heading';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { AgentOfferResponse } from '@/interfaces/property.interface';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DocumentCard from './document-card';
import { TransactionSummaryCard } from './transaction-summary-card';
import { AgentPropertyCard } from '../agent/agent-property-card';
import { AgentInfoCard } from '../agent/agent-info-card';

type Props = {};

function TransactionOffersDetail({}: Props) {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  const { getOfferDetails } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = getOfferDetails;
  const offer = data?.data.data as AgentOfferResponse;

  const loading = isLoading || isFetching;
  return (
    <section className='grid grid-cols-9 gap-8'>
      {loading ? (
        <div className='col-span-9 flex justify-center'>Loading...</div>
      ) : null}
      {!loading && offer ? (
        <>
          <div className='col-span-6'>
            <div className='text-md text-ocOrange'>
              <Link href='/dashboard/agent/property?tab=offers'>Offers </Link>{' '}
              <span>&gt;</span> <span>{offer?.property?.propertyName}</span>
            </div>

            <section>
              <Heading title='Presented By' className='py-8 text-2xl' />
              <div className='flex gap-x-16'>
                <AgentInfoCard
                  name={offer.buyerAgent.fullname}
                  licence={offer.buyerAgent.licence_number}
                  mail={offer.buyerAgent.email}
                  phone={offer.buyerAgent.mobile.raw_mobile}
                />
                <AgentInfoCard
                  name={offer.sellerAgent.fullname}
                  licence={offer.sellerAgent.licence_number}
                  mail={offer.sellerAgent.email}
                  phone={offer.sellerAgent.mobile.raw_mobile}
                />
              </div>
            </section>

            <section className='container mx-auto p-4'>
              <Accordion
                title={<AccordionTitle title='Letter & Special Terms' />}
                defaultOpen={true}
              >
                Content of section 1
              </Accordion>
              <Accordion title={<AccordionTitle title='Documents' />}>
                {offer.documents.length < 1 ? (
                  'No Documents Submitted'
                ) : (
                  <div>
                    {offer.documents.map((doc, index) => (
                      <DocumentCard
                        key={doc._id}
                        documentId={doc._id}
                        title={doc.name}
                        description={''}
                      />
                    ))}
                  </div>
                )}
              </Accordion>
            </section>
          </div>
          <div className='col-span-3'>
            <AgentPropertyCard
              moreAddressDetails={`${offer.property.propertyAddressDetails.province} ${offer.property.propertyAddressDetails.postalCode}`}
              address={offer.property.propertyAddressDetails.formattedAddress}
            />
            <Heading
              title='Summary of Terms'
              className='py-4 text-xl font-bold'
            />
            <TransactionSummaryCard offer={offer} />
          </div>
        </>
      ) : null}
    </section>
  );
}

export default TransactionOffersDetail;
