'use client';

import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useForm } from '@mantine/form';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import CustomTextInput from '@/components/text-input';

export const VerifyForgotPasswordCodeForm = () => {
  const codeForm = useForm({
    initialValues: {
      code: '',
    },
  });

  const { verifyPasswordResetCodeMutation } = useUserAuthApi();

  return (
    <form
      className='h-max min-w-[400px]'
      onSubmit={codeForm.onSubmit((values) => {
        verifyPasswordResetCodeMutation.mutate({ code: values?.code });
      })}
    >
      <section>
        <section className=''>
          <h3 className='mb-4 text-xl font-medium'>Enter Code</h3>
        </section>
        <section className=''>
          <p className='mb-2 text-sm  font-medium text-grey-100'>
            Enter Verification Code from your mail
          </p>
        </section>
        <CustomTextInput
          placeholder='Code...'
          className='w-full py-4'
          maxLength={6}
          type='text'
          {...codeForm.getInputProps('code')}
        />
        <Button
          disabled={
            verifyPasswordResetCodeMutation.isPending ||
            codeForm.values.code.length !== 6
          }
          size='lg'
          className='w-full disabled:bg-primary-main/20'
          roundness='md'
          type='submit'
          variant='ocreal'
        >
          {verifyPasswordResetCodeMutation.isPending ? <ButtonLoader /> : null}
          Continue
        </Button>
      </section>
    </form>
  );
};
