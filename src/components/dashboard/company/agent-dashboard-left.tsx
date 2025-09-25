import { nanoid } from 'nanoid';
import { useFetchAgentInvites } from '@/hooks/api/agent/useAgentInvites';
import RequestLoader from '../../main/reuqest-loader';
import BuyerRequest from './buyer-request';
import ToursList from '../main/tours-list';

type LeftSideProp = {
  agentType: 'buyer' | 'seller';
};

export const AgentDashbordLeftSide = ({ agentType }: LeftSideProp) => {
  const { agentInvites, invitesActions } = useFetchAgentInvites(agentType);
  const invitesData = agentInvites?.data?.data?.data?.result;

  return (
    <>
      <section>
        <h3 className='mb-6 text-xl font-bold'>
          {agentType === 'buyer' ? 'Buyer' : 'Seller'} Request
        </h3>
        {agentInvites.isFetching
          ? Array.from({ length: 2 }).map(() => (
              <section key={nanoid()} className='my-3'>
                <RequestLoader />
              </section>
            ))
          : Array.isArray(invitesData) && invitesData.length > 0
            ? invitesData.slice(0, 2).map((item) => (
                <section key={item._id} className='my-6'>
                  <BuyerRequest requestInfo={item} actions={invitesActions} />
                </section>
              ))
            : null}

        {Array.isArray(invitesData) &&
        invitesData.length < 1 &&
        !agentInvites.isFetching ? (
          <section className='my-4'>
            <RequestLoader />
          </section>
        ) : null}
      </section>
      <ToursList />
    </>
  );
};
