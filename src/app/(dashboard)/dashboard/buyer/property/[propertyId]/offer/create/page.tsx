import UserBackButton from '@/components/dashboard/user/back-button';
import CreateUserOffers from '@/components/dashboard/user/created-user-offers';
import MakeOfferContent from '@/components/dashboard/user/make-offer-content';
import { ClaimsFormProvider } from '@/providers/claim-context';

function MakeOffer() {
  return (
    <section className='px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16 py-1 sm:py-2 md:py-4 lg:py-6 xl:py-8'>
      <ClaimsFormProvider>
        <UserBackButton />
        <MakeOfferContent />
        <CreateUserOffers/>
      </ClaimsFormProvider>
    </section>
  );
}

export default MakeOffer;



