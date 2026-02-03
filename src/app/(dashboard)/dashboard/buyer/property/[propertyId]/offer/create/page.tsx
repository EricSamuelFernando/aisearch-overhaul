import UserBackButton from '@/components/dashboard/user/back-button';
import CreateUserOffers from '@/components/dashboard/user/created-user-offers';
import MakeOfferContent from '@/components/dashboard/user/make-offer-content';
import { ClaimsFormProvider } from '@/providers/claim-context';

function MakeOffer() {
  return (
    <section className='px-4 sm:px-6 lg:px-16 py-8'>
      <ClaimsFormProvider>
        <UserBackButton />
        <MakeOfferContent />
        <CreateUserOffers />
      </ClaimsFormProvider>
    </section>
  );
}

export default MakeOffer;


