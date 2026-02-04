'use client';

import CustomModal from '@/components/custom-modal';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import {
  EditPasswordForm,
  PersonalInfoForm,
  ProfileForm,
} from '@/components/dashboard/user/personal-information-form';
import { PersonalData } from '@/components/dashboard/user/personal-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserPropfilePreference from '@/components/dashboard/user/user-profile-preference';
import { getInitials } from '@/lib/helpers';

enum Field {
  PROFILE = 'PROFILE',
  Name = 'Name',
  Email = 'Email',
  Password = 'Password',
}

function Profile() {
  const [opened, { open, close }] = useDisclosure(false);
  const [field, setField] = useState<Field | null>(null);
  const [showProfileImage, setShowProfileImage] = useState(true);

  const { user } = useAuth();
  const initials = getInitials(user?.firstname, user?.lastname);

  useEffect(() => {
    setShowProfileImage(true);
  }, [user?.profile]);

  const renderForm = () => {
    switch (field) {
      case Field.PROFILE:
        return <ProfileForm cb={close} />;
      case Field.Name:
        return <PersonalInfoForm cb={close} />;
      case Field.Password:
        return <EditPasswordForm cb={close} />;
      default:
        return null;
    }
  };

  console.log(user)

  const handleEdit = (field: Field) => {
    setField(field);
    open();
  };

  return (
    <main className='mx-auto px-12'>
      <section className='py-10'>
        <div className='flex w-full items-center justify-between'>
          <h2 className='text-4xl font-bold'>Profile</h2>

          {/* <div className='flex items-center justify-between gap-x-8'>
            <div className='subscription-status font-[600]'>
              <span className='block leading-tight'>Subscription Status</span>
              <span className='leading-tight text-ocOrange'>Premium</span>
            </div>
            <Link
              href={'/payments'}
              className='rounded-full bg-black px-4 py-2 text-white'
            >
              Subscribe
            </Link>
          </div> */}

        </div>
      </section>


      <div className=' flex  w-full items-center justify-between '>
        {
          user?.profile && showProfileImage ? (
            <img
              src={user.profile} // ensure this is a valid full URL if needed
              alt="Profile Picture"
              className="h-20 w-20 rounded-full object-cover border border-gray-300"
              onError={() => setShowProfileImage(false)}
            />
          ) : (
            <div className="h-20 w-20 rounded-full   uppercase bg-gray-300 flex items-center justify-center text-3xl font-semibold text-black border border-gray-300">
              {initials || 'NA'}
            </div>
          )
        }


        <button
          onClick={() => {
            handleEdit(Field.PROFILE);
          }}
          className='min-w-[140px] cursor-pointer  rounded-full  border  border-black bg-transparent px-6 py-1 text-black'
        >
          Update Profile
        </button>

      </div>



      <section className='py-8'>
        <h3 className='border-b-[1px] border-b-grey-590 pb-4 font-bold'>
          Personal Data
        </h3>

        <div className='py-4'>

          <PersonalData
            title='Full Name'
            info={`${user?.firstname!} ${user?.lastname!}`}
            buttonText='Edit'
            handleClick={() => {
              handleEdit(Field.Name);
            }}
          />
          <PersonalData title='Email' info={user?.email!} buttonText="" />
          <PersonalData
            title='Password'
            info='********'
            buttonText='Edit'
            handleClick={() => {
              handleEdit(Field.Password);
            }}
          />
        </div>
      </section>

      <section className='py-8'>
        <UserPropfilePreference />
      </section>

      <section className='py-8'>
        <h3 className='border-b-[1px] border-b-grey-590 pb-4 font-bold'>
          App Connection
        </h3>

        <div className='py-4'>
          <PersonalData
            title='Google'
            info='Connected'
            buttonText='Disconnect'
            handleClick={() => { }}
          />

          <PersonalData
            title='Docu Sign'
            info='Not Connected'
            buttonText='Edit'
            handleClick={() => {
              console.log('Hello');
            }}
          />

          <PersonalData
            title='Apple'
            info='Not Connected'
            buttonText='Edit'
            handleClick={() => {
              console.log('Hello');
            }}
          />
        </div>
      </section>

      <CustomModal
        isOpen={opened}
        onClose={close}
        className='backdrop-blur'
        contentClassName='w-[35rem]'
      >
        {renderForm()}
      </CustomModal>
    </main>
  );
}

export default Profile;
