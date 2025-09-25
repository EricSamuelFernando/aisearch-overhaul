import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Icons } from '../../icons';
import { useCollectionModal } from '@/providers/collection-modal-provider';
import { LoginModal } from '@/components/modals/login-modal';
import { useAuth } from '@/shared/hooks/useAuth';
import { SNAPHOMZ_MAIN_APPLICATION_URL } from '@/shared/constants/env';
import { useSelector } from 'react-redux';

type Props = {
  cardRef: RefObject<HTMLDivElement>;
};

const navItems = [
  {
    hash: '#overview',
    title: 'Overview',
  },
  {
    hash: '#location',
    title: 'Location',
  },
  {
    hash: '#property',
    title: 'Property',
  },
  {
    hash: '#history',
    title: 'History',
  },
  {
    hash: '#analysis',
    title: 'Analysis',
  },
  {
    hash: '#schools',
    title: 'Schools',
  },
  {
    hash: '#comparables',
    title: 'Comparables',
  },
];

function ItemNav({ cardRef }: Props) {
  const navSection = useRef<HTMLDivElement>(null);
  const { openCollectionModal } = useCollectionModal();
  const [isNavIntersecting, setIsNavIntersecting] = useState(false);
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hash, setHash] = useState<string>('#overview');
  const params = useParams();
  const router = useRouter();
  const propertyData = useSelector((state: any) => state.property.property);
  const propertyId = params?.propertyId as string;

  const Server_URL = process.env.NEXT_PUBLIC_APPLICATION_URL;

  const propertyLink = `${Server_URL}buy/${propertyId}/prop/preview?propertyId=${propertyData?.id}&listingId=${propertyData?.listingId}`;

  useEffect(() => {
    setHash(window.location.hash as string);
  }, [params]);

  useEffect(() => {
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          setIsNavIntersecting(true);
        } else {
          setIsNavIntersecting(false);
        }
      });
    };

    const navbar = navSection.current;
    const cardContainer = cardRef.current;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      threshold: 0,
      rootMargin: '0px',
    });

    if (navbar && cardContainer) {
      observer.observe(navbar);
      observer.observe(cardContainer);
    }

    return () => {
      if (navbar && cardContainer) {
        observer.unobserve(navbar);
        observer.unobserve(cardContainer);
      }
    };
  }, [cardRef]);

  // const handleShare = async () => {
  //   if (navigator.share) {
  //     // Using the Web Share API if available
  //     try {
  //       await navigator.share({
  //         title: 'Check out this property',
  //         url: propertyLink,
  //       });
  //       console.log('Shared successfully');
  //     } catch (error) {
  //       console.error('Error sharing', error);
  //     }
  //   } else {
  //     // Fallback for browsers that don't support Web Share API
  //     alert(`Share this property: ${propertyLink}`);
  //   }
  // };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this property',
          url: propertyLink,
        });
        console.log('Shared successfully');
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      alert(`Share this property: ${propertyLink}`);
    }
  };


  return (
    <div className='fixed left-0 top-[70px] z-20 w-full bg-grey-430 px-4 py-4 sm:px-6 md:px-8'>
      <div className='flex flex-wrap items-center justify-between'>
        {/* Navigation Items */}
        <div className='hidden w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-start sm:gap-4 md:inline-flex md:h-16 md:w-auto'>
          {navItems.map((item) => (
            <Link
              key={item.hash}
              href={item.hash}
              className={cn(
                'h-full px-4 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black',
                hash === item.hash &&
                'border-b-[2px] border-black bg-[#F8F8F8] text-black',
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Share + Save Buttons */}
        <div className='mt-4 flex w-full justify-end gap-4 sm:mt-0 sm:w-auto'>
          {/* Share Button */}
          <p
            className='flex cursor-pointer items-center gap-2 px-2.5 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black'
            onClick={handleShare}
          >
            <Icons.Share className='h-4 w-4' />
            <span>Share</span>
          </p>

          {/* Save Button */}
          <p
            className='flex cursor-pointer items-center gap-2 px-2.5 py-2 text-sm font-medium text-[#818181] hover:border-b-[2px] hover:border-black hover:text-black'
            onClick={() => {
              if (isLoggedIn) {
                openCollectionModal(propertyId, '/assets/images/property-placeholder.jpg');
              } else {
                router.push("/login");
              }
            }}
          >
            <Heart className='h-4 w-4' />
            <span>Save</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ItemNav;
