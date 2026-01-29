// import { Button } from '@/components/ui/button';
// import { formatDate, formatTime24to12 } from '@/lib/utils';

// type Props = {
//   showButton?: boolean;
//   date?: string;
//   address?: string;
//   time?:string;
// };

// const TourSchedule = ({
//   showButton = false,
//   address = '640 1527th Ky Gray, Kentucky(KY), 40734',
//   date,
//   time,
// }: Props) => {
//   const { day, month} = formatDate(date!);
//   const formatedTime =  time && formatTime24to12(time!);

//   return (
//     <section className='flex min-w-[350px] items-start gap-x-6 rounded-2xl border-[1px] border-black p-4'>
//       <p className='grid h-24 w-24 place-content-center rounded-xl bg-black px-2 py-3  text-center font-bold leading-snug text-white'>
//         <span className='block text-md'>{month || 'Jan'}</span>
//         <span className='block text-5xl'>{day === 'NaN' ? '01' : day}</span>
//       </p>
//       <div className='py-2'>
//         <span className='block text-lg font-bold text-ocOrange'>{formatedTime}</span>
//         <p className='max-w-[300px] text-sm'>{address}</p>
//       </div>
//       {showButton ? (
//         // <CustomButton
//         //   label="Edit"
//         //   className="bg-[#d8d8d8] text-white  w-max py-2 rounded-3xl"
//         // />

//         <Button
//           className='bg-[#d8d8d8] text-white'
//           variant='outline'
//           roundness='full'
//         >
//           Edit
//         </Button>
//       ) : null}
//     </section>
//   );
// };

// export default TourSchedule;

// export const ScheduleSkeleton = () => {
//   return (
//     <section className='min-w-[350px]  animate-pulse'>
//       <section className='flex animate-pulse items-center rounded-[10px] border border-grey-400 p-[10px] px-3'>
//         <div className='flex flex-col items-center rounded-[10px] bg-black px-6 py-2 text-white'>
//           <h3 className='h-8 text-3xl font-bold'></h3>
//           <p className='h-8 text-xs uppercase'></p>
//         </div>
//         <div className='ml-6'>
//           <aside className=''>
//             <h4 className='h-12 text-lg font-bold text-primary-main'></h4>
//             <p className='h-8 text-sm'></p>
//           </aside>
//         </div>
//       </section>
//       <div className='flex items-center justify-between'>
//         <div className='h-8'></div>
//       </div>
//     </section>
//   );
// };


import { Button } from '@/components/ui/button';
import { formatDate, formatTime24to12 } from '@/lib/utils';

type Props = {
  showButton?: boolean;
  date?: string;
  address?: string;
  time?:string;
};

const TourSchedule = ({
  showButton = false,
  address = '640 1527th Ky Gray, Kentucky(KY), 40734',
  date,
  time,
}: Props) => {
  const { day, month} = formatDate(date!);
  const formatedTime =  time && formatTime24to12(time!);

  return (
    <section className='flex min-w-[320px] items-start gap-x-6 rounded-2xl border-[1px] border-black p-4'>
      <p className='grid h-24 w-24 place-content-center rounded-xl bg-black px-2 py-3  text-center font-bold leading-snug text-white'>
        <span className='block text-md'>{month || 'Jan'}</span>
        <span className='block text-5xl'>{day === 'NaN' ? '01' : day}</span>
      </p>
      <div className='py-2'>
        <span className='block text-lg font-bold text-ocOrange'>{formatedTime}</span>
        <p className='max-w-[300px] text-sm'>{address}</p>
      </div>
      {showButton ? (
        // <CustomButton
        //   label="Edit"
        //   className="bg-[#d8d8d8] text-white  w-max py-2 rounded-3xl"
        // />

        <Button
          className='bg-[#d8d8d8] text-white'
          variant='outline'
          roundness='full'
        >
          Edit
        </Button>
      ) : null}
    </section>
  );
};

export default TourSchedule;

export const ScheduleSkeleton = () => {
  return (
    <section className='min-w-[350px]  animate-pulse'>
      <section className='flex animate-pulse items-center rounded-[10px] border border-grey-400 p-[10px] px-3'>
        <div className='flex flex-col items-center rounded-[10px] bg-black px-6 py-2 text-white'>
          <h3 className='h-8 text-3xl font-bold'></h3>
          <p className='h-8 text-xs uppercase'></p>
        </div>
        <div className='ml-6'>
          <aside className=''>
            <h4 className='h-12 text-lg font-bold text-primary-main'></h4>
            <p className='h-8 text-sm'></p>
          </aside>
        </div>
      </section>
      <div className='flex items-center justify-between'>
        <div className='h-8'></div>
      </div>
    </section>
  );
};
