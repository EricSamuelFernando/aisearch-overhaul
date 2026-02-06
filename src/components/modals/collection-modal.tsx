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
//             message: "All set! It’s now in your favorites"
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

import React, { useEffect, useState } from 'react';
import { Heart, PlusIcon, Users, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import CustomModal from '../shared/custom-modal';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
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
  const [showInput, setShowInput] = useState(false);
  const [step, setStep] = useState(1);
  const [createdSnapId, setCreatedSnapId] = useState(null);
  const [inviteType, setInviteType] = useState<'co-buyer' | 'agent'>('co-buyer');
  const [partnerEmail, setPartnerEmail] = useState('');
  const propertyData = useSelector((state: any) => state.property.property);
  const {
    createNewSnap,
    getAllSnaps,
    createFavourite,
    createParticipents,
    toggleFavourite
  } = useUserSnapAPIs();
  const userData = useSelector((state: any) => state.auth.user);
  const snapId = uuidv4();
  const randomLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/snaps/${snapId}`;

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    const newSnap = {
      id: Date.now().toString(),
      name: newCollectionName,
    };
    setSnaps((prev) => [...prev, newSnap]);
    setNewCollectionName("");
  };

  const handleCreateCollaborative = () => {
    setShowInput(true);
  };

  const handleInvite = () => {
    const data = {
      snapId: createdSnapId,
      email: partnerEmail,
      status: "pending",
      accountType: inviteType === 'agent' ? 'agent' : 'buyer'
    };
    createParticipents.mutateAsync(data, {
      onSuccess: (response: any) => {
        if (response?.data?.createSnapsParticipant?.success === "true") {
          setStep(1);
          // handleCreateFavourite(createdSnapId || "");
          handleToggleFavourite(createdSnapId || "");
          setPartnerEmail('');
          success({ message: `Great! Your ${inviteType === 'agent' ? 'agent' : 'co-buyer'} invite is on its way` });
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
      listingId: propertyData?.listingId,
      propertyId: propertyData?.propertyId || propertyData?.id || "",
    };

    toggleFavourite.mutate(
      { snapId, propertyId: input.propertyId, listingId: input.listingId, createFavouritesInput: input },
      {
        onSuccess: (wasAdded) => {
          if (wasAdded) {
            success({ message: "All set! It’s now in your favorites" });
          } else {
            success({ message: "Removed from favorites" });
          }
          getAllSnapsByUserId();
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          console.error("Error toggling favourite:", error);
        },
      }
    );
  };

  // const handleCreateFavourite = (snapId: string) => {
  //   if (snapId) {
  //     const data = {
  //       snapId,
  //       name: propertyData?.listing?.courtesyOf,
  //       address: propertyData?.listing?.address?.unparsedAddress,
  //       city: propertyData?.listing?.address?.city,
  //       zipCode: propertyData?.listing?.address?.zipCode,
  //       price: +propertyData?.listing?.listPriceLow,
  //       image: propertyData?.public?.imageUrl,
  //       bedRooms: +propertyData?.listing?.property?.bedroomsTotal || +propertyData?.property?.bedroomsTotal || 0,
  //       bathRooms: "" + propertyData?.listing.property?.bathroomsTotal || "" + propertyData?.property?.bathroomsTotal,
  //       sqft: "" + propertyData?.listing?.property?.livingArea,
  //       listingId: propertyData?.listingId,
  //       propertyId: propertyData?.id || ""
  //     };



  //     createFavourite.mutate(data, {
  //       onSuccess: async(data) => {
  //         const selectedSnap: any = await snaps.filter((item) => item?.id === snapId);
  //         selectedSnap[0].favourites = [
  //           {
  //             id: data?.data?.createFavourite?.id,
  //             listingId: propertyData?.listingId,
  //             propertyId: propertyData?.id || ""
  //           },
  //           ...selectedSnap?.[0].favourites
  //         ]
  //         const finalSnaps = snaps.filter((item) => item?.id !== snapId)
  //         setSnaps((prev) => ([
  //           ...finalSnaps,
  //           ...selectedSnap
  //         ]))

  //         success({
  //           message: "All set! It’s now in your favorites"
  //         });
  //         onClose();
  //       },
  //       onError: (error) => {
  //         console.log("Error creating favourite:", error);
  //       }
  //     });
  //   }
  // };

  const createSnap = () => {
    createNewSnap.mutate({
      name: newCollectionName,
      link: randomLink,
      userId: userData?.id
    }, {
      onSuccess: (data) => {
        setSnaps((prev) => [...prev, data?.data?.createSnap]);
        setCreatedSnapId(data?.data?.createSnap?.id);
        setStep(2);
      },
      onError: (err: any) => {
        error({ message: err.message || "Failed to create snap" });
      }
    });
  };

  const isAvialable = (snapId: string): Boolean => {
    const selectedSnap: any = snaps.filter((item: any) => item?.id === snapId);

    if (selectedSnap?.length) {
      const isAvialable = selectedSnap?.favourites?.some((item: any) => item?.listingId === propertyData?.listingId && item?.propertyId === propertyData?.id)
      return isAvialable;
    } else {
      return false;
    }
  }

  const getAllSnapsByUserId = () => {
    if (userData?.id) {
      getAllSnaps.mutate(userData.id, {
        onSuccess: (data) => {
          setSnaps(data);
        },
        onError: (error) => {
          console.error("Error fetching snaps:", error);
        }
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      getAllSnapsByUserId();
    }
  }, [userData, isOpen]);

  const isPropertyInFavourite = (snap: any) => {
    if (!Array.isArray(snap?.favourites)) {
      return false;
    }
    const isAvailable = snap?.favourites?.some((favourite: any) => {
      if (!favourite) return false;

      const currentPropertyId = propertyData?.propertyId || propertyData?.id;
      const currentListingId = propertyData?.listingId;

      // Use loose equality for ID comparisons to handle string/number differences
      const propertyIdMatch = !!currentPropertyId && favourite?.propertyId == currentPropertyId;
      const listingIdMatch = !!currentListingId && favourite?.listingId == currentListingId;

      return propertyIdMatch || listingIdMatch;
    });

    return isAvailable;
  };

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
            <h3 className="text-lg font-semibold">Saved to favorites</h3>
            <p className="text-gray-500 text-sm">Private</p>
          </div>
          <div className="ml-auto">
            <Heart className={`h-6 w-6 ${snaps?.some(snap => isPropertyInFavourite(snap)) ? 'fill-orange-500 text-orange-500' : 'fill-orange-500 text-orange-500'}`} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Snapz</h2>
          {showInput ? (
            <button
              onClick={() => {
                setShowInput(false);
                setStep(1);
              }}
              className="text-sm text-orange-500"
            >
              Back
            </button>
          ) : null}
        </div>

        {showInput ? (
          <div className="">
            {step === 1 ? (
              <form
                className="flex flex-col gap-4 mb-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  createSnap();
                }}
              >
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Enter new snapz name"
                  className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-md transition"
                >
                  Create Snapz
                </button>
              </form>
            ) : (
              <form
                className="flex flex-col gap-4 mb-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInvite();
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invite Type
                    </label>
                    <select
                      value={inviteType}
                      onChange={(e) => setInviteType(e.target.value as 'agent' | 'co-buyer')}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:ring-orange-500 bg-white"
                    >
                      <option value="co-buyer">Invite Co-buyer</option>
                      <option value="agent">Invite Agent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {inviteType === 'co-buyer' ? 'Co-buyer Email' : 'Agent Email'}
                    </label>
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!partnerEmail.trim()}
                  className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-md transition mt-2"
                >
                  Send Invite
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="flex h-48 flex-col gap-3 mb-6 overflow-y-auto">
            {snaps?.slice().reverse().map((collection) => {

              return (
                <div
                  key={collection.id}
                  className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleFavourite(collection.id);
                  }}
                >
                  <span className="font-medium text-gray-800">{collection.name}</span>
                  {

                  }
                  <SnapzHeartButton
                    isActive={isPropertyInFavourite(collection)}
                    size={18}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleToggleFavourite(collection.id);
                    }}
                    className="text-orange-500"
                  />
                </div>
              );
            })}
          </div>
        )}
        <button
          onClick={() => {
            setShowInput(false);
            onClose();
            router.push("/account");
          }}
          className="text-sm mb-4 text-right text-orange-500"
        >
          View All Snapz
        </button>
        {/* Collaborative Button */}
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

