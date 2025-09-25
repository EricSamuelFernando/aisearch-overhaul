import React, { ReactNode } from 'react';

interface CreateListContainerProps {
  form: ReactNode;
  heading: string;
  subHeading: React.ReactNode;
  className?: string;
}

const CreateListConatiner: React.FC<CreateListContainerProps> = ({
  heading,
  subHeading,
  form,
  className,
}) => {
  return (
    <section className={`container ${className}`}>
      <section className='grid grid-cols-2'>
        <aside className='item-center flex flex-col justify-between'>
          <div>
            <h3 className='w-[60%] text-[2.4rem] font-medium'>{heading}</h3>
            <div className='mt-8 text-[1.3rem] font-medium leading-relaxed text-primary-main'>
              {subHeading}
            </div>
          </div>
        </aside>
        <aside className='flex h-[400px] flex-col justify-between'>
          {form}
        </aside>
      </section>
    </section>
  );
};

export default CreateListConatiner;
