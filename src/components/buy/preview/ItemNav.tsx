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
  { hash: '#schools', title: 'Schools' },
  { hash: '#property', title: 'Property' },
  { hash: '#forecast', title: 'Forecast' },
  { hash: '#comparables', title: 'Comparables' },
];

function ItemNav({ cardRef }: Props) {
  const navSection = useRef<HTMLDivElement>(null);
  const { openCollectionModal } = useCollectionModal();
  const [hash, setHash] = useState<string>('#overview');
  const hashRef = useRef(hash);
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

  useEffect(() => {
    hashRef.current = hash;
  }, [hash]);

  useEffect(() => {
    const handlePreviewNav = (event: Event) => {
      const customEvent = event as CustomEvent<string | { hash?: string }>;
      if (typeof customEvent.detail === 'string') {
        setHash(customEvent.detail);
        return;
      }
      if (customEvent.detail && typeof customEvent.detail === 'object' && typeof customEvent.detail.hash === 'string') {
        setHash(customEvent.detail.hash);
      }
    };
    window.addEventListener('preview-nav', handlePreviewNav);
    return () => {
      window.removeEventListener('preview-nav', handlePreviewNav);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ids = navItems.map((item) => item.hash.replace('#', ''));
    const getHeaderOffset = () => {
      const rootValue = getComputedStyle(document.documentElement)
        .getPropertyValue('--main-header-height')
        .trim();
      const parsed = parseFloat(rootValue);
      const header = Number.isFinite(parsed) ? parsed : 80;
      const navHeight = navSection.current?.getBoundingClientRect().height ?? 70;
      return header + navHeight + 8;
    };

    const updateActiveHash = () => {
      const offset = getHeaderOffset();
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));
      if (!elements.length) return;

      const overviewEl = elements.find((el) => el.id === 'overview');
      const nonOverview = elements.filter((el) => el.id !== 'overview');
      let activeId = overviewEl?.id || elements[0].id;

      const firstReal = nonOverview[0];
      if (overviewEl && firstReal) {
        const firstRealTop = firstReal.getBoundingClientRect().top - offset;
        if (firstRealTop > 48) {
          const nextHash = `#${overviewEl.id}`;
          if (nextHash !== hashRef.current) {
            hashRef.current = nextHash;
            setHash(nextHash);
          }
          return;
        }
      }

      let closestTop = Number.NEGATIVE_INFINITY;
      for (const el of nonOverview.length ? nonOverview : elements) {
        const top = el.getBoundingClientRect().top - offset;
        if (top <= 16 && top > closestTop) {
          closestTop = top;
          activeId = el.id;
        }
      }

      if (closestTop === Number.NEGATIVE_INFINITY) {
        // Nothing is near the top line yet; keep current selection to avoid flicker.
        return;
      }

      const nextHash = `#${activeId}`;
      if (nextHash !== hashRef.current) {
        hashRef.current = nextHash;
        setHash(nextHash);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveHash();
        ticking = false;
      });
    };

    updateActiveHash();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, []);


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
      id="property-preview-nav"
      className="sticky z-40 w-full bg-white py-3 shadow-sm xl:py-0 xl:h-[70.1px]"
      style={{ top: 'var(--main-header-height, 80px)' }}
    >
      <div className="mx-auto w-full max-w-[1920px] px-2 sm:px-4 md:px-6 xl:px-[78px] min-[1536px]:max-[1919px]:px-[52px] min-[1920px]:px-[94px]">
        {/* MOBILE: Two rows  */}
        <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between xl:grid xl:grid-cols-[64px_1fr_206px] xl:items-center xl:gap-0 xl:h-[70px]'>

          {/* Row 1 (Back + Share + Save) */}
          <div className='flex items-center justify-between w-full md:w-auto xl:w-[64px] xl:justify-start'>
            {/* Back */}
            <button
              onClick={() => router.back()}
              className='flex items-center gap-1 text-sm font-medium text-black hover:opacity-80 xl:text-[16px] xl:leading-[24px] xl:w-[64px] xl:h-[24px]'
            >
              <ChevronLeft className='h-4 w-4 xl:h-[16px] xl:w-[16px]' />
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
          <div className='flex items-center justify-start overflow-x-auto scrollbar-hide snap-x snap-mandatory md:flex-1 md:justify-center md:overflow-visible md:gap-4 xl:w-[1088.5px] xl:h-[70.1px] xl:flex-none xl:justify-self-center xl:justify-center xl:gap-[32px]'>
            {navItems.map((item) => (
              <Link
                key={item.hash}
                href={item.hash}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', item.hash);
                    setHash(item.hash);
                    window.dispatchEvent(new CustomEvent('preview-nav', { detail: item.hash }));
                  }
                }}
                className={cn(
                  'snap-start whitespace-nowrap px-4 py-2 text-sm font-medium text-[#818181] xl:px-[12px] xl:py-[20px] xl:text-[18px] xl:h-full xl:flex xl:items-center',
                  hash === item.hash
                    ? 'border-b-[2px] border-black bg-[#F8F8F8] text-black'
                    : 'xl:hover:border-b-[2px] xl:hover:border-black xl:hover:text-black'
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Desktop only: Share + Save (right side) */}
          <div className='hidden md:flex items-center gap-4 ml-2 xl:ml-0 xl:w-[206px] xl:h-[33px] xl:justify-end'>
            <button
              onClick={handleShare}
              className='flex items-center gap-2 text-black hover:text-black xl:text-[16px]'
            >
              <Icons.Share className='h-4 w-4 xl:h-[16px] xl:w-[16px]' />
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                if (isLoggedIn) {
                  const propertyImage = propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.public?.imageUrl || propertyData?.image || '/assets/images/property-placeholder.jpg';
                  openCollectionModal(propertyId, propertyImage, fetchSnaps);
                } else {
                  router.push('/login');
                }
              }}
              className='flex items-center gap-2 text-black hover:text-black xl:text-[16px]'
            >
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
                className='text-black hover:text-black xl:h-[16px] xl:w-[16px]'
              />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemNav;
