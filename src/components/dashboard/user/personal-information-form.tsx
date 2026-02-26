'use client';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';

import { ButtonLoader } from '@/components/loader';
import { PasswordInput2 } from '@/components/password-input-2';

import CustomTextInput from '@/components/text-input';
import { Button } from '@/components/ui/button';
import { cn, getProfileImageUrl } from '@/lib/utils';
import { useAuth, useAuthActions } from '@/shared/hooks/useAuth';
import { useUploadprofile, useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { CustomFileInput } from './CustomFileInput';
import Image from "next/image"
import CognitoAuth from '@/lib/cognito';

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
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [dimensionError, setDimensionError] = useState<string>('');

  useEffect(() => {
    if (data?.url) {
      updateUserMutation.mutate({ profile: data.url });
    }
  }, [data]);

  useEffect(() => {
    if (updateUserMutation.isSuccess) {

      login({
        ...user,
        firstname: user?.firstname || '',
        id: user?.id || "",
        email: user?.email || '',
        profile: data?.url || user?.profile || '',
      });
      cb?.();
    }
  }, [updateUserMutation.isSuccess]);

  const handleFileChange = (files: File[]) => {
    if (!selectedDimension) {
      setDimensionError('Please choose desired dimensions before uploading.');
      return;
    }
    setDimensionError('');
    if (files.length > 0) uploadprofileFile(files[0]);
  };



  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-2xl font-bold">Profile Picture</h2>
      <Image
        src="/assets/images/v2/pangea_logo1.jpg"
        alt="Powered by Pangea"
        width={100}
        height={100}
        className="absolute top-2 right-2 object-contain"
      />
      <div className="flex items-center gap-6">
        {user?.profile ? (
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 shadow-md cursor-pointer">
            <img
              src={getProfileImageUrl(user.profile)}
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
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Select desired dimensions/aspect
          </label>
          <select
            value={selectedDimension}
            onChange={(e) => {
              setSelectedDimension(e.target.value);
              setDimensionError('');
            }}
            className="mb-3 w-48 rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">Choose one</option>
            <option value="1:1|400x400">Square (1:1, e.g., 400x400)</option>
            <option value="3:4|600x800">Portrait (3:4, e.g., 600x800)</option>
            <option value="16:9|1280x720">Landscape (16:9, e.g., 1280x720)</option>
          </select>
          {dimensionError && (
            <p className="mb-2 text-xs text-red-600">{dimensionError}</p>
          )}
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
  const { updateUserMutation } = useUserAuthApi();
  const { login } = useAuthActions();

  const form = useForm({
    initialValues: {
      email: user?.email,
    },
  });

  useEffect(() => {
    if (updateUserMutation.isSuccess) {
      const updateUser = {
        ...user,
        email: form.values.email,
        id: user?.id || '',
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
      };
      login(updateUser);
      cb?.();
    }
  }, [updateUserMutation.isSuccess]);

  return (
    <form
      className='mt-4'
      onSubmit={form.onSubmit((values) => {
        updateUserMutation.mutate({ email: values?.email });
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
          disabled={form.values.email === user?.email || updateUserMutation.isPending}
        >
          {updateUserMutation.isPending ? <ButtonLoader /> : null}
          {updateUserMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </aside>
    </form>
  );
}

export function EditPasswordForm({ cb }: Props) {
  const { user } = useAuth();
  const { updateUserMutation } = useUserAuthApi();
  const [cognitoError, setCognitoError] = useState<string | null>(null);
  const [isCognitoUpdating, setIsCognitoUpdating] = useState(false);

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
      onSubmit={form.onSubmit(async (values) => {
        setCognitoError(null);
        const hasCognitoUser = !!CognitoAuth.getCurrentUser();

        if (hasCognitoUser) {
          try {
            setIsCognitoUpdating(true);
            await CognitoAuth.changePassword(
              values.currentPassword,
              values.newPassword
            );
          } catch (err: any) {
            setIsCognitoUpdating(false);
            const message =
              err?.message || 'Failed to change password in Cognito';
            setCognitoError(message);
            return;
          } finally {
            setIsCognitoUpdating(false);
          }
        }

        const payload: Record<string, string> = {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        };
        if (user?.email) {
          payload.email = user.email;
        }
        updateUserMutation.mutate(payload);
      })}
    >
      <h2 className='text-2xl font-bold'>Change Password</h2>
      <aside className='my-3 space-y-2'>
        {cognitoError && (
          <p className="text-sm text-red-600">{cognitoError}</p>
        )}
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
          disabled={!isValid || updateUserMutation.isPending || isCognitoUpdating}
        >
          {updateUserMutation.isPending || isCognitoUpdating ? <ButtonLoader /> : null}
          {updateUserMutation.isPending || isCognitoUpdating
            ? 'Saving...'
            : 'Change Password'}
        </Button>
      </aside>
    </form>
  );
}
