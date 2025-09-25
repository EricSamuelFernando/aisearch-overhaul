import CustomInput from '@/components/customs/input';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export const RestrictedDocument = () => {
  return (
    <div className='my-auto grid h-full  place-content-center text-center'>
      <div className='relative flex h-[150px] w-full items-center justify-center'>
        <Image
          width={120}
          height={120}
          src='/assets/images/restricted.svg'
          objectFit='contain'
          alt='Agent'
        />
      </div>
      <p className='my-6 text-grey-150'>Document access restricted</p>

      <Button roundness='md'>Request Access</Button>
    </div>
  );
};

function Disclosure() {
  return (
    <div className='h-full'>
      {/* <RestrictedDocument /> */}
      <div className='p-[25px]'>
        <CustomInput
          placeholder='Search Document'
          leftSection={<Icons.Search className='h-4 w-4' />}
        />
      </div>
    </div>
  );
}

export default Disclosure;
