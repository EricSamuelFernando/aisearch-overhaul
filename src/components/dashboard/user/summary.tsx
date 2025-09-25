// 'use client';

// import CustomNativeSelect from '@/components/customs/select';
// import { CustomSelectNew } from '@/components/select/SelectInput';
// import CustomCheckbox from '@/components/customs/checkbox';
// import CustomInput from '@/components/customs/input';
// import { useClaimsFormContext } from '@/providers/claim-context';

// function SummarySection() {
//   const { form } = useClaimsFormContext();

//   return (
//     <div>
//       <h2 className='mb-4 font-bold'>Summary Terms</h2>

//       <div className='grid grid-cols-2 place-content-center place-items-center content-center gap-10 md:grid-cols-3'>
//         <CustomInput
//           {...form.getInputProps('offerPrice.amount')}
//           onChange={(e) => {
//             form.setFieldValue(
//               'offerPrice.amount',
//               parseInt(e.currentTarget.value),
//             );
//           }}
//           label={
//             <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-250'>
//               <span>Offer Price Amount</span>
//             </span>
//           }
//           placeholder='Enter Offer Price Amount'
//           leftSection={<span className='text-black'>$</span>}
//           type='number'
//           containerClass='!mb-0'
//           className='mb-0 bg-[#F5F8FA]'
//           required
//           min={0}
//         />
//         <CustomNativeSelect
//           label={
//             <span className='!mb-3 flex items-center gap-x-2 !py-[1] text-sm !text-grey-250'>
//               <span>Finance Type Price</span>
//             </span>
//           }
//           placeholder='Pick value'
//           data={[
//             { label: 'Loan', value: 'loan' },
//             { label: 'Cash', value: 'cash' },
//           ]}
//           leftSection={<span className='text-black'>$</span>}
//           handleChange={(val: string) => {
//             // @ts-ignore
//             form.setFieldValue('financeType', val);
//           }}
//           defaultValue={form.values.financeType}
//           className='h-12 bg-grey-880'
//           required
//         />
//         {form.values.financeType.includes('loan') ? (
//           <CustomInput
//             {...form.getInputProps('loanAmount.amount')}
//             onChange={(e) => {
//               form.setFieldValue(
//                 'loanAmount.amount',
//                 parseInt(e.currentTarget.value),
//               );
//             }}
//             label={
//               <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-250'>
//                 <span>Loan Amount</span>
//               </span>
//             }
//             placeholder='Enter Loan Amount'
//             leftSection={<span className='text-black'>$</span>}
//             type='number'
//             containerClass='!mb-0'
//             className='mb-0 bg-[#F5F8FA]'
//             required
//             min={0}
//           />
//         ) : null}
//         <CustomInput
//           {...form.getInputProps('downPayment.amount')}
//           onChange={(e) => {
//             form.setFieldValue(
//               'downPayment.amount',
//               parseInt(e.currentTarget.value),
//             );
//           }}
//           label={
//             <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-250'>
//               <span>Down Payment</span>
//             </span>
//           }
//           placeholder='Enter Down Payment Amount'
//           leftSection={<span className='text-black'>$</span>}
//           type='number'
//           className='bg-[#F5F8FA]'
//           required
//           containerClass='!mb-0'
//           min={0}
//         />
//         <CustomSelectNew
//           setVal={form.setFieldValue}
//           label='Finance Contingency'
//           amtKey='financeContingency.amount'
//           unitKey='financeContingency.unit'
//         />
//         <CustomSelectNew
//           setVal={form.setFieldValue}
//           label='Appraisal Contigency'
//           amtKey='appraisalContigency.amount'
//           unitKey='appraisalContigency.unit'
//         />{' '}
//         <CustomSelectNew
//           setVal={form.setFieldValue}
//           label='Inspection Contingency'
//           amtKey='inspectionContingency.amount'
//           unitKey='inspectionContingency.unit'
//         />{' '}
//         <CustomSelectNew
//           setVal={form.setFieldValue}
//           label='Close Escrow'
//           amtKey='closeEscrow.amount'
//           unitKey='closeEscrow.unit'
//         />
//       </div>
//     </div>
//   );
// }

// export default SummarySection;

'use client';

import CustomNativeSelect from '@/components/customs/select';
import CustomSelectNew from '@/components/select/SelectInput';
import CustomInput from '@/components/customs/input';
import { useClaimsFormContext } from '@/providers/claim-context';
import { useAppSelector } from '@/lib/hook';
import { useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';

export default function Component() {
  const params = useSearchParams()
  const { form } = useClaimsFormContext();
  const requestType = params?.get('type')
  const { selectedOffer } = useAppSelector((state) => state.property);
  const offerData = requestType === "edit" ? selectedOffer : {};


  console.log(offerData, "edit summary")

  return (
    <div>
      <h2 className='mb-4 font-bold'>Summary Terms</h2>

      <div className='grid grid-cols-2 place-content-center place-items-center content-center gap-10 md:grid-cols-3'>
        <CustomInput
          {...form.getInputProps('offerPrice.amount')}
          value={form.values.offerPrice?.amount}
          onChange={(e) => {
            form.setFieldValue('offerPrice.amount', parseInt(e.currentTarget.value, 10));
          }}
          label={
            <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-250'>
              <span>Offer Price Amount</span>
            </span>
          }
          placeholder='Enter Offer Price Amount'
          leftSection={<span className='text-black'>$</span>}
          type='number'
          containerClass='!mb-0'
          className='mb-0 bg-[#F5F8FA]'
          required
          min={0}
        />

        <CustomNativeSelect
          label={
            <span className='!mb-3 flex items-center gap-x-2 !py-[1] !text-sm !text-grey-250'>
              <span>Finance Type Price</span>
            </span>
          }
          placeholder='Pick value'
          data={[
            { label: 'Loan', value: 'loan' },
            { label: 'Cash', value: 'cash' },
          ]}
          leftSection={<span className='text-black'>$</span>}
          handleChange={(val: any) => {
            form.setFieldValue('financeType', val);
          }}
          value={form.values.financeType}
          className='h-12 bg-grey-880'
          required
        />

        {form.values.financeType === 'loan' ? (
          <CustomInput
            {...form.getInputProps('loanAmount.amount')}
            value={form.values.loanAmount?.amount}
            onChange={(e) => {
              form.setFieldValue('loanAmount.amount', parseInt(e.currentTarget.value, 10));
            }}
            label={
              <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-250'>
                <span>Loan Amount</span>
              </span>
            }
            placeholder='Enter Loan Amount'
            leftSection={<span className='text-black'>$</span>}
            type='number'
            containerClass='!mb-0'
            className='mb-0 bg-[#F5F8FA]'
            required
            min={0}
          />



        ) : null}

        <CustomInput
          {...form.getInputProps('downPayment.amount')}
          value={form.values.downPayment?.amount}
          onChange={(e) => {
            form.setFieldValue('downPayment.amount', parseInt(e.currentTarget.value, 10));
          }}
          label={
            <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-250'>
              <span>Down Payment</span>
            </span>
          }
          placeholder='Enter Down Payment Amount'
          leftSection={<span className='text-black'>$</span>}
          type='number'
          className='bg-[#F5F8FA]'
          required
          containerClass='!mb-0'
          min={0}
        />



        
      
      <div className='flex w-full'>
          <CustomSelectNew
            setVal={form.setFieldValue}
            label='Finance Contingency'
            amtKey='financeContingency.amount'
            unitKey='financeContingency.unit'
            initialAmount={offerData?.financeContingencyDays || form.values.financeContingency?.amount}
            initialUnit={form.values.financeContingency?.unit || 'yes'}
            
          />


          <div className="relative group">
            <button type="button" className="text-[#FF8700] hover:text-orange-600">
              <Info className="w-3 h-3" />
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              Please add number of days
            </span>
          </div>
        </div>

      <div className='flex w-full'>
        <CustomSelectNew
          setVal={form.setFieldValue}
          label='Appraisal Contingency'
          amtKey='apprasalContingency.amount'
          unitKey='apprasalContingency.unit'
          initialAmount={offerData?.appraisalContingencyDays || form.values.apprasalContingency?.amount}
          initialUnit={form.values.apprasalContingency?.unit || 'yes'}
        />
        <div className="relative group">
        <button type="button" className="text-[#FF8700] hover:text-orange-600">
          <Info className="w-3 h-3" />
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          Please add number of days
        </span>
      </div>
      </div>

      <div className='flex w-full'>

        <CustomSelectNew
          setVal={form.setFieldValue}
          label='Inspection Contingency'
          amtKey='inspectionContingency.amount'
          unitKey='inspectionContingency.unit'
          initialAmount={offerData?.inspectionContingencyDays || form.values.inspectionContingency?.amount}
          initialUnit={form.values.inspectionContingency?.unit || 'yes'}
        />
      <div className="relative group">
        <button type="button" className="text-[#FF8700] hover:text-orange-600">
          <Info className="w-3 h-3" />
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          Please add number of days
        </span>
      </div>
      </div>


      <div className='flex w-full'>
        <CustomSelectNew
          setVal={form.setFieldValue}

          label='Close Escrow'
          amtKey='closeEscrow.amount'
          unitKey='closeEscrow.unit'
          initialAmount={offerData?.closeEscrowDays || form.values.closeEscrow?.amount}
          initialUnit={form.values.closeEscrow?.unit || 'yes'}
        />
       <div className="relative group">
        <button type="button" className="text-[#FF8700] hover:text-orange-600">
          <Info className="w-3 h-3" />
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          Please add number of days
        </span>
      </div>
      </div>

      </div>
    </div>
  );
}