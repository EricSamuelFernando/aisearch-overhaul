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
//             <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-650'>
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
//             <span className='!mb-3 flex items-center gap-x-2 !py-[1] text-sm !text-grey-650'>
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
//               <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-650'>
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
//             <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-650'>
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

export default function Component() {
  const { form } = useClaimsFormContext();

  return (
    <div>
      <h2 className='mb-4 font-bold'>Summary Terms</h2>

      <div className='grid grid-cols-2 place-content-center place-items-center content-center gap-10 md:grid-cols-3'>
        <CustomInput
          {...form.getInputProps('offerPrice.amount')}
          onChange={(e) => {
            form.setFieldValue(
              'offerPrice.amount',
              parseInt(e.currentTarget.value),
            );
          }}
          label={
            <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-650'>
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
            <span className='!mb-3 flex items-center gap-x-2 !py-[1] text-sm !text-grey-650'>
              <span>Finance Type Price</span>
            </span>
          }
          placeholder='Pick value'
          data={[
            { label: 'Loan', value: 'loan' },
            { label: 'Cash', value: 'cash' },
          ]}
          leftSection={<span className='text-black'>$</span>}
          handleChange={(val: string) => {
            // @ts-ignore
            form.setFieldValue('financeType', val);
          }}
          defaultValue={form.values.financeType}
          className='h-12 bg-grey-880'
          required
        />
        {form.values.financeType.includes('loan') ? (
          <CustomInput
            {...form.getInputProps('loanAmount.amount')}
            onChange={(e) => {
              form.setFieldValue(
                'loanAmount.amount',
                parseInt(e.currentTarget.value),
              );
            }}
            label={
              <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-650'>
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
          onChange={(e) => {
            form.setFieldValue(
              'downPayment.amount',
              parseInt(e.currentTarget.value),
            );
          }}
          label={
            <span className='!mb-3 flex items-center gap-x-2 gap-y-4 !py-[1] !text-sm !text-grey-650'>
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
        <CustomSelectNew
          setVal={form.setFieldValue}
          label='Finance Contingency'
          amtKey='financeContingency.amount'
          unitKey='financeContingency.unit'
          initialAmount={form.values.financeContingency.amount}
          initialUnit={form.values.financeContingency.unit}
        />
        <CustomSelectNew
          setVal={form.setFieldValue}
          label='Appraisal Contingency'
          amtKey='apprasalContingency.amount'
          unitKey='apprasalContingency.unit'
          initialAmount={form.values.apprasalContingency.amount}
          initialUnit={form.values.apprasalContingency.unit}
        />
        <CustomSelectNew
          setVal={form.setFieldValue}
          label='Inspection Contingency'
          amtKey='inspectionContingency.amount'
          unitKey='inspectionContingency.unit'
          initialAmount={form.values.inspectionContingency.amount}
          initialUnit={form.values.inspectionContingency.unit}
        />
        <CustomSelectNew
          setVal={form.setFieldValue}
          label='Close Escrow'
          amtKey='closeEscrow.amount'
          unitKey='closeEscrow.unit'
          initialAmount={form.values.closeEscrow.amount}
          initialUnit={form.values.closeEscrow.unit}
        />
      </div>
    </div>
  );
}
