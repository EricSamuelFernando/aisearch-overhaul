import AgentBackButton from '@/components/dashboard/agent/back-button';
import MakeOfferContent from '@/components/dashboard/agent/make-offer-content';
import { ClaimsFormProvider } from '@/providers/claim-context';

function MakeOffer() {
  return (
    <section className='px-16 py-8'>
      <ClaimsFormProvider>
        <AgentBackButton />
        <MakeOfferContent />
      </ClaimsFormProvider>
    </section>
  );
}

export default MakeOffer;
