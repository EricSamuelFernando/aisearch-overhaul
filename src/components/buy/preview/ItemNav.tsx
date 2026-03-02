// import { cn } from '@/lib/utils';
// import { motion } from 'framer-motion';
// import { ChevronLeft, Heart } from 'lucide-react';
// import Link from 'next/link';
// import { useParams, useRouter } from 'next/navigation';
// import { RefObject, useEffect, useRef, useState } from 'react';
// import { Icons } from '../../icons';
// import { useCollectionModal } from '@/providers/collection-modal-provider';
// import { LoginModal } from '@/components/modals/login-modal';
// import { useAuth } from '@/shared/hooks/useAuth';
// import { SNAPHOMZ_MAIN_APPLICATION_URL } from '@/shared/constants/env';
// import { useSelector } from 'react-redux';

// type Props = {
//   cardRef: RefObject<HTMLDivElement>;
// };

// const navItems = [
//   {
//     hash: '#overview',
//     title: 'Overview',
//   },
//   {
//     hash: '#location',
//     title: 'Location',
//   },
//   {
//     hash: '#property',
//     title: 'Property',
//   },
//   {
//     hash: '#history',
//     title: 'History',
//   },
//   {
//     hash: '#analysis',
//     title: 'Analysis',
//   },
//   {
//     hash: '#schools',
//     title: 'Schools',
//   },
//   {
//     hash: '#comparables',
//     title: 'Comparables',
//   },
// ];

// function ItemNav({ cardRef }: Props) {
//   const navSection = useRef<HTMLDivElement>(null);
//   const { openCollectionModal } = useCollectionModal();
//   const [isNavIntersecting, setIsNavIntersecting] = useState(false);
//   const { isLoggedIn } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const [hash, setHash] = useState<string>('#overview');
//   const params = useParams();
//   const router = useRouter();
//   const propertyData = useSelector((state: any) => state.property.property);
//   const propertyId = params?.propertyId as string;

//   const Server_URL = process.env.NEXT_PUBLIC_APPLICATION_URL;

//   const propertyLink = `${Server_URL}buy/${propertyId}/prop/preview?propertyId=${propertyData?.id}&listingId=${propertyData?.listingId}`;

//   useEffect(() => {
//     setHash(window.location.hash as string);
//   }, [params]);

//   useEffect(() => {
//     const handleIntersect: IntersectionObserverCallback = (entries) => {
//       entries.forEach((entry) => {
//         if (entry.intersectionRatio > 0) {
//           setIsNavIntersecting(true);
//         } else {
//           setIsNavIntersecting(false);
//         }
//       });
//     };

//     const navbar = navSection.current;
//     const cardContainer = cardRef.current;

//     const observer = new IntersectionObserver(handleIntersect, {
//       root: null,
//       threshold: 0,
//       rootMargin: '0px',
//     });

//     if (navbar && cardContainer) {
//       observer.observe(navbar);
//       observer.observe(cardContainer);
//     }

//     return () => {
//       if (navbar && cardContainer) {
//         observer.unobserve(navbar);
//         observer.unobserve(cardContainer);
//       }
//     };
//   }, [cardRef]);

//   // const handleShare = async () => {
//   //   if (navigator.share) {
//   //     // Using the Web Share API if available
//   //     try {
//   //       await navigator.share({
//   //         title: 'Check out this property',
//   //         url: propertyLink,
//   //       });
//   //       console.log('Shared successfully');
//   //     } catch (error) {
//   //       console.error('Error sharing', error);
//   //     }
//   //   } else {
//   //     // Fallback for browsers that don't support Web Share API
//   //     alert(`Share this property: ${propertyLink}`);
//   //   }
//   // };
//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: 'Check out this property',
//           url: propertyLink,
//         });
//         console.log('Shared successfully');
//       } catch (error) {
//         console.error('Error sharing', error);
//       }
//     } else {
//       // Fallback for browsers that don't support Web Share API
//       alert(`Share this property: ${propertyLink}`);
//     }
//   };


//   return (
//     <div className='fixed left-0 top-[70px] z-20 w-full bg-grey-430 px-4 py-4 sm:px-6 md:px-8'>
//       <div className='flex flex-wrap items-center justify-evenly'>
//         {/* Navigation Items */}
//         <div >
//           <button
//             onClick={() => router.back()}
//             className='flex items-center gap-1 text-sm font-medium text-black hover:opacity-80'
//           >
//             <ChevronLeft className='h-4 w-4' />
//             <span>Back</span>
//           </button>
//         </div>
//         <div className='hidden w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-start sm:gap-4 md:inline-flex md:w-auto'>
//           {navItems.map((item) => (
//             <Link
//               key={item.hash}
//               href={item.hash}
//               className={cn(
//                 'px-4 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black',
//                 hash === item.hash &&
//                 'border-b-[2px] border-black bg-[#F8F8F8] text-black',
//               )}
//             >
//               {item.title}
//             </Link>
//           ))}
//         </div>

//         {/* Share + Save Buttons */}
//         <div className='mt-4 flex w-full justify-end gap-4 sm:mt-0 sm:w-auto'>
//           {/* Share Button */}
//           <p
//             className='flex cursor-pointer items-center gap-2 px-2.5 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black'
//             onClick={handleShare}
//           >
//             <Icons.Share className='h-4 w-4' />
//             <span>Share</span>
//           </p>

//           {/* Save Button */}
//           <p
//             className='flex cursor-pointer items-center gap-2 px-2.5 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black'
//             onClick={() => {
//               if (isLoggedIn) {
//                 openCollectionModal(propertyId, '/assets/images/property-placeholder.jpg');
//               } else {
//                 router.push("/login");
//               }
//             }}
//           >
//             <Heart className='h-4 w-4' />
//             <span>Save</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ItemNav;
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Icons } from '../../icons';
import { useCollectionModal } from '@/providers/collection-modal-provider';
import { useAuth } from '@/shared/hooks/useAuth';
import { useSelector } from 'react-redux';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { SnapzHeartButton } from '@/components/ui/snapz-heart';

type Props = {
  cardRef: RefObject<HTMLDivElement>;
};

const navItems = [
  { hash: '#overview', title: 'Overview' },
  { hash: '#property', title: 'Property' },
  { hash: '#schools', title: 'Schools' },
  { hash: '#forecast', title: 'Forecast' },
  { hash: '#comparables', title: 'Comparables' },
];

function ItemNav({ cardRef }: Props) {
  const navSection = useRef<HTMLDivElement>(null);
  const { openCollectionModal } = useCollectionModal();
  const [hash, setHash] = useState<string>('#overview');
  const { isLoggedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const propertyData = useSelector((state: any) => state.property.property);
  const propertyId = params?.propertyId as string;

  // New Logic
  const userData = useSelector((state: any) => state.auth.user);
  const { getAllSnaps } = useUserSnapAPIs();
  const [snaps, setSnaps] = useState<any[]>([]);

  const fetchSnaps = () => {
    if (userData?.id) {
      getAllSnaps.mutate(userData.id, {
        onSuccess: (data) => {
          setSnaps(data);
        },
      });
    }
  };

  useEffect(() => {
    fetchSnaps();
  }, [userData?.id]);

  const isPropertyInFavourite = (snapsList: any[]) => {
    if (!Array.isArray(snapsList)) {
      return false;
    }
    const isAvailable = snapsList.some((snap: any) =>
      snap?.favourites?.some((favourite: any) => {
        const propertyIdMatch = favourite?.propertyId === propertyData?.id;
        const listingIdMatch = favourite?.listingId === propertyData?.listingId;
        return propertyIdMatch || listingIdMatch;
      })
    );
    return isAvailable;
  };

  const isFavored = isPropertyInFavourite(snaps);

  const Server_URL = process.env.NEXT_PUBLIC_APPLICATION_URL;
  const propertyLink = `${Server_URL}/buy/${propertyId}/prop/preview?propertyId=${propertyData?.id}&listingId=${propertyData?.listingId}`;

  useEffect(() => {
    setHash(window.location.hash as string);
  }, [params]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this property',
          url: propertyLink,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      alert(`Share this property: ${propertyLink}`);
    }
  };

  return (
    <div
      ref={navSection}
      className="fixed left-0 top-[70px] z-20 w-full bg-white px-4 py-3 sm:px-6 md:px-8 shadow-sm mt-[10px] md:mt-0"
    >
      {/* MOBILE: Two rows  */}
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>

        {/* Row 1 (Back + Share + Save) */}
        <div className='flex items-center justify-between w-full md:w-auto'>
          {/* Back */}
          <button
            onClick={() => router.push('/')}
            className='flex items-center gap-1 text-sm font-medium text-black hover:opacity-80'
          >
            <ChevronLeft className='h-4 w-4' />
            <span>Back</span>
          </button>

          {/* Right: Share + Save */}
          <div className='flex items-center gap-4 md:hidden'>
            {/* Share */}
            <button
              onClick={handleShare}
              className='flex items-center gap-2 text-[#818181] hover:text-black'
            >
              <Icons.Share className='h-4 w-4' />
            </button>

            {/* Save */}
            <SnapzHeartButton
              isActive={isFavored}
              size={20}
              onClick={() => {
                if (isLoggedIn) {
                  const propertyImage = propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.public?.imageUrl || propertyData?.image || '/assets/images/property-placeholder.jpg';
                  openCollectionModal(propertyId, propertyImage, fetchSnaps);
                } else {
                  router.push('/login');
                }
              }}
              className='text-[#818181] hover:text-black'
            />
          </div>
        </div>

        {/* Row 2 (Nav Tabs) */}
        <div className='flex items-center justify-start overflow-x-auto scrollbar-hide snap-x snap-mandatory md:flex-1 md:justify-center md:overflow-visible md:gap-4'>
          {navItems.map((item) => (
            <Link
              key={item.hash}
              href={item.hash}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.hash = item.hash;
                  window.dispatchEvent(new CustomEvent('preview-nav', { detail: item.hash }));
                }
              }}
              className={cn(
                'snap-start whitespace-nowrap px-4 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black',
                hash === item.hash &&
                'border-b-[2px] border-black bg-[#F8F8F8] text-black'
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Desktop only: Share + Save (right side) */}
        <div className='hidden md:flex items-center gap-4 ml-2'>
          <button
            onClick={handleShare}
            className='flex items-center gap-2 text-[#818181] hover:text-black'
          >
            <Icons.Share className='h-4 w-4' />
          </button>

          <SnapzHeartButton
            isActive={isFavored}
            size={20}
            onClick={() => {
              if (isLoggedIn) {
                const propertyImage = propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.public?.imageUrl || propertyData?.image || '/assets/images/property-placeholder.jpg';
                openCollectionModal(propertyId, propertyImage, fetchSnaps);
              } else {
                router.push('/login');
              }
            }}
            className='text-[#818181] hover:text-black'
          />
        </div>
      </div>
    </div>
  );
}

export default ItemNav;
