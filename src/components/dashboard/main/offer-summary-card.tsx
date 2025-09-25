import React from 'react';
import { Button } from '@/components/ui/button';
import { AgentOfferResponse } from '@/interfaces/property.interface';
import { formatCurrency } from '@/lib/utils';
import { OfferSummaryCardItem } from './offerSummaryItem';
import RejectOfferModal from '@/components/modals/reject-offer-modal';
import AcceptOfferModal from '@/components/modals/accept-offer-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useSelector } from 'react-redux';
import { useAuth } from '@/shared/hooks/useAuth';

export const OfferSummaryCard = ({
  offer,
  isCounterOfferPage,
  coutnerOfferHandler,
}: {
  offer:any;
  isCounterOfferPage?: boolean;
  coutnerOfferHandler?:any
}) => {
  const params = useSearchParams();
  const id = params?.get('id');
  const { getOfferDetails, acceptOffer, rejectOffer } = useAgentOfferApi(
    id as string,
  );
  const {user} = useAuth()
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);
  const { data, isLoading, isFetching } = getOfferDetails;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = React.useState(false);
  const { useAcceptPropertyOffer } = usePropertyServiceAPI()
  console.log(offer)
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/seller/offer/seller-offer?id=${offer.id}&type=counter-offers`);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenAcceptModal = () => {
    setIsAcceptModalOpen(true);
  };

  const handleCloseAcceptModal = () => {
    setIsAcceptModalOpen(false);
  };

  const handleAcceptOffer = () => {
    const payload = {
      header: 'A title about how I want your money',
      body: `Hello ${offer.buyerAgent.fullname},\n\nHappy to inform you that your offer has been accepted, and I’ll be in touch soon with next steps.`,
      offerId: offer?.id,
      status: true,
      notifyOtherParties: true,
    };
    // useAcceptPropertyOffer.mutate(payload, {
    //   onSuccess: () => {
    //     setIsAcceptModalOpen(false);
    //   },
    // });
    router.push(`/dashboard/seller/${claimedProperty?.propertyId}/transaction-dashboard`)
  };

  const handleRejectOffer = () => {
    const payload = {
      header: 'A title about how I want your money',
      body: `Hello ${offer?.buyerAgent?.fullname},\n\nI am writing to inform you that your offer has been declined. Thank you for your interest. I hope we can work together in the future.`,
      offerId: offer.id,
      response: false,
      notifyOtherParties: false,
    };
    rejectOffer.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };
  console.log(offer , user?.id  , offer?.createdBy?.id === user?.id)
  const type = params?.get('type')

  return (
    <>
      <div className='my-0 w-[400px] rounded-xl bg-grey-430 px-4 pb-8'>
        <div className='my-8 grid grid-cols-2 items-center  justify-between gap-5 px-4 pt-8'>
          <OfferSummaryCardItem
            title='Offer Price'
            description={formatCurrency(
              +offer?.price,
              offer?.offerPrice?.currency || 'USD',
            )}
            descriptionClass='font-bold'
          />
          <OfferSummaryCardItem
            title='Loan Amount'
            description={formatCurrency(
              +offer?.cashAmount,
              offer?.loanAmount?.currency || 'USD',
            )}
          />
          <OfferSummaryCardItem
            title='Finance Type'
            description={offer?.financeType}
          />
          <OfferSummaryCardItem
            title='Down Payment'
            description={formatCurrency(
              +offer?.downPayment,
              offer?.downPayment?.currency || 'USD',
            )}
          />

          <OfferSummaryCardItem
            title='Finance Contingency'
            description={`${offer?.financeContingencyDays} Days`}
          />
          <OfferSummaryCardItem
            title='Appraisal Contingency'
            description={`${offer?.appraisalContingencyDays} Days`}
          />
          <OfferSummaryCardItem
            title='Inspection Contingency'
            description={`${offer?.inspectionContingencyDays} Days`}
          />
          <OfferSummaryCardItem
            title='Close Escrow'
            description={`${offer?.closeEscrowDays} Days `}
          />
        </div>
        <div className='flex items-center  gap-x-10'>
          {type === "counter-offers" && offer?.createdBy?.id != user?.id ? (
            <>
              <Button
                variant='outline'
                className='w-[150px]'
                roundness='full'
                onClick={() => router.back()}
              >
                Cancel
              </Button>



              <Button className='w-[150px]' roundness='full' type='submit' onClick={coutnerOfferHandler}>
                Submit
              </Button>
            </>
          ) : type != "counter-offers" && offer?.createdBy?.id != user?.id ? (
            <>
              <Button
                variant='outline'
                className='w-[150px]'
                roundness='full'
                onClick={handleClick}
              >
                Counter Offer
              </Button>

             

              {/* <Button
                className='w-[150px]'
                roundness='full'
                onClick={handleOpenAcceptModal}
              >
                Accept Offer
              </Button> */}
            </>
          ):""}
        </div>
      </div>
      {type != "counter-offers"  && offer?.createdBy?.id != user?.id &&  (
        <div
          className='mt-4 cursor-pointer text-center text-red-400'
          onClick={handleOpenModal}
        >
          Reject Offer
        </div>
      )}

      {isModalOpen && (
        <RejectOfferModal
          agent={{
            image: offer?.buyerAgent?.image,
            name: offer?.buyerAgent?.fullname,
            email: offer?.buyerAgent?.email,
            address: offer?.buyerAgent?.region,
          }}
          offerId={offer.id}
          onClose={handleCloseModal}
          onReject={handleRejectOffer}
        />
      )}

      {isAcceptModalOpen && (
        <AcceptOfferModal
          agent={{
            image: offer?.createdBy?.profile,
            address: offer?.buyerAgent?.region,
            name:`${offer?.createdBy?.firstName} ${offer?.createdBy?.lastName} `,
            // licence={selectedOffer?.buyerAgent?.licence_number}
            email:offer?.createdBy?.email,
         
          }}
          offerId={offer?.id}
          onClose={handleCloseAcceptModal}
          onAccept={handleAcceptOffer}
        />
      )}
    </>
  );
};
