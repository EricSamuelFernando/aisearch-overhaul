import UserBackButton from '@/components/dashboard/user/back-button';
import ManagePropertyContent from '@/components/property/manage/manage-property-content';
import PropertyOverview from '@/components/dashboard/main/property-overview';
import Image from 'next/image';
import { HeadingLevelTwo } from '@/components/heading';
import { Button } from '@/components/ui/button';
function ManagePropertyPage({ params }: { params: { slug: string } }) {
  return (
    <section className='px-16 py-8'>
      <UserBackButton />

      <div className='my-8 grid grid-cols-6'>
        <div className='col-span-4'>
          <ManagePropertyContent />
        </div>
        <div className='col-span-2'>
          <PropertyOverview
            className='w-full rounded-2xl bg-black p-5 text-white'
            trailColor='#454545'
            textColor='text-white'
            pathColor='white'
            streetName='50,000'
            address='Broad Street'
          />

          <div className='my-8 flex items-center justify-between gap-x-2'>
            <div className='flex items-center gap-x-4'>
              <Image
                height={70}
                width={70}
                src='/assets/images/agent-demo.png'
                objectFit='contain'
                alt='Agent'
                className='rounded-fill object'
              />
              <div className='leading-1  font-bold'>
                <p className='text-base'>Daniel Wales</p>
                <p className='text-sm text-ocOrange'>Agent</p>
              </div>
            </div>

            <Button className='md:w-[120px]' roundness='full' disabled>
              Remove
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ManagePropertyPage;
