'use client';

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import DocumentCard from './document-card';
import { AgentInfoCard } from '../agent/agent-info-card';
import { AgentPropertyCard } from '../agent/agent-property-card';
import { formatCurrency, formatNumberWithCommas } from '@/lib/utils';
import { OfferSummaryCard } from './offer-summary-card';
import { useAppSelector } from '@/lib/hook';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { OfferExpirationPicker } from './offer-expiration-picker';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { error, success } from '@/components/alert/notify';

type Props = {};

const CounterOfferComponent = ({}: Props) => {
  /* ───────────── Fetch the original offer ───────────── */
  const params  = useSearchParams();
  const offerId = params?.get('id') ?? '';
  const { getOfferDetails } = useAgentOfferApi(offerId);
  const { data: offerResp } = getOfferDetails;
  const offer = offerResp?.data.data;
  const currentUser = useSelector(userData);
  /* ───────────── Global redux slice ───────── */
  const { selectedOffer } = useAppSelector((state) => state.property);
  const claimedProperty = useAppSelector((state: any) => state.property.claimProperty);
  /* ───────────── Local state (controlled inputs) ───────────── */
  const [offerPrice, setOfferPrice]         = useState('');            // formatted string
  const [downPayment, setDownPayment]       = useState('');            // formatted string
  const [financeType, setFinanceType]       = useState<'loan' | 'cash'>('loan');
  const [financeCont, setFinanceCont]       = useState('');
  const [appraisalCont, setAppraisalCont]   = useState('');
  const [inspectionCont, setInspectionCont] = useState('');
  const [specialTerms, setSpecialTerms]     = useState('');
  const [description, setDescription]     = useState('');
  const [expiryDate, setExpiryDate] = useState<any>('');
  /* Pre-populate fields when selectedOffer arrives */
  useEffect(() => {
    if (!selectedOffer) return;
    setOfferPrice(formatNumberWithCommas(selectedOffer.price || 0));
    setDownPayment(formatNumberWithCommas(selectedOffer.downPayment || 0));
    setFinanceType(selectedOffer.financeType ?? 'loan');
    setFinanceCont(`${selectedOffer.financeContingencyDays ?? ''}`);
    setAppraisalCont(`${selectedOffer.appraisalContingencyDays ?? ''}`);
    setInspectionCont(`${selectedOffer.inspectionContingencyDays ?? ''}`);
    setSpecialTerms(selectedOffer.specialTerms ?? '');
  }, [selectedOffer]);

 
  const { createPropertyCounterOffer:{mutate} } = usePropertyServiceAPI();
  
  const router = useRouter();
  console.log(claimedProperty)

  const handlePriceChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!Number.isNaN(Number(rawValue))) {
      setter(formatNumberWithCommas(Number(rawValue)));
    }
  };

  const parseMoney = (input: string) => Number(input.replace(/,/g, '') || 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
   
         userId:currentUser?.id,
         price:    parseMoney(offerPrice),
         downPayment:   parseMoney(downPayment),
         financeType,
         financeContingencyDays:    Number(financeCont),
         appraisalContingencyDays:  Number(appraisalCont),
         inspectionContingencyDays: Number(inspectionCont),
         specialTerms:specialTerms,
         description,
         offerId:selectedOffer?.id,
         cashAmount:selectedOffer?.cashAmount,
         propertyId:claimedProperty?.id.toString(),
         listingId:claimedProperty?.listingid.toString(),
         closeEscrowDays:selectedOffer?.closeEscrowDays || 0,
         expiryDate
         //documentIds: selectedOffer?.documents.map((d:any) => d._id) ?? [],
      
   }
      console.log(payload)
      await mutate(payload);


      success({message:'Counter-offer sent!'});
      router.push(`/dashboard/seller/${claimedProperty?.id}/transactions?id=223582699&tab=counter-offers`);
    } catch (err:any) {
      /* eslint-disable no-console */
       error({message: err?.message || 'Failed to create counter-offer'});
      // toast.error(`Oops: ${getErrorMessage(err)}`);
    }
  };

  /* ───────────── UI ───────────── */
  return (
    <section className='grid grid-cols-9 gap-8'>
      <div className='col-span-6'>
        {/* Header & recipient */}
        <div className='mb-4 flex items-center'>
          <button onClick={() => router.back()} className='gap-x-8 text-lg font-medium text-black'>
            &larr; Back
          </button>
        </div>

        <Heading title='Counter Offer' className='py-8 text-3xl' />
        <Heading title='Presented to'  className='my-8 px-6 text-xl' />
        <div className='flex gap-x-16 px-6'>
          <AgentInfoCard
            profile={selectedOffer?.createdBy?.profile || ''}
            name={`${selectedOffer?.createdBy?.firstName} ${selectedOffer?.createdBy?.lastName}`}
            mail={selectedOffer?.createdBy?.email}
            phone={selectedOffer?.createdBy?.phone}
          />
        </div>
        <Heading title='Offer Expiration' className='my-6 text-xl font-medium' />
        <OfferExpirationPicker onChange={(dateTime) => setExpiryDate(dateTime?.toString())} />
        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-6 px-6'>
          <section className='my-10 text-xl font-bold'>Summary of Terms</section>

          {/* Price / Finance type / Down payment */}
          <div className='mb-16 flex gap-x-20'>
            {/* Offer price */}
            <div>
              <label className='text-base font-medium text-grey-670'>Offer Price</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 transform text-grey-670'>
                  {formatCurrency(0, 'USD').replace(/\d/g, '')}
                </span>
                <input
                  type='text'
                  className='mt-1 block w-full rounded-lg bg-grey-880 p-3 pl-8 text-center'
                  value={offerPrice}
                  onChange={(e) => handlePriceChange(e, setOfferPrice)}
                />
              </div>
            </div>

            {/* Finance type */}
            <div>
              <label className='text-base font-medium text-grey-670'>Finance Type</label>
              <select
                className='mt-1 block w-full rounded-lg bg-grey-880 p-3'
                value={financeType}
                onChange={(e) => setFinanceType(e.target.value as 'loan' | 'cash')}
              >
                <option value='loan'>Loan</option>
                <option value='cash'>Cash</option>
              </select>
            </div>

            {/* Down payment */}
            <div>
              <label className='text-base font-medium text-grey-670'>Down Payment</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 transform text-grey-670'>
                  {formatCurrency(0, 'USD').replace(/\d/g, '')}
                </span>
                <input
                  type='text'
                  className='mt-1 block w-full rounded-lg bg-grey-880 p-3 pl-8 text-center'
                  value={downPayment}
                  onChange={(e) => handlePriceChange(e, setDownPayment)}
                />
              </div>
            </div>
          </div>

          {/* Contingencies */}
          <div className='flex gap-x-20'>
            <InputBlock
              label='Finance Contingency'
              value={financeCont}
              onChange={(e) => setFinanceCont(e.target.value)}
            />
            <InputBlock
              label='Appraisal Contingency'
              value={appraisalCont}
              onChange={(e) => setAppraisalCont(e.target.value)}
            />
            <InputBlock
              label='Inspection Contingency'
              value={inspectionCont}
              onChange={(e) => setInspectionCont(e.target.value)}
            />
          </div>

          {/* Special terms */}
          <div>
            <section className='my-10 text-xl font-bold'>Special Terms</section>
            <textarea
              className='mt-1 block w-4/5 resize-none rounded-lg bg-grey-880 p-6 focus:outline-none'
              value={specialTerms}
              onChange={(e) => setSpecialTerms(e.target.value)}
            />
          </div>
          <div>
            <section className='my-10 text-xl font-bold'>Description</section>
            <textarea
              className='mt-1 block w-4/5 resize-none rounded-lg bg-grey-880 p-6 focus:outline-none'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Documents */}
          <div className='flex gap-x-4'>
            {offer?.documents.map((doc) => (
              <DocumentCard key={doc._id} documentId={doc._id} title={doc.name} description='' />
            ))}
          </div>

          {/* <Button variant='secondary' type='submit' >
           
          </Button> */}
        </form>
      </div>

      {/* Right-hand column */}
      <div className='col-span-3'>
        <AgentPropertyCard
          moreAddressDetails={`${offer?.property?.propertyAddressDetails?.province} ${offer?.property?.propertyAddressDetails.postalCode}`}
          address={offer?.property?.propertyAddressDetails?.formattedAddress}
        />
        <Heading title='Summary of Terms' className='mt-3 text-xl font-bold' />
        <OfferSummaryCard offer={selectedOffer} isCounterOfferPage={true} coutnerOfferHandler={handleSubmit} />
      </div>
    </section>
  );
};

/* ───────────── Reusable small component ───────────── */
const InputBlock = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => (
  <div>
    <label className='text-base font-medium text-grey-670'>{label}</label>
    <input
      type='number'
      className='mt-1 block w-full rounded-lg bg-grey-880 p-3'
      value={value}
      onChange={onChange}
    />
  </div>
);

export default CounterOfferComponent;
