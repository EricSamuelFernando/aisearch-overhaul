'use client';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

import { ButtonLoader } from '@/components/loader';
import { PasswordInput2 } from '@/components/password-input-2';

import CustomTextInput from '@/components/text-input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth, useAuthActions } from '@/shared/hooks/useAuth';
import { useUploadprofile, useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { CustomFileInput } from './CustomFileInput';

type Props = {
  cb?: () => void;
};

// export function PersonalInfoForm({ cb }: Props) {
//   const { user } = useAuth();

//   console.log(user);

//   const { updateUserMutation } = useUserAuthApi();

//   const form = useForm({
//     initialValues: {
//       firstname: user?.firstname,
//       lastname: user?.lastname,
//     },
//   });

//   useEffect(() => {
//     if (updateUserMutation.isSuccess) {
//       cb?.();
//     }
//   }, [updateUserMutation.isSuccess, cb]);

//   return (
//     <form
//       className='mt-4'
//       onSubmit={form.onSubmit((values) => {

//         updateUserMutation.mutate({
//           firstName: values?.firstname || '',
//           lastName: values?.lastname || '',
//         });
//       })}
//     >
//       <h2 className='text-2xl font-bold'>Personal Information</h2>
//       <aside className='my-3 space-y-4'>

//         <CustomFileInput
//           handleFile={(files) => {
//             form.setFieldValue('profile', files[0]);
//           }}
//         />



//         <CustomTextInput
//           label='First Name'
//           placeholder='First Name'
//           {...form.getInputProps('firstname')}
//         />

//         <CustomTextInput
//           label='Last Name'
//           placeholder='Last Name'
//           {...form.getInputProps('lastname')}
//         />

//         <Button
//           size='lg'
//           className={cn('my-10 mt-8 block w-full font-semibold')}
//           disabled={!form.isValid || updateUserMutation.isPending}
//         >
//           {updateUserMutation.isPending ? <ButtonLoader /> : null}
//           {updateUserMutation.isPending ? 'Saving...' : 'Save'}
//         </Button>
//       </aside>
//     </form>
//   );
// }

export function ProfileForm({ cb }: Props) {
  const { user } = useAuth();
  const { login } = useAuthActions();
  const { updateUserMutation } = useUserAuthApi();
  const { isUploading, error, data, uploadprofileFile } = useUploadprofile();

  useEffect(() => {
    if (data?.url) {
      updateUserMutation.mutate({ profile: data.url });
    }
  }, [data]);

  useEffect(() => {
    if (updateUserMutation.isSuccess) {
      
      login({
        ...user,
        firstname:user?.firstname || '',
        id: user?.id || "",
        email: user?.email || '',
        profile: data?.url || user?.profile || '',
      });
      cb?.();
    }
  }, [updateUserMutation.isSuccess]);

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      uploadprofileFile(files[0]);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-2xl font-bold">Profile Picture</h2>

      <div className="flex items-center gap-6">
        {user?.profile ? (
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 shadow-md cursor-pointer">
            <img
              src={user.profile}
              alt="Profile"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full text-white text-sm font-semibold">
              Change
            </div>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-500 font-semibold">
            No Image
          </div>
        )}

        <div>
          <CustomFileInput handleFile={handleFileChange} />
          {isUploading && <p className="mt-2 text-sm text-gray-600">Uploading...</p>}
          {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
        </div>
      </div>
    </div>
  );
}


export function PersonalInfoForm({ cb }: Props) {
  const { user } = useAuth();
  const { updateUserMutation } = useUserAuthApi();
  const { login } = useAuthActions();

  const form = useForm({
    initialValues: {
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
    },
  });

  useEffect(() => {
    if (updateUserMutation.isSuccess) {
      const updateUser = {
        ...user,
        ...form.getValues(),
        id: user?.id || '',
        email: user?.email || '',
      };

      login(updateUser);
      cb?.();
    }
  }, [updateUserMutation.isSuccess]);

  return (
    <form
      className="mt-4"
      onSubmit={form.onSubmit((values) => {
        updateUserMutation.mutate({
          firstName: values.firstname,
          lastName: values.lastname,
        });
      })}
    >
      <h2 className="text-2xl font-bold">Personal Information</h2>
      <aside className="my-3 space-y-4">
        <CustomTextInput
          label="First Name"
          placeholder="First Name"
          {...form.getInputProps('firstname')}
        />
        <CustomTextInput
          label="Last Name"
          placeholder="Last Name"
          {...form.getInputProps('lastname')}
        />

        <Button
          size="lg"
          className={cn('my-10 mt-8 block w-full font-semibold')}
          disabled={!form.isValid || updateUserMutation.isPending}
        >
          {updateUserMutation.isPending ? <ButtonLoader /> : null}
          {updateUserMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </aside>
    </form>
  );
}



export function EditEmailForm({ cb }: Props) {
  const { user } = useAuth();
  const { updateUserProfileMutation } = useUserAuthApi();

  const form = useForm({
    initialValues: {
      email: user?.email,
    },
  });

  useEffect(() => {
    if (updateUserProfileMutation.isSuccess) {
      cb?.();
    }
  }, [updateUserProfileMutation.isSuccess]);

  return (
    <form
      className='mt-4'
      onSubmit={form.onSubmit((values) => {
        updateUserProfileMutation.mutate({ email: values?.email });
      })}
    >
      <h2 className='text-2xl font-bold'>Personal Information</h2>
      <aside className='my-3 space-y-2'>
        <CustomTextInput
          label='Email'
          placeholder='Email'
          {...form.getInputProps('email')}
        />

        <Button
          size='lg'
          className={cn('w-full font-semibold')}
          disabled={
            form.values.email === user?.email ||
            updateUserProfileMutation.isPending
          }
        >
          {updateUserProfileMutation.isPending ? <ButtonLoader /> : null}
          {updateUserProfileMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </aside>
    </form>
  );
}

export function EditPasswordForm({ cb }: Props) {
  const { updateUserMutation } = useUserAuthApi();

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) =>
        value.length < 4 ? 'Current password is required' : null,
      newPassword: (value) =>
        value.length < 4 ? 'New password must be at least 4 characters' : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  useEffect(() => {
    if (updateUserMutation.isSuccess) {
      cb?.();
    }
  }, [updateUserMutation.isSuccess]);

  const isValid =
    form.values.currentPassword.length > 3 &&
    form.values.newPassword.length > 3 &&
    form.values.confirmPassword.length > 3 &&
    form.isValid();

  return (
    <form
      className='mt-4'
      onSubmit={form.onSubmit((values) => {
        updateUserMutation.mutate({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
      })}
    >
      <h2 className='text-2xl font-bold'>Change Password</h2>
      <aside className='my-3 space-y-2'>
        <div>
          <label className='mb-2 block font-medium text-gray-700'>
            Current Password
          </label>
          <PasswordInput2
            placeholder='Current Password'
            className='h-12'
            {...form.getInputProps('currentPassword')}
          />
        </div>

        <div>
          <label className='mb-2 block font-medium text-gray-700'>
            New Password
          </label>
          <PasswordInput2
            placeholder='New Password'
            className='h-12'
            {...form.getInputProps('newPassword')}
          />
        </div>

        <div>
          <label className='mb-2 block font-medium text-gray-700'>
            Confirm New Password
          </label>
          <PasswordInput2
            placeholder='Confirm New Password'
            className='h-12'
            {...form.getInputProps('confirmPassword')}
          />
        </div>

        <Button
          type='submit'
          size='lg'
          className={cn('w-full font-semibold')}
          disabled={!isValid || updateUserMutation.isPending}
        >
          {updateUserMutation.isPending ? <ButtonLoader /> : null}
          {updateUserMutation.isPending ? 'Saving...' : 'Change Password'}
        </Button>
      </aside>
    </form>
  );
}
