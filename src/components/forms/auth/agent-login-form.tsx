'use client';

import { useForm } from '@mantine/form';
import Link from 'next/link';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import PasswordInput from '@/components/password-input';
import CustomTextInput from '@/components/text-input';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
export const AgentLoginForm = () => {
  const { agentLoginMutation } = useUserAuthApi();
  const form = useForm({
    initialValues: {
      password: '',
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '📧 Oops! That email format isn\'t quite right. Let\'s fix it together!'),
      password: (value) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value,
        )
          ? null
          : 'Minimum 8 characters, at least 1 letter, 1 number and 1 special character',
    },
  });

  return (
    <section>
      <h2 className='mb-4 text-center text-3xl font-[700]'>Login</h2>
      <form
        className='mx-auto flex w-[350px] flex-col items-center  justify-center'
        onSubmit={form.onSubmit((values) => {
          agentLoginMutation.mutate(values);
        })}
      >
        <CustomTextInput placeholder='Email' {...form.getInputProps('email')} />
        <PasswordInput
          placeholder='Password'
          className='w-full py-4'
          {...form.getInputProps('password')}
        />
        {/* <CustomButton
          className={`${
            agentLoginMutation.isPending ? 'bg-black/20 ' : ' bg-black '
          } py-3 rounded-md w-full font-bold text-white space-b-8`}
          type='submit'
          loading={agentLoginMutation.isPending}
          label="Login"
        /> */}

        <Button
          disabled={agentLoginMutation.isPending}
          size='lg'
          className='mb-8 w-full font-bold'
          roundness='default'
          type='submit'
        >
          {agentLoginMutation.isPending ? <ButtonLoader /> : null} Login
        </Button>

        <section className='my-4 flex w-full items-center justify-between'>
          <div>
            <p className='text-sm'>
              <Link className='text-primary-main' href='/password-reset'>
                Forgot Password?
              </Link>
            </p>
          </div>
          <div>
            <p className='text-sm'>
              {`Don't have an account?`}
              <Link className='pl-1 text-gray-500' href='/register'>
                Register
              </Link>
            </p>
          </div>
        </section>
      </form>
    </section>
  );
};
