import { CustomInput } from '@/components/customs/input';
import { CustomDropdown } from '@/components/customs/menu';
import Heading from '@/components/heading';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { DownloadIcon, MailIcon, Trash2Icon, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Fragment } from 'react';
import DocumentCard from '../main/document-card';
import TourSchedule from '../main/tour-schedule';
import { AgentPropertyCard, AgentPropertyCardButtons } from '../agent/agent-property-card';

type Props = {};

function AgentDocument({}: Props) {
  const params = useSearchParams();
  const id = params?.get('id');
  const { propertyOffers } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = propertyOffers;
  const res = data?.data?.data?.result;

  const loading = isLoading || isFetching;

  return (
    <section className='grid grid-cols-9  gap-8'>
      {loading ? (
        <div className='col-span-9 flex justify-center'>Loading...</div>
      ) : null}

      {!loading && res ? (
        <Fragment>
          <aside className='col-span-6'>
            <div className='my-6 grid grid-cols-10 items-center border-b border-b-gray-400 pb-8'>
              <div className='col-span-6 flex items-center gap-x-4'>
                <Button
                  variant='outline'
                  roundness='full'
                  className='min-w-[120px]'
                >
                  Upload
                </Button>

                <Button roundness='full' className='min-w-[120px]'>
                  Docu Sign
                </Button>
                <div className='flex flex-1 items-center gap-x-4'>
                  <DownloadIcon />
                  <Trash2Icon />
                </div>
              </div>

              <div className='col-span-4 flex items-center gap-x-2'>
                <UserDropdown />
                <CustomInput
                  leftSection={<Icons.Search className='h-4 w-4' />}
                  placeholder='Search File'
                  className='rounded-3xl'
                />
              </div>
            </div>

            <div className='my-4 grid grid-cols-2 justify-between gap-y-4'>
              {res && res[0]?.documents?.length > 0 ? (
                res[0]?.documents.map((doc: any, i) => (
                  <DocumentCard
                    key={doc._id}
                    documentId={doc._id}
                    title={doc.name}
                    description={''}
                  />
                ))
              ) : (
                <div className='text-grey-500 text-center'>
                  <p>No Documents Found</p>
                </div>
              )}
            </div>
          </aside>

          <aside className='col-span-3'>
            <AgentPropertyCard buttons={<AgentPropertyCardButtons />} />
            <div>
              <div className='flex items-center justify-between py-6'>
                <Heading title='Upcoming Tour' />
                <Link href='/dashboard/seller' className='text-[1.125rem]'>
                  View all
                </Link>
              </div>
              <TourSchedule showButton={true} />
            </div>

            <div className='my-6'>
              <SellerOwnerCard name='Daniel Smith' />
            </div>
          </aside>
        </Fragment>
      ) : null}
    </section>
  );
}

export default AgentDocument;

export const SellerOwnerCard = ({
  name = 'Daniel Smith',
}: {
  name: string;
}) => {
  return (
    <div className='flex items-center justify-between rounded-lg bg-grey-880 p-4'>
      <div className='flex items-center gap-x-4'>
        <Image
          height={50}
          width={50}
          src='/assets/images/agent-demo.png'
          objectFit='contain'
          alt='Agent'
          className='rounded-fill object'
        />
        <div>
          <h2 className='font-bold'>{name}</h2>
          <p className='text-sm text-[#585858]'>Seller/Owner</p>
        </div>
      </div>

      <div className='flex flex-col items-center text-center'>
        <div className='relative flex w-max   justify-center text-center'>
          <span className=' absolute -right-2 -top-1 h-4 w-4 rounded-full bg-ocOrange  text-center text-xs font-bold text-white'>
            2
          </span>
          <MailIcon />
        </div>
        <p className='text-sm text-[#585858]'>Unread Messages</p>
      </div>
    </div>
  );
};

const UserDropdown = () => {
  return (
    <CustomDropdown
      buttonLabel={
        <div className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-black'>
          <User color='white' />
        </div>
      }
      items={<SellerAgentDropdownContent />}
    />
  );
};

const SellerAgentDropdownContent = () => {
  return (
    <div className='min-h-[300px] w-[350px] rounded-lg bg-black p-4'>
      <CustomInput
        placeholder='Email Address'
        className='border-none bg-[#333] text-grey-710'
      />

      <div className='space-y-3 py-4'>
        <RevokeAccessCard />
        <RevokeAccessCard />
      </div>
    </div>
  );
};

const RevokeAccessCard = () => {
  return (
    <div className='flex items-start justify-between'>
      <div>
        <h3 className='text-md font-bold text-white'>Daniel Smith</h3>
        <span className='text-xs text-[#585858]'>Seller/Owner</span>
      </div>

      <span className='cursor-pointer text-xs text-[#969696] hover:text-ocOrange'>
        Revoke Access
      </span>
    </div>
  );
};
