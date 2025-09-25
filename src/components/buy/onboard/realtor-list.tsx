import SkeletonLoader from '@/components/skeleton-loader';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { usePreapprovalActions } from '@/shared/hooks/useAddPreapproval';
import { RealtorProfile } from '.';

export const RealtorList = () => {
  const { setSelectedAgent } = usePreapprovalActions();
  const { getAgents } = useHandleAgent();
  const { data, isLoading, isFetching } = getAgents;
  const loading = isFetching || isLoading;
  const agents = data?.data?.data?.result;

  return (
    <section className='col-span-1'>
      <h2 className='mb-8 text-2xl font-[500]'>Choose Realtor form the list</h2>

      <div className='h-[380px]  space-y-4 overflow-y-auto'>
        {loading ? <SkeletonLoader className='h-[100px] w-full' /> : null}

        {!loading &&
          agents &&
          agents.length > 0 &&
          agents?.map((agent) => {
            return (
              <RealtorProfile
                key={agent._id}
                onClick={() => {
                  setSelectedAgent(agent);
                }}
                id={agent._id}
                realtorName={agent.fullname}
              />
            );
          })}

        {!loading && agents && agents.length < 0 && (
          <div className='text-small'>
            <span className='font-[500]'>
              We do not have agent on the platfom yet
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
