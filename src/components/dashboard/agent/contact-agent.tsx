import React from 'react';
import CustomModal from '@/components/custom-modal';
import Image from 'next/image';
import CustomButton from '@/components/custom-button';
import CustomTextArea from '@/components/customs/textarea';
import Heading from '@/components/heading';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  opened: boolean;
  close: () => void;
  open: () => void;
};

function ContactAgent({ opened, close, open }: Props) {
  const [value, setValue] = useState('');

  return (
    <CustomModal
      disableEscapeClose={false}
      backdropBlur='pointer-event-auto'
      isOpen={opened}
      onClose={close}
    >
      <div className='w-full rounded-2xl bg-white px-4 md:w-[700px]'>
        <Heading
          title='Ask Oc-Sanphomz Agent James Cater a question'
          className='mb-4 text-lg'
        />
        <div className='avatar mb-5 flex items-start gap-x-6'>
          <Image
            src='/assets/images/sold-prty.jpg'
            alt={`test`}
            className='h-fit w-fit rounded-full bg-no-repeat'
            height={70}
            width={70}
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />

          <div>
            <h4 className='text-2xl text-ocOrange'>James Carter</h4>
            <p className='text-sm text-grey-400'>
              Normal Heights Snaphomz Agent
            </p>
            <p className='text-sm text-grey-400'>
              <span>James Typically replies in about </span>
              <span className='font-bold text-green-950'>6 Minutes</span>
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className='my-4'>
            <CustomTextArea
              label=''
              rows={7}
              placeholder='Write a Message'
              handleTextChange={(val) => {
                setValue(value);
              }}
            />
          </div>

          <div className='flex justify-end gap-x-2'>
            <p className='flex items-center text-sm'>
              <span>Text or Call </span>
              <span className='font-bold text-green-800'>(224) 420-9218</span>
            </p>

            {/* <CustomButton
              label="Submit"
              className="text-white py-4 bg-black w-max"
            /> */}

            <Button>Submit</Button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
}

export default ContactAgent;
