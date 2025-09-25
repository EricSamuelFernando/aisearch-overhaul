import React, { useEffect, useState } from 'react';
import { HeadingLevelTwo } from '@/components/heading';
import { OfferCard } from '@/components/property/offer-card';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAppSelector } from '@/lib/hook';

type Props = {};

function BuyerOffers({}: Props) {
  const [loading, setLoading] = useState(false);
  const { getOffersPropertyByEngagementId, useUpdatePropertyOffer:{mutate:updatePropertyOffer,status:offerStatus },finalizeOffer:{mutate:finalizeOffer , status:finalizeOfferStatus} } = usePropertyServiceAPI();
  const [offers, setOffers] = useState<any[]>([]);
  const { user } = useAuth();
  const {engagedProperty} = useAppSelector(state => state.property)
  //const [offerStatus , setOfferStatus] = useState(false)


  const offerStatusHandler = async (offerId: string, status: string) => {
    const input = { offerId, status }
     updatePropertyOffer(input)

  }

  const getEngagedProperty = () => {
    setLoading(true);
    getOffersPropertyByEngagementId.mutateAsync(engagedProperty?.id, {
      onSuccess: (response) => {
        setLoading(false);
        setOffers(response?.data?.data?.getPropertyOfferByEngagementId);
      },
      onError: (error) => {
        console.log('Error in mutation: ', error);
        setLoading(false);
      }
    });
  };


useEffect(() => {
  getEngagedProperty();
}, [offerStatus , finalizeOfferStatus]);

  const offerFinalization = (offerId: string, status: string) => {
    const input = { offerId, status }
    setLoading(true);

    finalizeOffer(
        {
            id: offerId,
            finalizeType: "isBuyer"
        },
        {
            onSuccess: () => {
    
            },
            onError: (error) => {
                console.error("Error finalizing offer:", error);
            },
            onSettled: () => {
                setLoading(false);  // This will run regardless of success or failure
            }
        }
    );
};

console.log(offerStatus)


  //const filteredOffers = offers?.filter((offer: any) => offer?.createdBy?.id === user?.id);

  return (
    <section>
      <HeadingLevelTwo className='font-semibold'>My Offers</HeadingLevelTwo>

      {/* Display Loading Spinner if fetching data */}
      {loading ? (
        <div className='flex justify-center items-center'>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
        </div>
      ) : (
        <section className='my-8 flex flex-wrap gap-8'>
          {/* If no offers are found, show a message */}
          {offers?.length === 0 ? (
            <div className='w-full text-center'>
              <p className='text-sm font-bold text-gray-600'>You haven not created any offer yet!</p>
            </div>
          ) : (
            offers?.map((offer: any) => {
              const {
                expiryDate, price,
                financeType, downPayment,
                cashAmount, createdBy,createdAt
              } = offer;
              return (
                <OfferCard
                key={offer.id} 
                offerFinalization={offerFinalization}
                offerId={offer.id}
                expiryDate={expiryDate}
                financeType={financeType}
                downPayment={downPayment}
                cashAmount={cashAmount}
                user={createdBy}
                status={offer?.status}
                price={price}
                offer={offer}
                offerStatusHandler={offerStatusHandler}
                isShowFinalize={(createdBy?.id !== user?.id && !offer?.isBuyer)}
                isCounterOffer={createdBy?.id !== user?.id}
                createdAt={createdAt} 
                />
              );
            })
          )}
        </section>
      )}
    </section>
  );
}

export default BuyerOffers;
