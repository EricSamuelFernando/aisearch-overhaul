// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Heart, PlusIcon, Users } from 'lucide-react';
// import { v4 as uuidv4 } from 'uuid';
// import Image from 'next/image';
// import { useSelector } from 'react-redux';
// import CustomModal from '../shared/custom-modal';
// import { Button } from '../ui/button';
// import { cn } from '@/lib/utils';
// import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
// import { success } from '../alert/notify';
// import { useRouter } from 'next/navigation';
// import { reverse } from 'lodash';

// interface CollectionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   propertyId?: string;
//   propertyImage?: string;
// }

// const CollectionModal: React.FC<CollectionModalProps> = ({
//   isOpen,
//   onClose,
//   propertyId,
//   propertyImage
// }) => {
//   const router = useRouter()
//   const [snaps, setSnaps] = useState<any[]>([]);
//   const [newCollectionName, setNewCollectionName] = useState("");
//   const [showInput, setShowInput] = useState(false);
//   const [step, setStep] = useState(1);
//   const [createdSnapId,setCreatedSnapId] = useState(null);
//   const [agentEmail, setAgentEmail] = useState('');
//   const propertyData = useSelector((state: any) => state.property.property);
//   const {
//     createNewSnap,
//     getAllSnaps,
//     createFavourite,
//     createParticipents
//   } = useUserSnapAPIs()
//   const userData = useSelector((state: any) => state.auth.user)
//   const snapId = uuidv4();
//   const randomLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/snaps/${snapId}`;
//   const handleCreateCollection = () => {
//     if (!newCollectionName.trim()) return;

//     const newSnap = {
//       id: Date.now().toString(),
//       name: newCollectionName,
//     };
//     setSnaps((prev) => [...prev, newSnap]);
//     setNewCollectionName("");
//   };

//   const handleCreateCollaborative = () => {
//     console.log("SDFSDFsd");

//     setShowInput(true)
//   };

//   const inviteAgent = () => {
//     const data = {
//       snapId:createdSnapId,
//       email:agentEmail,
//       status:"pending"
//     }
//     createParticipents.mutateAsync(data,{
//       onSuccess:(response:any)=>{
//         if(response?.data?.createSnapsParticipant?.success==="true"){
//           setStep(1);
//           handleCreateFavourite(createdSnapId || "")
//           setAgentEmail('');
//           success({message:"Great! Your invite is on its way"})
//           onClose()
//         }
//       }
//     })
//     console.log('Invited agent:', agentEmail);
//     setAgentEmail('');

//   };

//   const handleCreateFavourite = (snapId: string) => {
//     if (snapId) {
//       const data = {
//         snapId,
//         name: propertyData?.listing?.courtesyOf,
//         address: propertyData?.listing?.address?.unparsedAddress,
//         city: propertyData?.listing?.address?.city,
//         zipCode: propertyData?.listing?.address?.zipCode,
//         price: +propertyData?.listing?.listPriceLow,
//         image: propertyData?.public?.imageUrl,
//         bedRooms: +propertyData?.public?.bedrooms,
//         bathRooms: "" + propertyData?.public?.bathrooms,
//         sqft: "" + propertyData?.public?.lotSquareFeet,
//         listingId: propertyData?.listingId,
//         propertyId: propertyData?.id
//       }
//       createFavourite.mutate(data, {
//         onSuccess: (data) => {
//           console.log("Data : ",data);
//           success({
//             message: "All set! It's now in your favorites"
//           })
//           onClose()
//         },
//         onError: (error) => {
//           console.log("Error creating favourite:", error);
//         }
//       })
//     }
//   }
//   const createSnap = () => {
//     createNewSnap.mutate({
//       name: newCollectionName,
//       link: randomLink,
//       userId: userData?.id
//     }, {
//       onSuccess: (data) => {
//         setSnaps((prev) => [...prev, data?.data?.createSnap]);
//         // setShowInput(false);
//         console.log("data : ",data);
//         setCreatedSnapId(data?.data?.createSnap?.id);
//         setStep(2)
//         // onClose()

//       }
//     });
//   }

//   const getAllSnapsByUserId = () => {
//     getAllSnaps.mutate(userData?.id, {
//       onSuccess: (data) => {
//         setSnaps(data)
//       }
//     });
//   }
//   useEffect(() => {
//     return () => {
//       setShowInput(false);
//     }
//   }, [])

//   useEffect(() => {
//     getAllSnapsByUserId()
//   }, [userData])

//   return (
//     <CustomModal
//       isOpen={isOpen}
//       onClose={onClose}
//       contentClassName="p-0 w-[480px] rounded-2xl"
//     >
//       <div className="flex flex-col p-6">
//         {/* Header */}
//         <div className="flex items-center gap-3">
//           {propertyImage && (
//             <div className="relative h-14 w-14 rounded-md overflow-hidden">
//               <img
//                 src={propertyData?.listing?.media?.primaryListingImageUrl}
//                 alt="Property"
//                 className="object-cover"
//               />
//             </div>
//           )}
//           <div>
//             <h3 className="text-lg font-semibold">Saved to favorites</h3>
//             <p className="text-gray-500 text-sm">Private</p>

//           </div>
//           <div className="ml-auto">
//             <Heart className="h-6 w-6 fill-orange-500 text-orange-500" />
//           </div>
//         </div>

//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold">Snapz</h2>
//           {/* View Snapz Button */}
//           {showInput?<button
//             onClick={() => {
//               setShowInput(false);
//               setStep(1)
//             }}
//             className="text-sm text-orange-500 "
//           >
//             Back
//           </button>:null}
//         </div>

//         {showInput ? (
//           <>
//             {
//               showInput ? (
//                 <div className="">
//                   {step === 1 ? (
//                     <form
//                       className="flex flex-col gap-4 mb-6"
//                       onSubmit={(e) => {
//                         e.preventDefault();
//                         createSnap();
//                       }}
//                     >
//                       <input
//                         type="text"
//                         value={newCollectionName}
//                         onChange={(e) => setNewCollectionName(e.target.value)}
//                         placeholder="Enter new snapz name"
//                         className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                       />
//                       <button
//                         type="submit"
//                         disabled={!newCollectionName.trim()}
//                         className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-md transition"
//                       >
//                         Create Snapz
//                       </button>
//                     </form>
//                   ) : (
//                     <form
//                       className="flex flex-col gap-4 mb-6"
//                       onSubmit={(e) => {
//                         e.preventDefault();
//                         inviteAgent();
//                       }}
//                     >
//                       <input
//                         type="email"
//                         value={agentEmail}
//                         onChange={(e) => setAgentEmail(e.target.value)}
//                         placeholder="Enter agent email"
//                         className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//                       />
//                       <button
//                         type="submit"
//                         disabled={!agentEmail.trim()}
//                         className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-md transition"
//                       >
//                         Invite Agent
//                       </button>
//                     </form>
//                   )}
//                 </div>
//               ) : <div onClick={() => setShowInput(true)}>
//                 <button
//                   onClick={handleCreateCollection}
//                   className="flex flex-col items-center justify-center p-8 mb-6 w-full bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
//                 >
//                   <div className="p-4 rounded-full bg-white mb-3">
//                     <PlusIcon className="h-6 w-6 text-gray-500" />
//                   </div>
//                   <span className="text-orange-500 font-medium">Create new snapz</span>
//                 </button>
//               </div>
//             }
//           </>
//         ) : (
//           <div className="flex flex-col gap-3 mb-6">
//            {snaps?.slice().reverse().slice(0, 3).map((collection) => (
//   <div
//     key={collection.id}
//     className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
//     onClick={(e) => {
//       e.preventDefault();
//       handleCreateFavourite(collection.id);
//     }}
//   >
//     <span className="font-medium text-gray-800">{collection.name}</span>
//     <Heart className="h-4 w-4 text-orange-500" />
//   </div>
// ))}

//              {true?<button
//             onClick={() => {
//               setShowInput(false);
//               onClose()
//               router.push("/account")
//             }}
//             className="text-sm text-right text-orange-500 "
//           >
//             View All Snapz
//           </button>:null}
//           </div>
//         )}

//         {/* Collaborative Button */}
//         <button
//           onClick={handleCreateCollaborative}
//           className={cn(
//             "flex items-center gap-4 p-4 border border-gray-200 rounded-xl",
//             "hover:bg-gray-50 transition-colors w-full"
//           )}
//         >
//           <div className="flex-shrink-0 bg-black p-3 rounded-md">
//             <Users className="h-5 w-5 text-white" />
//           </div>
//           <div className="text-left">
//             <h3 className="font-semibold">Create a collaborative snapz</h3>
//             <p className="text-sm text-gray-500">Invite agents to a saved snapz for collaboration</p>
//           </div>
//           <div className="ml-auto">
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
//               <path d="M9 18l6-6-6-6" />
//             </svg>
//           </div>
//         </button>
//       </div>
//     </CustomModal>
//   );
// };

// export default CollectionModal;

import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Heart, Lock, PlusIcon, Users, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import CustomModal from '../shared/custom-modal';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { useNotificationApi } from '@/hooks/api/user/useNotification';
import { success, error } from '../alert/notify';
import { useRouter } from 'next/navigation';
import { reverse } from 'lodash';
import { SnapzHeartButton } from '@/components/ui/snapz-heart';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyImage?: string;
  onSuccess?: () => void;
}

const resolveAgentSnapzUrl = () => {
  const localFallback = 'http://localhost:3000/snapz';
  const prodFallback = 'https://demo-agent.snaphomz.com/snapz';
  const fallback =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? localFallback
      : prodFallback;

  const configuredUrl =
    process.env.NEXT_PUBLIC_AGENT_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_AGENT_URL?.trim() ||
    '';

  if (!configuredUrl) return fallback;

  try {
    const parsed = new URL(configuredUrl);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const isApiHost = host.includes('api.snaphomz.com');
    const isAuthOrGraphqlPath = path.includes('/auth') || path.includes('/graphql');

    if (isApiHost || isAuthOrGraphqlPath) {
      return fallback;
    }

    parsed.pathname = '/snapz';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return fallback;
  }
};

const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyImage,
  onSuccess
}) => {
  const router = useRouter();
  const [snaps, setSnaps] = useState<any[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  // showInput is only used for the collaborative snapz creation flow
  const [showInput, setShowInput] = useState(false);
  const [step, setStep] = useState(1);
  const [createdSnapId, setCreatedSnapId] = useState(null);
  const [inviteType, setInviteType] = useState<'co-buyer' | 'agent' | 'other'>('co-buyer');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [savingToMyFav, setSavingToMyFav] = useState(false);
  // New: controls the inline quick-create input triggered by +
  const [showQuickCreateInput, setShowQuickCreateInput] = useState(false);
  const [quickSnapName, setQuickSnapName] = useState('');
  const quickInputRef = useRef<HTMLInputElement>(null);
  const lastCreatedSnapIdRef = useRef<string | null>(null);

  const propertyData = useSelector((state: any) => state.property.property);
  const {
    createNewSnap,
    getAllSnaps,
    createFavourite,
    createParticipents,
    toggleFavourite,
    reclaimMySnaps,
  } = useUserSnapAPIs();
  const { notificationsQuery } = useNotificationApi();
  const userData = useSelector((state: any) => state.auth.user);
  const accountType = String(userData?.account_type || userData?.accountType || '').toLowerCase();
  const isAgentAccount = accountType === 'agent';
  const snapId = uuidv4();
  const randomLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/snaps/${snapId}`;
  const agentSnapzUrl = resolveAgentSnapzUrl();

  const handleOpenAgentSnapz = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.location.assign(agentSnapzUrl);
    }
  };

  const handleCreateCollaborative = () => {
    setShowInput(true);
  };

  const handleInvite = () => {
    const data = {
      snapId: createdSnapId,
      email: partnerEmail,
      status: "pending",
      accountType: inviteType === 'agent' ? 'agent' : inviteType === 'other' ? 'other' : 'buyer'
    };
    createParticipents.mutateAsync(data, {
      onSuccess: (response: any) => {
        if (response?.data?.createSnapsParticipant?.success === "true") {
          setStep(1);
          // handleCreateFavourite(createdSnapId || "");
          handleToggleFavourite(createdSnapId || "");
          setPartnerEmail('');
          success({
            message: `Great! Your ${inviteType === 'agent' ? 'agent' : inviteType === 'other' ? 'collaboration' : 'co-buyer'} invite is on its way`,
          });
          onClose();
        } else {
          error({ message: response?.data?.createSnapsParticipant?.message || "Failed to send invite" });
        }
      },
      onError: (err: any) => {
        console.error("Invite error:", err);
        error({ message: "An error occurred while sending invite." });
      }
    });
  };

  const handleToggleFavourite = (snapId: string) => {
    if (!snapId || toggleFavourite.isPending) return;

    const resolvedPropertyId = String(
      propertyData?.propertyId || propertyData?.id || ''
    );
    const resolvedListingId = String(
      propertyData?.listingId || propertyData?.id || propertyData?.propertyId || ''
    );

    if (!resolvedPropertyId || !resolvedListingId) {
      error({ message: "Unable to save this property. Missing property details." });
      return;
    }

    const input = {
      snapId,
      name: propertyData?.listing?.courtesyOf || propertyData?.name || propertyData?.courtesyOf || "Property Name",
      address: propertyData?.listing?.address?.unparsedAddress || propertyData?.address?.unparsedAddress || propertyData?.address || "Address not available",
      city: propertyData?.listing?.address?.city || propertyData?.address?.city || propertyData?.city,
      zipCode: propertyData?.listing?.address?.zipCode || propertyData?.address?.zipCode || propertyData?.zipCode,
      price: +propertyData?.listing?.listPriceLow || +propertyData?.listPrice || +propertyData?.price || 0,
      image: propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.public?.imageUrl || propertyData?.image || propertyData?.primaryPhoto,
      bedRooms: +propertyData?.listing?.property?.bedroomsTotal || +propertyData?.property?.bedroomsTotal || +propertyData?.bedrooms || 0,
      bathRooms: "" + (propertyData?.listing?.property?.bathroomsTotal || propertyData?.property?.bathroomsTotal || propertyData?.bathrooms || 0),
      sqft: "" + (propertyData?.listing?.property?.livingArea || propertyData?.property?.livingArea || propertyData?.sqft || 0),
      listingId: resolvedListingId,
      propertyId: resolvedPropertyId,
    };

    toggleFavourite.mutate(
      { snapId, propertyId: input.propertyId, listingId: input.listingId, createFavouritesInput: input },
      {
        onSuccess: (wasAdded) => {
          if (wasAdded) {
            success({
              message: "All Set! It's Now In Your Favorites",
              subtitle: 'One tap to save. One place to collaborate.',
            });
          } else {
            success({
              message: 'Removed From Favorites',
              subtitle:
                'Removed from favorites. No worries, it is one tap to save again.',
            });
          }
          getAllSnapsByUserId();
          notificationsQuery.refetch();
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          console.error("Error toggling favourite:", error);
        },
      }
    );
  };

  // Used by collaborative flow (step 1: name the snap, step 2: invite)
  const createSnap = () => {
    const trimmedName = newCollectionName.trim();
    if (!trimmedName) return;

    if (!userData?.id) {
      error({ message: "Your session is unavailable. Please refresh and try again." });
      return;
    }

    createNewSnap.mutate({
      name: trimmedName,
      link: randomLink,
      userId: userData?.id
    }, {
      onSuccess: (data) => {
        setSnaps((prev) => [...prev, data?.data?.createSnap]);
        setCreatedSnapId(data?.data?.createSnap?.id);
        setStep(2);
        notificationsQuery.refetch();
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.errors?.[0]?.message ||
          err?.message ||
          "Failed to create snap";
        error({ message });
      }
    });
  };

  // Used by the + quick-create flow: creates a named snapz and immediately saves the property to it
  const createQuickSnap = () => {
    const trimmedName = quickSnapName.trim();
    if (!trimmedName || !userData?.id) return;

    const newId = uuidv4();
    const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/snaps/${newId}`;

    createNewSnap.mutate(
      { name: trimmedName, link, userId: userData?.id },
      {
        onSuccess: (data) => {
          const createdId = data?.data?.createSnap?.id;
          if (createdId) {
            lastCreatedSnapIdRef.current = createdId;
            handleToggleFavourite(createdId);
            getAllSnapsByUserId();
          }
          setQuickSnapName('');
          setShowQuickCreateInput(false);
          notificationsQuery.refetch();
        },
        onError: (err: any) => {
          error({ message: err?.message || 'Failed to create snapz' });
        }
      }
    );
  };

  const setSnapsWithNewFirst = (data: any[]) => {
    const pinId = lastCreatedSnapIdRef.current;
    if (pinId) {
      const idx = data.findIndex((s: any) => s.id === pinId);
      if (idx > 0) {
        const reordered = [...data];
        const [snap] = reordered.splice(idx, 1);
        reordered.unshift(snap);
        setSnaps(reordered);
        return;
      }
    }
    setSnaps(data);
  };

  const getAllSnapsByUserId = (skipReclaim = false) => {
    if (userData?.id) {
      getAllSnaps.mutate(userData.id, {
        onSuccess: (data) => {
          if (data && data.length > 0) {
            setSnapsWithNewFirst(data);
          } else if (!skipReclaim) {
            // No snaps returned — may be due to orphaned snaps from the old OAuth
            // flow (randomId userId mismatch). Run a one-time migration and re-fetch.
            reclaimMySnaps.mutate(undefined, {
              onSuccess: (count) => {
                if (count > 0) {
                  // Orphaned snaps were reclaimed — re-fetch to show them
                  getAllSnapsByUserId(true);
                } else {
                  setSnaps([]);
                }
              },
              onError: () => setSnaps([]),
            });
          } else {
            setSnapsWithNewFirst(data ?? []);
          }
        },
        onError: (err) => {
          console.error("Error fetching snaps:", err);
        }
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!isAgentAccount) {
        getAllSnapsByUserId();
      }
      // Reset quick-create state when modal opens
      setShowQuickCreateInput(false);
      setQuickSnapName('');
    }
  }, [userData, isOpen, isAgentAccount]);

  // Auto-focus the quick create input when it appears
  useEffect(() => {
    if (showQuickCreateInput && quickInputRef.current) {
      quickInputRef.current.focus();
    }
  }, [showQuickCreateInput]);

  const handleSaveToMyFavourites = () => {
    if (savingToMyFav || toggleFavourite.isPending) return;

    const myFavSnap = snaps.find((s: any) => s.name === 'My Favourite');

    if (myFavSnap) {
      handleToggleFavourite(myFavSnap.id);
    } else {
      setSavingToMyFav(true);
      const newId = uuidv4();
      const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/snaps/${newId}`;

      createNewSnap.mutate(
        { name: 'My Favourite', link, userId: userData?.id },
        {
          onSuccess: (data) => {
            const createdId = data?.data?.createSnap?.id;
            if (createdId) {
              handleToggleFavourite(createdId);
              getAllSnapsByUserId();
            }
            setSavingToMyFav(false);
          },
          onError: (err: any) => {
            error({ message: err?.message || 'Failed to save to My Favourite' });
            setSavingToMyFav(false);
          },
        }
      );
    }
  };

  const isPropertyInFavourite = (snap: any) => {
    if (!Array.isArray(snap?.favourites)) return false;

    return snap.favourites.some((favourite: any) => {
      if (!favourite) return false;
      const currentPropertyId = propertyData?.propertyId || propertyData?.id;
      const currentListingId = propertyData?.listingId;
      const propertyIdMatch = !!currentPropertyId && favourite?.propertyId == currentPropertyId;
      const listingIdMatch = !!currentListingId && favourite?.listingId == currentListingId;
      return propertyIdMatch || listingIdMatch;
    });
  };

  const myFavSnap = snaps.find((s: any) => s.name === 'My Favourite');
  const isInMyFav = myFavSnap ? isPropertyInFavourite(myFavSnap) : false;
  const customSnaps = snaps.filter((s: any) => s.name !== 'My Favourite');

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="p-0 w-[480px] rounded-2xl"
    >
      <div className="flex flex-col p-6">
        {/* Close Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          {propertyImage && (
            <div className="relative h-14 w-14 rounded-md overflow-hidden">
              <img
                src={propertyImage || propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.public?.imageUrl || propertyData?.image || "/assets/images/placeholder.svg"}
                alt="Property"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">Save to favorites</h3>
          </div>
          <div className="ml-auto">
            <Heart className="h-6 w-6 fill-orange-500 text-orange-500" />
          </div>
        </div>

        {/* Snapz title row */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <h2 className="text-xl font-bold">Snapz</h2>
          <div className="flex items-center gap-2">
            {!showInput && (
              <div className="relative group">
                <button
                  onClick={() => setShowQuickCreateInput((prev) => !prev)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-lg font-bold hover:bg-black transition-colors leading-none"
                  aria-label={showQuickCreateInput ? 'Cancel' : 'Create new snapz'}
                >
                  {showQuickCreateInput ? '✕' : '+'}
                </button>
                <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white z-10">
                  {showQuickCreateInput ? 'Cancel' : 'Create new snapz'}
                </div>
              </div>
            )}
            {showInput && (
              <button
                onClick={() => { setShowInput(false); setStep(1); setNewCollectionName(''); }}
                className="text-sm text-orange-500"
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* ── Collaborative flow (shown when "Create a collaborative snapz" is clicked) ── */}
        {showInput ? (
          <div className="mb-6">
            {step === 1 ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => { e.preventDefault(); createSnap(); }}
              >
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter new snapz name"
                  className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="bg-gray-900 hover:bg-black text-white font-semibold px-4 py-2 rounded-md transition disabled:opacity-40"
                >
                  Create Snapz
                </button>
              </form>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => { e.preventDefault(); handleInvite(); }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invite Type</label>
                    <select
                      value={inviteType}
                      onChange={(e) => setInviteType(e.target.value as 'agent' | 'co-buyer' | 'other')}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-500 transition-colors bg-white"
                    >
                      <option value="co-buyer">Invite Co-buyer</option>
                      <option value="agent">Invite Agent</option>
                      <option value="other">Invite Family/Friends</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {inviteType === 'co-buyer' ? 'Co-buyer Email' : inviteType === 'agent' ? 'Agent Email' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!partnerEmail.trim()}
                  className="bg-gray-900 hover:bg-black text-white font-semibold px-4 py-2 rounded-md transition mt-2 disabled:opacity-40"
                >
                  Send Invite
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* ── My Favourite — pinned default row ── */}
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition mb-1",
                isInMyFav
                  ? "bg-orange-50 hover:bg-orange-100"
                  : "bg-gray-50 hover:bg-gray-100"
              )}
              onClick={() => handleSaveToMyFavourites()}
            >
              {/* Orange icon (matches My Snapz page) */}
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500">
                <Heart className="h-5 w-5 fill-white text-white" />
              </div>
              <span className="flex-1 font-semibold text-gray-800">My Favourite</span>
              <SnapzHeartButton
                isActive={isInMyFav}
                size={18}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveToMyFavourites();
                }}
                className={isInMyFav ? "text-orange-500" : "text-gray-300"}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* ── Inline quick-create input (shown when + is clicked) ── */}
            {showQuickCreateInput && (
              <form
                className="flex items-center gap-2 mb-3"
                onSubmit={(e) => { e.preventDefault(); createQuickSnap(); }}
              >
                <input
                  ref={quickInputRef}
                  type="text"
                  value={quickSnapName}
                  onChange={(e) => setQuickSnapName(e.target.value)}
                  placeholder="Name your snapz…"
                  className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gray-500 transition-colors"
                  onKeyDown={(e) => { if (e.key === 'Escape') { setShowQuickCreateInput(false); setQuickSnapName(''); } }}
                />
                <button
                  type="submit"
                  disabled={!quickSnapName.trim() || createNewSnap.isPending}
                  className="bg-gray-900 hover:bg-black disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
              </form>
            )}

            {/* ── Custom snapz list (excludes My Favourite) ── */}
            <div className="flex flex-col gap-2 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
              {customSnaps.length === 0 && !showQuickCreateInput && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No snapz yet. Hit <span className="font-semibold text-orange-500">+</span> to create one.
                </p>
              )}
              {customSnaps.map((collection) => {
                const isSaved = isPropertyInFavourite(collection);
                return (
                  <div
                    key={collection.id}
                    className="flex cursor-pointer items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
                    onClick={() => handleToggleFavourite(collection.id)}
                  >
                    <span className="font-medium text-gray-800">{collection.name}</span>
                    <SnapzHeartButton
                      isActive={isSaved}
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(collection.id);
                      }}
                      className={isSaved ? "text-orange-500" : "text-gray-300"}
                    />
                  </div>
                );
              })}
            </div>

            {/* View All Snapz */}
            <button
              onClick={() => { onClose(); router.push("/account"); }}
              className="text-sm mb-4 text-right text-orange-500 w-full"
            >
              View All Snapz
            </button>
          </>
        )}

        {/* ── Collaborative Button — always visible ── */}
        <button
          onClick={handleCreateCollaborative}
          className={cn(
            "flex items-center gap-4 p-4 border border-gray-200 rounded-xl",
            "hover:bg-gray-50 transition-colors w-full"
          )}
        >
          <div className="flex-shrink-0 bg-black p-3 rounded-md">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Create a collaborative snapz</h3>
            <p className="text-sm text-gray-500">Invite users to a saved snapz for collaboration</p>
          </div>
          <div className="ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>
    </CustomModal>
  );
};

export default CollectionModal;
