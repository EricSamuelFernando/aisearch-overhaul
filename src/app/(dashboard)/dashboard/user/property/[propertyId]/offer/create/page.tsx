import UserBackButton from '@/components/dashboard/user/back-button';
import MakeOfferContent from '@/components/dashboard/user/make-offer-content';
import { ClaimsFormProvider } from '@/providers/claim-context';

function MakeOffer() {
  return (
    <section className='px-16 py-8'>
      <ClaimsFormProvider>
        <UserBackButton />
        <MakeOfferContent />
      </ClaimsFormProvider>
    </section>
  );
}

export default MakeOffer;
