'use client';

import CustomNativeSelect from '@/components/customs/select';
import CustomInput from '@/components/customs/input';
import CreateListConatiner from './create-list-container';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';

const AddManagers = () => {
  const { filters, setFilter } = useAgentCreatePropertyContext();

  return (
    <CreateListConatiner
      className='p-[4rem]'
      form={
        <section>
          <p className='mt-6 text-gray-400'>
            Owner/Brooker will be invited, if not existing already here.
          </p>
          <section className='mt-16 grid grid-cols-2 gap-6'>
            <div>
              <CustomNativeSelect
                className='mt-[0.469rem]'
                size='lg'
                data={[
                  {
                    label: 'Owner',
                    value: 'owner',
                  },
                  {
                    label: 'Broker',
                    value: 'broker',
                  },
                ]}
                label='Choose Type'
                leftSectionPointerEvents='none'
                handleChange={(e) => {
                  setFilter({ field: 'ownerDetails', value: e });
                }}
              />
            </div>
            <div>
              <CustomInput
                placeholder='Enter email address'
                label='Email'
                className='mt-[0.469rem] w-full'
                onChange={(e) => {
                  setFilter({ field: 'email', value: e.currentTarget.value });
                }}
                value={filters?.email}
              />
            </div>
          </section>
        </section>
      }
      heading={'Who will manage This property?'}
      subHeading={'Add managers'}
    />
  );
};

export default AddManagers;
