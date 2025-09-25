"use client"
import React, { useEffect, useState } from 'react';
import { HeadingLevelTwo } from '@/components/heading';
import { OfferCard } from '@/components/property/offer-card';
import { useFetchPropertyCounterOffers, usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useAppSelector } from '@/lib/hook';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAgentProperty } from '@/hooks/api/agent/useAddAgentProperty';


type Props = {};

function CounterOffers({ }: Props) {
  const [loading, setLoading] = useState(false);
  const { getOffersPropertyByEngagementId, useAcceptPropertyOffer,finalizeOffer } = usePropertyServiceAPI()
  const [offers, setOffers] = useState([])
  const { user } = useAuth();

  const { engagedProperty } = useAppSelector(state => state.property)

  console.log(engagedProperty)

  const { data: propertyOffers, isLoading: offerLoading, error,refetch } = useFetchPropertyCounterOffers(engagedProperty.propertyId?.toString(), engagedProperty?.listingId?.toString());

  const getEngagedProperty = () => {
    setLoading(true)
    getOffersPropertyByEngagementId.mutate(engagedProperty?.id, {
      onSuccess: (response) => {
        setLoading(false)
        // console.log(response?.data)
        setOffers(response?.data?.data?.getPropertyOfferByEngagementId)
        // setPropertyData(response.data?.data?.getBuyerAgentEngagementsByAgentId)
      },
      onError: (error) => {
        console.log('Error in mutation: ', error)
        setLoading(false)
      }
    })
  }
  console.log(propertyOffers)

  useEffect(() => {
    getEngagedProperty()
  }, [])

  const filteredOffers = propertyOffers?.filter((offer: any) => offer?.status != 'PENDING');
  console.log(filteredOffers)
  const offerStatusHandler = async (offerId: string, status: string) => {
    const input = { offerId, status }
    await useAcceptPropertyOffer.mutate(input)
  }
  const offerFinalization = async (offerId: string, status: string) => {
    const input = { offerId, status }
    finalizeOffer.mutate({
      id:offerId,
      finalizeType:"isBuyer"
    })
  }

  return (
    <section>
      <HeadingLevelTwo className='font-semibold'>
        Counter Offers
      </HeadingLevelTwo>

      {/* Display Loading Spinner if fetching data */}
      {loading ? (
        <div className='flex justify-center items-center'>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
        </div>
      ) : (
        <section className='my-8 flex flex-wrap gap-8'>
          {/* If no offers are found, show a message */}
          {filteredOffers?.length === 0 ? (
            <div className='w-full text-center'>
              <p className='text-sm font-bold text-gray-600'>You have not made any counter offer yet!</p>
            </div>
          ) : (
            filteredOffers?.map((offer: any) => {
              const {
                expiryDate, price,
                financeType, downPayment,
                cashAmount, createdBy, createdAt
              } = offer;
              console.log(offer)
              return (
                <OfferCard
                  key={offer.id}
                  offerId={offer.id} // Make sure to provide a unique key for each card
                  expiryDate={expiryDate}
                  financeType={financeType}
                  downPayment={downPayment}
                  cashAmount={cashAmount}
                  price={price}
                  user={createdBy}
                  status={offer?.status}
                  offer={offer}
                  offerStatusHandler={offerStatusHandler}
                  isCounterOffer={createdBy?.id != user?.id}
                  createdAt={createdAt}
                  offerFinalization={offerFinalization}
                />
              );
            })
          )}
        </section>
      )}
    </section>
  );
}

export default CounterOffers;
