import Heading from '@/components/heading';
import { usePreApprovalContext } from '@/providers/pre-approval-provider';
import { Delete } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import CustomInput from '@/components/customs/input';
import { FileUpload } from '@/components/file-upload';
import { Icons } from '@/components/icons';

export const LenderAffilate = () => {
  const { methods } = usePreApprovalContext();

  const { control, register } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankStatements' as unknown as never,
  });

  const handleFile = (index: number, file: FileList) => {
    methods.setValue(`bankStatements.${index}`, file);
  };

  return (
    <section className='md:w-4/5'>
      <Heading
        className='mb-4 p-0 text-xl font-normal'
        title='Add Your Details'
      />

      <section className=''>
        <section className='grid gap-4 md:grid-cols-2'>
          <CustomInput
            onChange={(e) =>
              methods.setValue('fullName', e.currentTarget.value)
            }
            value={methods.getValues('fullName')}
            labelClass='py-2 w-max block'
            label='Legal Full Name'
          />
          <CustomInput
            onChange={(e) => methods.setValue('email', e.currentTarget.value)}
            labelClass='py-2 w-max block'
            value={methods.getValues('email')}
            label='Email'
            type='email'
          />

          <div className='col-span-2'>
            <span className='block text-sm font-medium text-gray-700'>
              Attach last 3 (Three) Bank Statements
            </span>

            {fields.map((field, index) => (
              <div key={field.id} className='flex w-full items-center gap-x-2'>
                <FileUpload
                  setFile={(file: FileList) => {
                    handleFile(index, file);
                  }}
                  initialFile={methods.getValues(`bankStatements.${index}`)}
                  className='flex-1'
                />
                {fields.length > 1 ? (
                  <button type='button' onClick={() => remove(index)}>
                    <Delete />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {fields.length < 3 ? (
            <button
              onClick={() => append({} as any)}
              className='flex w-max items-center gap-x-2 text-md font-bold'
            >
              <Icons.Add className='h-4 w-4' />
              <span>Add Another File</span>
            </button>
          ) : null}
        </section>
      </section>
    </section>
  );
};
