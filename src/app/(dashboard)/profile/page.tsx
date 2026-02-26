// 'use client';

// import CustomModal from '@/components/custom-modal';
// import { useAuth } from '@/shared/hooks/useAuth';
// import { useDisclosure } from '@mantine/hooks';
// import { useEffect, useState } from 'react';
// import {
//   EditPasswordForm,
//   PersonalInfoForm,
//   ProfileForm,
// } from '@/components/dashboard/user/personal-information-form';
// import { PersonalData } from '@/components/dashboard/user/personal-data';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import UserPropfilePreference from '@/components/dashboard/user/user-profile-preference';
// import { getInitials } from '@/lib/helpers';

// enum Field {
//   PROFILE = 'PROFILE',
//   Name = 'Name',
//   Email = 'Email',
//   Password = 'Password',
// }

// function Profile() {
//   const [opened, { open, close }] = useDisclosure(false);
//   const [field, setField] = useState<Field | null>(null);
//   const [showProfileImage, setShowProfileImage] = useState(true);
//   const [searchHistory, setSearchHistory] = useState<any[]>([]);
//   const [historyPage, setHistoryPage] = useState(1);
//   const [historyPerPage] = useState(10);
//   const [historyTotalPages, setHistoryTotalPages] = useState(1);
//   const [historyMeta, setHistoryMeta] = useState<{
//     totalItems?: number;
//     hasNext?: boolean;
//     hasPrev?: boolean;
//   }>({});
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [historyError, setHistoryError] = useState<string | null>(null);
//   const AI_BASE_URL =
//     process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || '';

//   const { user } = useAuth();
//   const initials = getInitials(user?.firstname, user?.lastname);

//   useEffect(() => {
//     setShowProfileImage(true);
//   }, [user?.profile]);

//   useEffect(() => {
//     if (!user?.id) return;
//     const controller = new AbortController();

//     const loadSearchHistory = async () => {
//       setHistoryLoading(true);
//       setHistoryError(null);
//       try {
//         const params = new URLSearchParams({
//           user_id: String(user.id),
//           page: String(historyPage),
//           per_page: String(historyPerPage),
//         });
//         const base = AI_BASE_URL.replace(/\/$/, '');
//         const response = await fetch(`${base}/api/search_history?${params.toString()}`, {
//           signal: controller.signal,
//         });
//         if (!response.ok) {
//           throw new Error('Failed to load search history');
//         }
//         const json = await response.json();
//         const items =
//           json?.history ||
//           json?.data ||
//           json?.items ||
//           json?.results ||
//           (Array.isArray(json) ? json : []);
//         const totalPages =
//           json?.pagination?.total_pages ||
//           json?.total_pages ||
//           (json?.total && historyPerPage
//             ? Math.max(1, Math.ceil(Number(json.total) / historyPerPage))
//             : 1);
//         setSearchHistory(items);
//         setHistoryTotalPages(totalPages);
//         setHistoryMeta({
//           totalItems: json?.pagination?.total_items ?? json?.total,
//           hasNext: json?.pagination?.has_next_page,
//           hasPrev: json?.pagination?.has_previous_page,
//         });
//       } catch (err: any) {
//         if (err?.name !== 'AbortError') {
//           setHistoryError(err?.message || 'Failed to load search history');
//           setSearchHistory([]);
//         }
//       } finally {
//         setHistoryLoading(false);
//       }
//     };

//     loadSearchHistory();

//     return () => controller.abort();
//   }, [user?.id, historyPage, historyPerPage]);

//   const renderForm = () => {
//     switch (field) {
//       case Field.PROFILE:
//         return <ProfileForm cb={close} />;
//       case Field.Name:
//         return <PersonalInfoForm cb={close} />;
//       case Field.Password:
//         return <EditPasswordForm cb={close} />;
//       default:
//         return null;
//     }
//   };

//   console.log(user)

//   const handleEdit = (field: Field) => {
//     setField(field);
//     open();
//   };

//   const formatTimestamp = (value: string) => {
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return value;
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };

//   return (
//     <main className='mx-auto px-12'>
//       <section className='py-10'>
//         <div className='flex w-full items-center justify-between'>
//           <h2 className='text-4xl font-bold'>Profile</h2>

//           {/* <div className='flex items-center justify-between gap-x-8'>
//             <div className='subscription-status font-[600]'>
//               <span className='block leading-tight'>Subscription Status</span>
//               <span className='leading-tight text-ocOrange'>Premium</span>
//             </div>
//             <Link
//               href={'/payments'}
//               className='rounded-full bg-black px-4 py-2 text-white'
//             >
//               Subscribe
//             </Link>
//           </div> */}

//         </div>
//       </section>


//         <div className=' flex  w-full items-center justify-between '>
//           {
//             user?.profile && showProfileImage ? (
//               <img
//                 src={user.profile} // ensure this is a valid full URL if needed
//                 alt="Profile Picture"
//                 className="h-20 w-20 rounded-full object-cover border border-gray-300"
//                 onError={() => setShowProfileImage(false)}
//               />
//             ) : (
//               <div className="h-20 w-20 rounded-full   uppercase bg-gray-300 flex items-center justify-center text-3xl font-semibold text-black border border-gray-300">
//                 {initials || 'NA'}
//               </div>
//             )
//           }


//           <button
//             onClick={() => {
//               handleEdit(Field.PROFILE);
//             }}
//             className='min-w-[140px] cursor-pointer  rounded-full  border  border-black bg-transparent px-6 py-1 text-black'
//           >
//             Update Profile
//           </button>

//         </div>



//       <section className='py-8'>
//         <h3 className='border-b-[1px] border-b-grey-590 pb-4 font-bold'>
//           Personal Data
//         </h3>

//         <div className='py-4'>

//           <PersonalData
//             title='Full Name'
//             info={`${user?.firstname!} ${user?.lastname!}`}
//             buttonText='Edit'
//             handleClick={() => {
//               handleEdit(Field.Name);
//             }}
//           />
//           <PersonalData title='Email' info={user?.email!} buttonText="" />
//           <PersonalData
//             title='Password'
//             info='********'
//             buttonText='Edit'
//             handleClick={() => {
//               handleEdit(Field.Password);
//             }}
//           />
//         </div>
//       </section>

//       <section className='py-8'>
//         <UserPropfilePreference />
//       </section>

//       <section className='py-8'>
//         <h3 className='border-b-[1px] border-b-grey-590 pb-4 font-bold'>
//           Search History
//         </h3>
//         <div className='py-4'>
//           {historyLoading ? (
//             <p className='text-sm text-gray-500'>Loading search history...</p>
//           ) : historyError ? (
//             <p className='text-sm text-red-600'>{historyError}</p>
//           ) : searchHistory.length === 0 ? (
//             <p className='text-sm text-gray-500'>No search history found.</p>
//           ) : (
//             <div className='space-y-4'>
//               <div className='hidden md:grid grid-cols-12 gap-3 rounded-lg bg-gray-50 px-4 py-2 text-xs font-semibold uppercase text-gray-500'>
//                 <div className='col-span-4'>Search</div>
//                 <div className='col-span-4'>Location</div>
//                 <div className='col-span-2'>Photos</div>
//                 <div className='col-span-2'>Date</div>
//               </div>

//               <div className='grid grid-cols-1 gap-3'>
//                 {searchHistory.map((item, idx) => {
//                   const natural = item?.natural_query || item?.query || item?.search || '';
//                   const searchQuery = item?.search_query || {};
//                   const location = [
//                     searchQuery?.address,
//                     searchQuery?.city,
//                     searchQuery?.state,
//                   ].filter(Boolean).join(', ');
//                   const photos = searchQuery?.include_photos ? 'Yes' : 'No';
//                   const size = searchQuery?.size ? `Size ${searchQuery.size}` : '';
//                   const createdAt = item?.timestamp || item?.created_at || item?.createdAt || '';
//                   const label = natural || location || `Search ${idx + 1}`;

//                   return (
//                     <div
//                       key={item?.id || `${idx}-${label}`}
//                       className='rounded-lg border border-gray-200 px-4 py-3'
//                     >
//                       <div className='grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-3'>
//                         <div className='md:col-span-4'>
//                           <p className='text-sm font-semibold text-black'>{label}</p>
//                           {size ? (
//                             <p className='text-xs text-gray-500'>{size}</p>
//                           ) : null}
//                         </div>
//                         <div className='md:col-span-4'>
//                           <p className='text-sm text-gray-800'>{location || 'N/A'}</p>
//                         </div>
//                         <div className='md:col-span-2'>
//                           <p className='text-sm text-gray-800'>{photos}</p>
//                         </div>
//                         <div className='md:col-span-2'>
//                           <p className='text-sm text-gray-800'>
//                             {createdAt ? formatTimestamp(createdAt) : 'N/A'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {historyTotalPages > 1 && (
//                 <div className='flex items-center justify-between pt-2'>
//                   <button
//                     className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
//                     onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
//                     disabled={historyPage === 1 || historyMeta.hasPrev === false}
//                   >
//                     Previous
//                   </button>
//                   <p className='text-sm text-gray-600'>
//                     Page {historyPage} of {historyTotalPages}
//                     {historyMeta.totalItems ? ` • ${historyMeta.totalItems} total` : ''}
//                   </p>
//                   <button
//                     className='rounded-full border border-black px-4 py-1 text-sm text-black disabled:opacity-50'
//                     onClick={() =>
//                       setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
//                     }
//                     disabled={historyPage >= historyTotalPages || historyMeta.hasNext === false}
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </section>

//       <section className='py-8'>
//         <h3 className='border-b-[1px] border-b-grey-590 pb-4 font-bold'>
//           App Connection
//         </h3>

//         <div className='py-4'>
//           <PersonalData
//             title='Google'
//             info='Connected'
//             buttonText='Disconnect'
//             handleClick={() => { }}
//           />

//           <PersonalData
//             title='Docu Sign'
//             info='Not Connected'
//             buttonText='Edit'
//             handleClick={() => {
//               console.log('Hello');
//             }}
//           />

//           <PersonalData
//             title='Apple'
//             info='Not Connected'
//             buttonText='Edit'
//             handleClick={() => {
//               console.log('Hello');
//             }}
//           />
//         </div>
//       </section>

//       <CustomModal
//         isOpen={opened}
//         onClose={close}
//         className='backdrop-blur'
//         contentClassName='w-[35rem]'
//       >
//         {renderForm()}
//       </CustomModal>
//     </main>
//   );
// }

// export default Profile;


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
import { getProfileImageUrl } from '@/lib/utils';

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
              src={getProfileImageUrl(user.profile)} // ensure this is a valid full URL if needed
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