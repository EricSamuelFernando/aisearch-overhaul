// import { useFetchTours } from '@/hooks/api/agent/useGetTours';
// import React from 'react';
// import Calendar from './calendar';
// import PropertyImage from './property-image';
// import AddressTime from './address-time';
// import { ITour } from '@/interfaces/tours.interface';

// const UpcomingTours = () => {
//   const tours = useFetchTours('upcoming');
//   const toursData = tours?.data?.data.data.tours;

//   return (
//     <div className='overflow-hidden rounded-2xl border'>
//       <div className='overflow-hidden rounded-2xl border'>
//         {toursData && toursData.length > 0 ? (
//           toursData.map((tour: ITour, index: number) => (
//             <div key={index} className='flex space-x-8 border-b'>
//               <Calendar
//                 date={tour.eventDate[0].eventDate}
//                 // day={tour.day}
//                 // isToday={tour.isToday}
//                 className='bg-grey-50'
//               />
//               <div className='flex flex-grow items-center space-x-4 py-4'>
//                 <PropertyImage alt='Property Image' />
//                 <AddressTime
//                   address={
//                     tour.property.propertyAddressDetails.formattedAddress
//                   }
//                   time={tour.eventDate[0].tourTime}
//                 />
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No tours available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UpcomingTours;

// "use client";

// import React, { useState } from "react";
// import { MoreVertical } from "lucide-react";
// import CustomButton from "@/components/custom-button";
// import {
//   useGetRequestedToursBySeller,
//   useRespondToTourRequest,
// } from "@/hooks/api/seller-tours/useSellerTours";
// import { useSelector } from 'react-redux';
// import { userData } from '@/slices/auth/auth.slice';
// const ITEMS_PER_PAGE = 5;

// const statusColors: Record<string, string> = {
//   REQUESTED: "bg-yellow-100 text-yellow-700 border-yellow-300",
//   CONFIRMED: "bg-green-100 text-green-700 border-green-300",
//   REJECTED: "bg-red-100 text-red-700 border-red-300",
//   PROPOSED: "bg-blue-100 text-blue-700 border-blue-300",
// };

// const UpcomingTours = ({ sellerId }: { sellerId: string }) => {
//   const { data: tours, isLoading, error, refetch } =
//     useGetRequestedToursBySeller(sellerId);

  
//   const respondToTour = useRespondToTourRequest();

//   const [rescheduleId, setRescheduleId] = useState<string | null>(null);
//   const [newDate, setNewDate] = useState("");
//   const [newTime, setNewTime] = useState("");
//   const [openMenu, setOpenMenu] = useState<string | null>(null);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const totalPages = tours ? Math.ceil(tours.length / ITEMS_PER_PAGE) : 1;
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const paginatedTours = tours?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//   if (isLoading) return <p className="p-4">Loading tours...</p>;
//   if (error) return <p className="p-4 text-red-500">Error loading tours ❌</p>;

//       const currentUser = useSelector(userData);
    
//     debugger
//     console.log(currentUser)
//     const role = currentUser?.account_type?.toLowerCase();

//   const handleAction = async (
//     tourId: string,
//     action: "ACCEPT" | "REJECT" | "PROPOSE",
//     proposedDate?: string,
//     proposedTime?: string
//   ) => {
//     await respondToTour.mutateAsync({
//       tourId,
//       responderId: sellerId,
//       action,
//       proposedDate,
//       proposedTime,
//     });
//     setRescheduleId(null);
//     setNewDate("");
//     setNewTime("");
//     setOpenMenu(null);
//     refetch();
//   };

//   return (
//     <div className="w-full">
//       { paginatedTours && paginatedTours.length > 0 ? (
//         <div className="overflow-x-auto border rounded-xl shadow-md">
//           <table className="w-full border-collapse text-sm">
//             <thead className="bg-gray-100 text-gray-700">
//               <tr>
//                 <th className="px-4 py-3 text-left">Property</th>
//                 <th className="px-4 py-3 text-left">Buyer</th>
//                 <th className="px-4 py-3 text-left">Listing</th>
//                 <th className="px-4 py-3 text-left">Created At</th>
//                 <th className="px-4 py-3 text-left">Tour Time</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//                 <th className="px-4 py-3 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedTours.map((tour: any) => {
//                 const firstEvent = tour.events?.[0];
//                 return (
//                   <tr
//                     key={tour.id}
//                     className="border-t hover:bg-gray-50 transition"
//                   >
//                     <td className="px-4 py-3 font-medium text-gray-800">
//                       #{tour.propertyId}
//                     </td>
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="font-medium">{tour.fullName}</p>
//                         <p className="text-gray-500 text-xs">
//                           📞 {tour.phoneNumber}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">
//                       {tour.listingId}
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">
//                       {new Date(tour.createdAt).toLocaleString(undefined, {
//                         dateStyle: "medium",
//                         timeStyle: "short",
//                       })}
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">
//                       {firstEvent ? (
//                         <>
//                           📅{" "}
//                           {new Date(firstEvent.eventDate).toLocaleDateString()} •{" "}
//                           {firstEvent.tourTime}
//                         </>
//                       ) : (
//                         <span className="text-gray-400 italic">
//                           Awaiting schedule
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`px-3 py-1 rounded-full border text-xs font-semibold ${
//                           statusColors[tour.status] || "bg-gray-100 text-gray-600"
//                         }`}
//                       >
//                         {tour.status}
//                       </span>
//                     </td>

//                     {/* Actions with 3-dot menu */}
//                     <td className="px-4 py-3 text-center relative">
//                       <button
//                         onClick={() =>
//                           setOpenMenu(openMenu === tour.id ? null : tour.id)
//                         }
//                         className="p-2 hover:bg-gray-200 rounded-full"
//                       >
//                         <MoreVertical size={16} />
//                       </button>

//                       {openMenu === tour.id && (
//                         <div className="absolute right-4 mt-2 bg-white border rounded-lg shadow-lg z-10 w-40">
//                           <button
//                             onClick={() => handleAction(tour.id, "ACCEPT")}
//                             className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                           >
//                             ✅ Accept
//                           </button>
//                           <button
//                             onClick={() => handleAction(tour.id, "REJECT")}
//                             className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                           >
//                             ❌ Reject
//                           </button>
//                           <button
//                             onClick={() => setRescheduleId(tour.id)}
//                             className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                           >
//                             📅 Reschedule
//                           </button>
//                         </div>
//                       )}

//                       {/* Reschedule Form */}
//                       {rescheduleId === tour.id && (
//                         <div className="absolute right-4 mt-2 bg-white border rounded-lg shadow-lg z-20 p-3 w-60">
//                           <input
//                             type="date"
//                             value={newDate}
//                             onChange={(e) => setNewDate(e.target.value)}
//                             className="border w-full mb-2 px-2 py-1 rounded text-xs"
//                           />
//                           <input
//                             type="time"
//                             value={newTime}
//                             onChange={(e) => setNewTime(e.target.value)}
//                             className="border w-full mb-2 px-2 py-1 rounded text-xs"
//                           />
//                           <div className="flex justify-end space-x-2">
//                             <CustomButton
//                               label="Cancel"
//                               onClick={() => setRescheduleId(null)}
//                               className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs"
//                             />
//                             <CustomButton
//                               label="Save"
//                               onClick={() =>
//                                 handleAction(
//                                   tour.id,
//                                   "PROPOSE",
//                                   newDate,
//                                   newTime
//                                 )
//                               }
//                               className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
//                             />
//                           </div>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="p-4">No upcoming tours available.</p>
//       )}

//       {/* Pagination */}
//       {tours && tours.length > ITEMS_PER_PAGE && (
//         <div className="flex justify-center items-center space-x-2 mt-6">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => prev - 1)}
//             className="px-3 py-1 border rounded-lg disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <span className="text-gray-700 font-medium">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//             className="px-3 py-1 border rounded-lg disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UpcomingTours;


"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import CustomButton from "@/components/custom-button";
import {
  useGetRequestedToursBySeller,
  useRespondToTourRequest,
  useRescheduleTour,
  useBuyerRespondToProposal,
  useGetToursByBuyer,
} from "@/hooks/api/seller-tours/useSellerTours";
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 5;

const statusColors: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-700 border-yellow-300",
  CONFIRMED: "bg-green-100 text-green-700 border-green-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
  PROPOSED: "bg-blue-100 text-blue-700 border-blue-300",
};

interface UpcomingToursProps {
  role: "seller" | "buyer";
  userId: string; // sellerId or buyerId depending on role
}

const UpcomingTours: React.FC<UpcomingToursProps> = ({ role, userId }) => {
  const {
    data: tours,
    isLoading,
    error: fetchError,
    refetch,
  } =
    role === "seller"
      ? useGetRequestedToursBySeller(userId)
      : useGetToursByBuyer(userId);

  const respondToTour = useRespondToTourRequest();
  const rescheduleTour = useRescheduleTour();
  const buyerRespond = useBuyerRespondToProposal();

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = tours ? Math.ceil(tours.length / ITEMS_PER_PAGE) : 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTours = tours?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) return <p className="p-4">Loading tours...</p>;
  if (fetchError)
    return <p className="p-4 text-red-500">Error loading tours ❌</p>;

  const resetForm = () => {
    setRescheduleId(null);
    setNewDate("");
    setNewTime("");
    setOpenMenu(null);
  };

  const handleSellerAction = async (
    tourId: string,
    action: "ACCEPT" | "REJECT" | "PROPOSE",
    proposedDate?: string,
    proposedTime?: string
  ) => {
    try {
      await respondToTour.mutateAsync({
        tourId,
        responderId: userId,
        action,
        proposedDate,
        proposedTime,
      });
      toast.success( "Tour request updated successfully ✅" );
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error("Failed to perform action ❌" );
    }
  };

  const handleBuyerAction = async (tourId: string, action: "ACCEPT" | "REJECT") => {
    try {
      await buyerRespond.mutateAsync({ tourId, action });
      toast.success("Tour request updated successfully ✅" );
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error("Failed to perform action ❌");
    }
  };

  return (
    <div className="w-full">
      {paginatedTours && paginatedTours.length > 0 ? (
        <div className="overflow-x-auto border rounded-xl shadow-md">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Property</th>
                <th className="px-4 py-3 text-left">Listing</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Tour Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action By</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTours.map((tour: any) => {
                const firstEvent = tour.events?.[0];
                const actionBy =
                  tour.updated_by_Id === tour.sellerId
                    ? "Seller"
                    : tour.updated_by_Id === tour.sellerAgentId
                    ? "Agent"
                    : "-";
                const alreadyActed = ["CONFIRMED", "REJECTED"].includes(tour.status);

                return (
                  <tr
                    key={tour.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      #{tour.propertyId}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{tour.listingId}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(tour.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {firstEvent ? (
                        <>
                          📅{" "}
                          {new Date(firstEvent.eventDate).toLocaleDateString()} •{" "}
                          {firstEvent.tourTime}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Awaiting schedule</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                          statusColors[tour.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tour.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{actionBy}</td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center relative">
                      {alreadyActed ? (
                        <span className="text-sm text-gray-500 italic">
                          Already performed by {actionBy}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === tour.id ? null : tour.id)
                            }
                            className="p-2 hover:bg-gray-200 rounded-full"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenu === tour.id && (
                            <div className="absolute right-4 mt-2 bg-white border rounded-lg shadow-lg z-10 w-40">
                              {role === "seller" ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleSellerAction(tour.id, "ACCEPT")
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    ✅ Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleSellerAction(tour.id, "REJECT")
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    ❌ Reject
                                  </button>
                                  <button
                                    onClick={() => setRescheduleId(tour.id)}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    📅 Reschedule
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      handleBuyerAction(tour.id, "ACCEPT")
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    ✅ Accept Proposal
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleBuyerAction(tour.id, "REJECT")
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                  >
                                    ❌ Reject Proposal
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {/* Reschedule Form (only seller) */}
                          {role === "seller" && rescheduleId === tour.id && (
                            <div className="absolute right-4 mt-2 bg-white border rounded-lg shadow-lg z-20 p-3 w-60">
                              <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="border w-full mb-2 px-2 py-1 rounded text-xs"
                              />
                              <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="border w-full mb-2 px-2 py-1 rounded text-xs"
                              />
                              <div className="flex justify-end space-x-2">
                                <CustomButton
                                  label="Cancel"
                                  onClick={() => setRescheduleId(null)}
                                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs"
                                />
                                <CustomButton
                                  label="Save"
                                  onClick={() =>
                                    handleSellerAction(
                                      tour.id,
                                      "PROPOSE",
                                      newDate,
                                      newTime
                                    )
                                  }
                                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-4">No upcoming tours available.</p>
      )}

      {/* Pagination */}
      {tours && tours.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingTours;
