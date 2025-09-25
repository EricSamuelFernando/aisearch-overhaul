// 'use client';

// import Link from 'next/link';
// import { useMemo, useState } from 'react';
// import { Loader2 } from 'lucide-react';
// import { useParams } from 'next/navigation';
// import { useFieldArray, useForm } from 'react-hook-form';
// import PhoneInput from 'react-phone-input-2';

// import { useSchedulePropertyTour } from '@/hooks/api/property/useSchedulePropertyTour';
// import { useGetSinglePropertyTour } from '@/hooks/api/property/useGetSinglePropertyTour';
// import { Checkbox } from '../../ui/checkbox';
// import { Label } from '../../ui/label';
// import CustomInput from '@/components/customs/input';
// import CustomTextArea from '@/components/customs/textarea';
// import DatePicker from '@/components/date-picker';
// import { Button } from '@/components/ui/button';
// import { Icons } from '@/components/icons';
// import usePropertyTour from '@/hooks/api/property-tour/usePropertyTour';
// import { useAppSelector } from '@/lib/hook';
// import { RootState } from '@/lib/store';
// import CustomButton from '@/components/shared/custom-button';
// import Image from 'next/image';
// import { formatDate, formatTime24to12 } from '@/lib/utils';


// type Props = {};

// type Schedule = {
//   eventDate: string;
//   tourTime: string;
// };

// type FormType = {
//   fullName: string;
//   phoneNumber: string;
//   events: Schedule[];
//   message: string;
// };

// const initialValues = {
//   fullName: '',
//   phoneNumber: '',
//   message: '',
//   events: [
//     {
//       eventDate: '',
//       tourTime: '',
//       propertyId:'',
//       listingId:'',
//     },
//   ],
// };

// function Showings({ }: Props) {
//   const { propertyId } = useParams<{ propertyId: string }>();
//   const defaults = useMemo(() => initialValues, []);
//   const [screen, setScreen] = useState(0);
//   const [action, setAction] = useState(false)
//   const [editingTour, setEditingTour] = useState<any>(null);
//   const form = useForm<FormType>({
//     defaultValues: defaults,
//     resolver: async (values) => {
//       const errors: Record<string, { type: string; message: string }> = {};
//       if (!values.fullName) {
//         errors.fullName = {
//           type: 'required',
//           message: 'Full name is required',
//         };
//       }
//       if (!values.phoneNumber) {
//         errors.phoneNumber = {
//           type: 'required',
//           message: 'Phone number is required',
//         };
//       }
//       if (!values.message) {
//         errors.message = {
//           type: 'required',
//           message: 'Message is required',
//         };
//       }
//       return {
//         values,
//         errors,
//       };
//     },
//   });

//   const {
//     control,
//     register,
//     handleSubmit: formHandleSubmit,
//     formState: { errors },
//     getValues,
//     setValue,
//     reset
//   } = form;

//   const { fields, append, remove, } = useFieldArray({
//     control,
//     name: 'events',
//   });


//   const engagedProperty = useAppSelector((state: RootState) => state.property.engagedProperty)


//   // const tours = {
//   //   property: '66f41b99ca551113422c5943',
//   //   buyer: {},
//   //   seller: null,
//   //   sellerAgent: null,
//   //   fullName: 'Abdulrazak Abdulrahaman Abubakar',
//   //   eventDate: [
//   //     {
//   //       eventDate: '2024-11-02T18:02:42.077Z',
//   //       tourTime: '22:15:00',
//   //       _id: '6725184076c5d6426507e678',
//   //     },
//   //   ],
//   //   phoneNumber: '12920202020',
//   //   _id: '6725184076c5d6426507e677',
//   //   createdAt: '2024-11-01T18:04:48.242Z',
//   //   updatedAt: '2024-11-01T18:04:48.242Z',
//   //   __v: 0,
//   // };

//   // const createEventDetails = (tours: any) => {
//   //   return tours.eventDate.map((event: any) => {
//   //     const eventDate = new Date(event.eventDate);
//   //     const month = eventDate.toLocaleString('default', { month: 'long' });
//   //     const date = eventDate.getDate();

//   //     const [hours, minutes] = event.tourTime.split(':');
//   //     const formattedTime = `${hours}:${minutes}`;

//   //     const randomAddress = `123${Math.floor(Math.random() * 100)} Main St, Sample City, Country`;

//   //     return {
//   //       month,
//   //       date,
//   //       time: formattedTime,
//   //       address: randomAddress,
//   //     };
//   //   });
//   // };

//   // const eventDetails = createEventDetails(tours);

//   const values = getValues();



//   const isEventDateValid = () => {
//     const events = getValues('events');
//     return events.some((field) => field.eventDate && field.tourTime);
//   };

//   const handleNextClick = () => {
//     if (isEventDateValid()) {
//       setScreen(1);
//       form.clearErrors('events');
//     } else {
//       form.setError('events', {
//         message: 'Please select at least one event date and time.',
//       });
//     }
//   };

//   const { addPropertyTour, updatePropertyTour, updateTourEvent, removePropertyTour , createTourEvent } = usePropertyTour()

//   // const handleSubmit = async (values: FormType) => {
//   //   const { message, ...payload  } = values; // Exclude 'message' from values

//   //   const tourInput = {
//   //     ...payload ,
//   //       message,
//   //       engagementId:engagedProperty?.id,
//   //      }
//   //      console.log(tourInput)
//   //     addPropertyTour.mutate(tourInput);
//   //     setAction(false)
//   //     setScreen(0)
//   // };



//   const handleSubmit = async (values: FormType) => {
//     const { message, ...payload } = values; // Exclude 'message' from values

//     console.log('--VALUES--', values)
//     const tourInput = editingTour ? {
//       ...payload,
//       message,
//       engagementId: engagedProperty?.id,
//       tourId: editingTour.id, // Include the tour ID if editing
//     } : {
//       ...payload,
//       message,
//       propertyId,
//       listingId:engagedProperty?.listingId?.toString(),
//       engagementId: engagedProperty?.id,
//     };

//     console.log(tourInput)

//     if (editingTour) {
//       updatePropertyTour.mutate(tourInput); // Assuming you have a mutation for updates
//     } else {
//       addPropertyTour.mutate(tourInput);
//     }
//     resetActionHandling()
//     setScreen(0);

//   };

//   const startEditTour = (event: any) => {
//     setEditingTour(event);
//     console.log(event)
//     setAction(true);
//     console.log(fields)
//     // fields?.forEach((field, index) => {
//     //   setValue(`events.${index}.eventDate`, tour.eventDate);
//     //   setValue(`events.${index}.tourTime`, tour.tourTime);
//     // });
//   };



//   const handleUpdateTourEvent = async (id: string, updatedEventData: any) => {
//     try {
//       // Prepare the payload with the id and updated event data

//       console.log(values, id)
//       const payload = {
//         id,
//         eventUpdate: updatedEventData, // Include the updated event data in the payload
//       };

//       // Call the mutation function with the prepared payload
//       updateTourEvent.mutate(payload);
//       resetActionHandling()


//     } catch (error) {
//       // Handle any errors that occur during the mutation
//       console.error("Error updating event:", error);
//     }
//   };

//   const handleAddTourEvent = () => {
//     setAction(true)
//     console.log(values)
//     console.log(fields)
//     const tourInput = {
//       // engagementId: engagedProperty?.id,
//       propertyTourId: engagedProperty?.tours?.id,
//       propertyId,
//       listingId:engagedProperty?.listingId?.toString(),
//       events:values?.events // Include the tour ID if editing
//     }
//     console.log(tourInput )
//     // updatePropertyTour.mutate(tourInput);
//     createTourEvent.mutate(tourInput) 
//     resetActionHandling()

//   }


//   const resetActionHandling = () => {
//     setAction(false);
//     setEditingTour(null);
//     reset({
//       ...values, // Keep other form values intact
//       events: [
//         {
//           eventDate: '',
//           tourTime: '',
//         },
//       ], // Reset the events array
//     });
//   }

//   const sortedEvents = engagedProperty?.tours?.events && engagedProperty?.tours?.events.length > 0
//   ? [...engagedProperty?.tours?.events]
//       .sort((a, b) => {
//         // First, compare eventDate
//         const eventDateA = new Date(a?.eventDate);
//         const eventDateB = new Date(b?.eventDate);
//         if (eventDateA > eventDateB) return -1;  // Newest first
//         if (eventDateA < eventDateB) return 1;   // Oldest first

//         // If eventDate is the same, compare tourTime
//         const tourTimeA = a?.tourTime?.split(':').join('');
//         const tourTimeB = b?.tourTime?.split(':').join('');
//         if (tourTimeA > tourTimeB) return -1;  // Newest first (for tourTime)
//         if (tourTimeA < tourTimeB) return 1;   // Oldest first (for tourTime)

//         return 0; // If both are equal, no change
//       })
//   : []; 

//   return (
//     <section className='w-full px-7 py-6'>
//       {engagedProperty?.tours?.events?.length && engagedProperty?.tours.events && !action && !editingTour ? (
//         <ul className='flex flex-col  gap-5'>
//           {sortedEvents?.
//           map((event: any, index: any) => {
//             const { day, month, period } = formatDate(event?.eventDate!);
//             const formatedTime = formatTime24to12(event?.tourTime!);

//             return (
//               <li key={index}>
//                 <div className='flex w-full justify-between items-center '>
//                   <h4 className='mb-2 font-medium text-[#707070]'>Pending</h4>
//                 </div>

//                 <div className='flex justify-start gap-5 rounded-[20px] border border-[#707070] bg-white p-3'>
//                   <p className='grid h-24 w-24 place-content-center rounded-xl bg-black px-2 py-3  text-center font-bold leading-snug text-white'>
//                     <span className='block text-md'>{month || 'Jan'}</span>
//                     <span className='block text-5xl'>{day === 'NaN' ? '01' : day}</span>
//                   </p>
//                   <div className='space-y-2 flex flex-col w-full justify-between'>
//                     <span className='block text-lg font-bold text-ocOrange'>{formatedTime}</span>
//                     <div className='flex gap-4 justify-end w-full '>
//                       <Button
//                         onClick={() => removePropertyTour.mutate(event?.id)}
//                         className='w-fit flex gap-2 text-sm bg-white border text-black border-black  rounded-full'
//                       >
//                         <Image
//                           src={'/assets/icons/delete.svg'}
//                           alt='Download Icon'
//                           width={12}
//                           height={12}
//                           // onClick={handleDownload}
//                           style={{ cursor: 'pointer' }}
//                         />
//                         Delete Tour
//                       </Button>
//                       <Button
//                         onClick={() => startEditTour(event)}
//                         className='w-fit  rounded-full flex gap-2'>
//                         <Image
//                           src={'/assets/icons/edit.svg'}
//                           alt='Download Icon'
//                           width={12}
//                           height={12}
//                           // onClick={handleDownload}
//                           style={{ cursor: 'pointer' }}
//                         />
//                         Edit Tour
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </li>
//             )
//           })}
//           <div className='w-full flex justify-center'>
//             <Button className='w-fit px-12 rounded-full' onClick={() => setAction(true)}>
//               <Icons.Add color='white' className='h-4 w-4 ' />
//               Add Tour
//             </Button>
//           </div>
//         </ul>
//       )
//         :
//         engagedProperty?.tours?.events?.length && editingTour ?
//           (
//             <>
//               <div className='w-full'>
//                 <div>
//                   <div className='mb-8 w-full'>
//                     <DatePicker
//                       initialDate={new Date(editingTour?.eventDate)}
//                       initialTime={editingTour?.timetour}
//                       onTimeChange={(d) => {
//                         setEditingTour((prev: any) => {
//                           return {
//                             ...prev,
//                             tourTime: d
//                           }
//                         })
//                       }}
//                       onDateTimeSelect={(d) => {
//                         setEditingTour((prev: any) => {
//                           return {
//                             ...prev,
//                             eventDate: d
//                           }
//                         })
//                       }}
//                     />


//                   </div>

//                 </div>
//                 <div className='my-8 flex items-center justify-around gap-x-4'>
//                   <Button
//                     className='w-[180px]'
//                     roundness='full'
//                     onClick={resetActionHandling}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     className='flex w-[180px] items-center justify-center gap-2'
//                     roundness='full'
//                     // disabled={isPending}
//                     onClick={() => handleUpdateTourEvent(editingTour?.id, editingTour)}
//                   >
//                     {/* {isPending && <Loader2 className='h-4 w-4 animate-spin' />} */}
//                     Update Schedule
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )
//           :
//           engagedProperty?.tours?.events?.length && action ?
//             (
//               <div className='w-full'>
//                 <div>
//                   {fields.map((field, index) => (
//                     <div key={field.id} className='mb-8 w-full'>
//                       <DatePicker

//                         onTimeChange={(d) => {
//                           setValue(`events.${index}.tourTime`, d);
//                         }}
//                         onDateTimeSelect={(d) => {
//                           setValue(`events.${index}.eventDate`, d);
//                         }}
//                       />

//                       {errors?.events && (
//                         <p className='mt-2 text-sm text-red-500'>
//                           {errors?.events.message}
//                         </p>
//                       )}

//                       {fields.length > 1 && (
//                         <div className='my-2 flex items-center justify-center'>
//                           <button
//                             type='button'
//                             className='text-center font-bold'
//                             onClick={() => remove(index)}
//                           >
//                             Remove Time
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   {fields.length < 2 && (
//                     <div className='flex items-center justify-center'>
//                       <button
//                         onClick={() =>
//                           append({
//                             eventDate: '',
//                             tourTime: '',
//                           })
//                         }
//                         className='flex w-max items-center justify-center gap-x-2 text-md font-bold'
//                       >
//                         <Icons.Add className='h-4 w-4' />
//                         <span>Add Another Time</span>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 <div className='my-8 flex items-center justify-around gap-x-4'>
//                   <Button
//                     className='w-[180px]'
//                     roundness='full'
//                     onClick={resetActionHandling}
//                   >
//                     Cancel
//                   </Button>

//                   <Button
//                     className='flex w-[180px] items-center justify-center gap-2'
//                     roundness='full'
//                   // disabled={isPending}
//                   onClick={() => handleAddTourEvent()}
//                   >
//                     {/* {isPending && <Loader2 className='h-4 w-4 animate-spin' />} */}
//                     Add Tour
//                   </Button>
//                 </div>
//               </div>
//             )
//             :
//             <>
//               {
//                 screen === 0 ? (
//                   <div className='w-full'>
//                     <div>
//                       {fields.map((field, index) => (
//                         <div key={field.id} className='mb-8 w-full'>
//                           <DatePicker
//                             onTimeChange={(d) => {
//                               setValue(`events.${index}.tourTime`, d);
//                             }}
//                             onDateTimeSelect={(d) => {
//                               setValue(`events.${index}.eventDate`, d);
//                             }}
//                           />
//                           {errors?.events && (
//                             <p className='mt-2 text-sm text-red-500'>
//                               {errors?.events.message}
//                             </p>
//                           )}
//                           {fields.length > 1 && (
//                             <div className='my-2 flex items-center justify-center'>
//                               <button
//                                 type='button'
//                                 className='text-center font-bold'
//                                 onClick={() => remove(index)}
//                               >
//                                 Remove Time
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                       {fields.length < 2 && (
//                         <div className='flex items-center justify-center'>
//                           <button
//                             onClick={() =>
//                               append({
//                                 eventDate: '',
//                                 tourTime: '',
//                               })
//                             }
//                             className='flex w-max items-center justify-center gap-x-2 text-md font-bold'
//                           >
//                             <Icons.Add className='h-4 w-4' />
//                             <span>Add Another Time</span>
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                     <div className='my-8 flex items-center justify-between gap-x-8 px-10 py-10'>
//                       <div className='flex flex-1 items-center justify-end gap-x-2'>
//                         <Button className='w-[180px]' roundness='full'>
//                           Assisted Tour
//                         </Button>
//                         <Icons.Warning />
//                       </div>

//                       <Button
//                         onClick={handleNextClick}
//                         type='button'
//                         className='w-[180px]'
//                         roundness='full'
//                       >
//                         Next
//                       </Button>
//                     </div>
//                   </div>
//                 )
//                   : screen === 1 ? (
//                     <div>
//                       <div className='space-y-4'>
//                         <div>
//                           <CustomInput
//                             {...register('fullName', {
//                               required: 'Full name is required',
//                             })}
//                             type='text'
//                             name='fullName'
//                             defaultValue={values?.fullName}
//                             placeholder='Full Name'
//                             onChange={(e) => {
//                               setValue('fullName', e.currentTarget.value);
//                             }}
//                             className='h-12'
//                           />
//                           {errors.fullName && (
//                             <p className='mt-1 text-sm text-red-500'>
//                               {errors.fullName.message}
//                             </p>
//                           )}
//                         </div>

//                         <div>
//                           <PhoneInput
//                             onChange={(value) => {
//                               setValue('phoneNumber', value);
//                             }}
//                             inputClass='oc-phone'
//                             inputStyle={{
//                               height: '50px',
//                               width: '100%',
//                             }}
//                             country={'us'}
//                           />
//                           {errors.phoneNumber && (
//                             <p className='mt-1 text-sm text-red-500'>
//                               {errors.phoneNumber.message}
//                             </p>
//                           )}
//                         </div>

//                         <div>
//                           <CustomTextArea
//                             label=''
//                             rows={4}
//                             placeholder='Write a Message'
//                             {...register('message', {
//                               required: 'Message is required',
//                             })}
//                             handleTextChange={(val) => {
//                               setValue('message', val);
//                             }}
//                           />
//                           {errors.message && (
//                             <p className='mt-1 text-sm text-red-500'>
//                               {errors.message.message}
//                             </p>
//                           )}
//                         </div>

//                         <div className='flex items-center space-x-2'>
//                           <Checkbox id='terms' />
//                           <Label htmlFor='terms' className='font-semibold'>
//                             You agree to our
//                             <Link href='/terms' className='underline'>
//                               Terms
//                             </Link>{' '}
//                             of Use.
//                           </Label>
//                         </div>
//                       </div>

//                       <div className='my-8 flex items-center justify-around gap-x-4'>
//                         <Button
//                           className='w-[180px]'
//                           roundness='full'
//                           onClick={() => setScreen(0)}
//                         >
//                           Cancel
//                         </Button>

//                         <Button
//                           className='flex w-[180px] items-center justify-center gap-2'
//                           roundness='full'
//                           // disabled={isPending}
//                           onClick={formHandleSubmit(handleSubmit)}
//                         >
//                           {/* {isPending && <Loader2 className='h-4 w-4 animate-spin' />} */}
//                           Request Tour
//                         </Button>
//                       </div>
//                     </div>
//                   )
//                     : null
//               }
//             </>
//       }
//     </section>
//   );
// }

// export default Showings;

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';

import { useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import Image from 'next/image';

import DatePicker from '@/components/date-picker';
import CustomInput from '@/components/customs/input';
import CustomTextArea from '@/components/customs/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';

import usePropertyTour from '@/hooks/api/property-tour/usePropertyTour';
import { formatDate, formatTime24to12 } from '@/lib/utils';
import PaymentModal from '@/components/modals/payment-modal/payment-modal';
import { LockIcon } from '@public/assets/icons';
// import PaymentModal from '../main/payment-modal';

type Props = {};

type Schedule = {
  eventDate: string;
  tourTime: string;
  propertyId: string;
  listingId: string;
};

type FormType = {
  fullName: string;
  phoneNumber: string;
  events: Schedule[];
  message: string;
};

const Showings = ({ }: Props) => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const engagedProperty = useAppSelector((state: RootState) => state.property.engagedProperty);

  // Initialize default values with propertyId and listingId in events
  const initialValues: FormType = useMemo(() => ({
    fullName: '',
    phoneNumber: '',
    message: '',
    events: [
      {
        eventDate: '',
        tourTime: '',
        propertyId: propertyId || '',
        listingId: engagedProperty?.listingId?.toString() || '',
      },
    ],
  }), [propertyId, engagedProperty?.listingId]);

  const [screen, setScreen] = useState(0);
  const [action, setAction] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);

  const form = useForm<FormType>({
    defaultValues: initialValues,
    resolver: async (values) => {
      const errors: Record<string, { type: string; message: string }> = {};
      if (!values.fullName) {
        errors.fullName = {
          type: 'required',
          message: 'Full name is required',
        };
      }
      if (!values.phoneNumber) {
        errors.phoneNumber = {
          type: 'required',
          message: 'Phone number is required',
        };
      }
      if (!values.message) {
        errors.message = {
          type: 'required',
          message: 'Message is required',
        };
      }
      return {
        values,
        errors,
      };
    },
  });

  const {
    control,
    register,
    handleSubmit: formHandleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    formState,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'events',
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { addPropertyTour, updatePropertyTour, updateTourEvent, removePropertyTour, createTourEvent } = usePropertyTour();

  // Check if at least one event date/time is valid
  const isEventDateValid = () => {
    debugger
    const events = getValues('events');
    return events.some((field) => field.eventDate && field.tourTime);
  };

  const handleNextClick = () => {
    debugger
    if (isEventDateValid()) {
      setScreen(1);
      form.clearErrors('events');
    } else {
      form.setError('events', {
        message: 'Please select at least one event date and time.',
      });
    }
  };
  console.log(propertyId)

  const handleSubmit = async (values: FormType) => {
    const { message, ...payload } = values;

    const tourInput = editingTour
      ? {
        ...payload,
        message,
        engagementId: engagedProperty?.id,
        tourId: editingTour.id,
      }
      : {
        ...payload,
        message,
        propertyId,
        listingId: engagedProperty?.listingId?.toString(),
        engagementId: engagedProperty?.id,
      };

    if (editingTour) {
      updatePropertyTour.mutate(tourInput);
    } else {
      addPropertyTour.mutate(tourInput);
    }
    resetActionHandling();
    setScreen(0);
  };

  const startEditTour = (event: any) => {
    setEditingTour(event);
    setAction(true);
  };

  const handleUpdateTourEvent = async (id: string, updatedEventData: any) => {
    try {
      const payload = {
        id,
        eventUpdate: updatedEventData,
      };
      updateTourEvent.mutate(payload);
      resetActionHandling();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };
  console.log( 'propertyTourId' , engagedProperty?.tours,)

  const handleAddTourEvent = () => {
    setAction(true);
    const values = getValues();


    const tourInput = {
      propertyTourId: engagedProperty?.tours?.id,
      propertyId,
      listingId: engagedProperty?.listingId?.toString(),
      events: values.events.map(e => ({
        ...e,
        propertyId: propertyId || '',
        listingId: engagedProperty?.listingId?.toString() || '',
      })),
    };

    console.log(tourInput)

    createTourEvent.mutate(tourInput);
    resetActionHandling();
  };

  const resetActionHandling = () => {
    setAction(false);
    setEditingTour(null);
    const values = getValues();
    reset({
      ...values,
      events: [
        {
          eventDate: '',
          tourTime: '',
          propertyId: propertyId || '',
          listingId: engagedProperty?.listingId?.toString() || '',
        },
      ],
    });
  };

  // Sort events by eventDate and tourTime descending (newest first)
  const sortedEvents = engagedProperty?.tours?.events && engagedProperty?.tours?.events.length > 0
    ? [...engagedProperty?.tours?.events].sort((a, b) => {
      const eventDateA = new Date(a?.eventDate);
      const eventDateB = new Date(b?.eventDate);
      if (eventDateA > eventDateB) return -1;
      if (eventDateA < eventDateB) return 1;

      const tourTimeA = a?.tourTime?.split(':').join('');
      const tourTimeB = b?.tourTime?.split(':').join('');
      if (tourTimeA > tourTimeB) return -1;
      if (tourTimeA < tourTimeB) return 1;

      return 0;
    })
    : [];

  return (
    <section className='w-full px-7 py-6'>
      {engagedProperty?.tours?.events?.length && engagedProperty?.tours.events && !action && !editingTour ? (
        <ul className='flex flex-col gap-5'>
          {sortedEvents.map((event: any, index: any) => {
            const { day, month } = formatDate(event?.eventDate!);
            const formattedTime = formatTime24to12(event?.tourTime!);

            return (
              <li key={index}>
                <div className='flex w-full justify-between items-center'>
                  <h4 className='mb-2 font-medium text-[#707070]'>Pending</h4>
                </div>

                <div className='flex justify-start gap-5 rounded-[20px] border border-[#707070] bg-white p-3'>
                  <p className='grid h-24 w-24 place-content-center rounded-xl bg-black px-2 py-3 text-center font-bold leading-snug text-white'>
                    <span className='block text-md'>{month || 'Jan'}</span>
                    <span className='block text-5xl'>{day === 'NaN' ? '01' : day}</span>
                  </p>
                  <div className='space-y-2 flex flex-col w-full justify-between'>
                    <span className='block text-lg font-bold text-ocOrange'>{formattedTime}</span>
                    <div className='flex gap-4 justify-end w-full'>
                      <Button
                        onClick={() => removePropertyTour.mutate(event?.id)}
                        className='w-fit flex gap-2 text-sm bg-white border text-black border-black rounded-full'
                      >
                        <Image
                          src={'/assets/icons/delete.svg'}
                          alt='Delete Icon'
                          width={12}
                          height={12}
                          style={{ cursor: 'pointer' }}
                        />
                        Delete Tour
                      </Button>
                      <Button
                        onClick={() => startEditTour(event)}
                        className='w-fit rounded-full flex gap-2'
                      >
                        <Image
                          src={'/assets/icons/edit.svg'}
                          alt='Edit Icon'
                          width={12}
                          height={12}
                          style={{ cursor: 'pointer' }}
                        />
                        Edit Tour
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          <div className='w-full flex justify-center'>
            <Button className='w-fit px-12 rounded-full' onClick={() => setAction(true)}>
              <Icons.Add color='white' className='h-4 w-4' />
              Add Tour
            </Button>
          </div>
        </ul>
      ) : engagedProperty?.tours?.events?.length && editingTour ? (
        <div className='w-full'>
          <div className='mb-8 w-full'>
            <DatePicker
              initialDate={new Date(editingTour?.eventDate)}
              initialTime={editingTour?.tourTime}
              onTimeChange={(d) => {
                setEditingTour((prev: any) => ({
                  ...prev,
                  tourTime: d,
                }));
              }}
              onDateTimeSelect={(d) => {
                setEditingTour((prev: any) => ({
                  ...prev,
                  eventDate: d,
                }));
              }}
            />
          </div>

          <div className='my-8 flex items-center justify-around gap-x-4'>
            <Button className='w-[180px]' roundness='full' onClick={resetActionHandling}>
              Cancel
            </Button>
            <Button
              className='flex w-[180px] items-center justify-center gap-2'
              roundness='full'
              onClick={() => handleUpdateTourEvent(editingTour?.id, editingTour)}
            >
              Update Schedule
            </Button>
          </div>
        </div>
      ) : engagedProperty?.tours?.events?.length && action ? (
        <div className='w-full'>
          <div>
            {fields.map((field, index) => (
              <div key={field.id} className='mb-8 w-full'>
                <DatePicker
                  onTimeChange={(d) => {
                    setValue(`events.${index}.tourTime`, d);
                    setValue(`events.${index}.propertyId`, propertyId || '');
                    setValue(`events.${index}.listingId`, engagedProperty?.listingId?.toString() || '');
                  }}
                  onDateTimeSelect={(d) => {
                    setValue(`events.${index}.eventDate`, d);
                    setValue(`events.${index}.propertyId`, propertyId || '');
                    setValue(`events.${index}.listingId`, engagedProperty?.listingId?.toString() || '');
                  }}
                />

                {errors?.events && (
                  <p className='mt-2 text-sm text-red-500'>{errors?.events.message}</p>
                )}

                {fields.length > 1 && (
                  <div className='my-2 flex items-center justify-center'>
                    <button
                      type='button'
                      className='text-center font-bold'
                      onClick={() => remove(index)}
                    >
                      Remove Time
                    </button>
                  </div>
                )}
              </div>
            ))}

            {fields.length < 2 && (
              <div className='flex items-center justify-center'>
                <button
                  onClick={() =>
                    append({
                      eventDate: '',
                      tourTime: '',
                      propertyId: propertyId || '',
                      listingId: engagedProperty?.listingId?.toString() || '',
                    })
                  }
                  className='flex w-max items-center justify-center gap-x-2 text-md font-bold'
                >
                  <Icons.Add className='h-4 w-4' />
                  <span>Add Another Time</span>
                </button>
              </div>
            )}
          </div>

          <div className='my-8 flex items-center justify-around gap-x-4'>
            <Button className='w-[180px]' roundness='full' onClick={resetActionHandling}>
              Cancel
            </Button>
            <Button
              className='flex w-[180px] items-center justify-center gap-2'
              roundness='full'
              onClick={handleAddTourEvent}
            >
              Add Tour
            </Button>
          </div>
        </div>
      ) : (
        <>
          {screen === 0 ? (
            <div className='w-full'>
              <div>
                {fields.map((field, index) => (
                  <div key={field.id} className='mb-8 w-full'>
                    <DatePicker
                      onTimeChange={(d) => {
                        setValue(`events.${index}.tourTime`, d);
                        setValue(`events.${index}.propertyId`, propertyId || '');
                        setValue(`events.${index}.listingId`, engagedProperty?.listingId?.toString() || '');
                      }}
                      onDateTimeSelect={(d) => {
                        setValue(`events.${index}.eventDate`, d);
                        setValue(`events.${index}.propertyId`, propertyId || '');
                        setValue(`events.${index}.listingId`, engagedProperty?.listingId?.toString() || '');
                      }}
                    />
                    {errors?.events && (
                      <p className='mt-2 text-sm text-red-500'>{errors?.events.message}</p>
                    )}
                    {fields.length > 1 && (
                      <div className='my-2 flex items-center justify-center'>
                        <button
                          type='button'
                          className='text-center font-bold'
                          onClick={() => remove(index)}
                        >
                          Remove Time
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {fields.length < 2 && (
                  <div className='flex items-center justify-center'>
                    <button
                      onClick={() =>
                        append({
                          eventDate: '',
                          tourTime: '',
                          propertyId: propertyId || '',
                          listingId: engagedProperty?.listingId?.toString() || '',
                        })
                      }
                      className='flex w-max items-center justify-center gap-x-2 text-md font-bold'
                    >
                      <Icons.Add className='h-4 w-4' />
                      <span>Add Another Time</span>
                    </button>
                  </div>
                )}
              </div>
              <div className='my-8 flex items-center justify-between gap-x-8 px-10 py-10'>
                <div className='flex flex-1 items-center justify-end gap-x-2'>
                  <Button
                    className='w-[180px]'
                    roundness='full'
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    Assisted Tour
                  </Button>
                  <Icons.Warning />
                </div>

                <Button
                  onClick={handleNextClick}
                  type='button'
                  className='w-[180px]'
                  roundness='full'
                >
                  Next
                </Button>
              </div>
            </div>
          ) : screen === 1 ? (
            <div>
              <div className='space-y-4'>
                <div>
                  <CustomInput
                    {...register('fullName', {
                      required: 'Full name is required',
                    })}
                    type='text'
                    name='fullName'
                    defaultValue={getValues('fullName')}
                    placeholder='Full Name'
                    onChange={(e) => {
                      setValue('fullName', e.currentTarget.value);
                    }}
                    className='h-12'
                  />
                  {errors.fullName && (
                    <p className='mt-1 text-sm text-red-500'>{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <PhoneInput
                    onChange={(value) => {
                      setValue('phoneNumber', value);
                    }}
                    inputClass='oc-phone'
                    inputStyle={{
                      height: '50px',
                      width: '100%',
                    }}
                    country={'us'}
                    value={getValues('phoneNumber')}
                  />
                  {errors.phoneNumber && (
                    <p className='mt-1 text-sm text-red-500'>{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <CustomTextArea
                    label=''
                    rows={4}
                    placeholder='Write a Message'
                    {...register('message', {
                      required: 'Message is required',
                    })}
                    handleTextChange={(val) => {
                      setValue('message', val);
                    }}
                    defaultValue={getValues('message')}
                  />
                  {errors.message && (
                    <p className='mt-1 text-sm text-red-500'>{errors.message.message}</p>
                  )}
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox id='terms' />
                  <Label htmlFor='terms' className='font-semibold'>
                    You agree to our{' '}
                    <Link href='/terms' className='underline'>
                      Terms
                    </Link>{' '}
                    of Use.
                  </Label>
                </div>
              </div>

              <div className='my-8 flex items-center justify-around gap-x-4'>
                <Button className='w-[180px]' roundness='full' onClick={() => setScreen(0)}>
                  Cancel
                </Button>

                <Button
                  className='flex w-[180px] items-center justify-center gap-2'
                  roundness='full'
                  onClick={formHandleSubmit(handleSubmit)}
                >
                  Request Tour
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
      {/* {isPaymentModalOpen && (
  <PaymentModal
  onClose={() => setIsPaymentModalOpen(false)}
  onProceed={() => console.log('Paid')}
  title="Unlock AI Summary"
  icon={LockIcon}
  amount={25}
/>
)} */}
      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          onProceed={() => console.log('Paid')}
          title="Agent Assisted Showing"
          subTitle='Simplified Scheduling & Approval'
          icon={LockIcon}
          amount={25}
        />
      )}
    </section>
  );
};

export default Showings;

