import Pagination from '@/components/card-pagination/pagination';
import { nanoid } from 'nanoid';
import { homeEmpty } from '../../../../../../public/assets/images';
import { useSellerAgentPropertyContext } from '@/providers/agent-seller-provider';
import PropertySearchFilter from '@/components/dashboard/agent/property-searcj-filter';
import AgentEmptyState from '@/components/dashboard/main/empty-state';
import { PropCardLoader } from '@/components/buy/buy-property-card-loader';
import AgentListingItem from '@/components/dashboard/agent/agent-listing-item';
import { AgentDashbordLeftSide } from '@/components/dashboard/agent/agent-dashboard-left';

const BuyLead = () => {
  const { propertyData, filters, handlePageChange } =
    useSellerAgentPropertyContext();

  const { data, isLoading, isFetching } = propertyData;
  const properties = data?.data.data?.result;
  const total = data?.data.data?.total;
  const loading = isLoading || isFetching;

  return (
    <section className='mx-2 grid grid-cols-1 lg:grid-cols-6 lg:gap-16'>
      <div className='lg:col-span-4'>
        <PropertySearchFilter />

        {Array.isArray(properties) && properties.length < 1 && !loading ? (
          <section className='my-24'>
            <AgentEmptyState
              img={homeEmpty}
              description={'Looks like you’re new here! Let’s get started.'}
              ctaText='Add Property'
              showCTA
            />
          </section>
        ) : null}

        {loading ? (
          <div className='my-6 grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {Array.from({ length: 2 }).map(() => (
              <PropCardLoader key={nanoid()} />
            ))}
          </div>
        ) : (
          <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-6'>
            {Array.isArray(properties) && properties.length > 0
              ? properties.map((prop) => (
                  <AgentListingItem
                    type='buy-leads'
                    key={prop?._id}
                    propertyInfo={prop}
                    className='w-full  md:w-1/2'
                  />
                ))
              : null}
            <div className='w-full'>
              <Pagination
                totalPages={Math.ceil(+total! / +filters.limit!)}
                onPageChange={(page) => {
                  handlePageChange(+page);
                }}
                currentPage={+filters.page!}
                totalItems={total!}
                itemsPerPage={+filters.limit!}
              />
            </div>
          </div>
        )}
      </div>
      <aside className='lg:col-span-2'>
        <AgentDashbordLeftSide agentType='buyer' />
      </aside>
    </section>
  );
};
export default BuyLead;
