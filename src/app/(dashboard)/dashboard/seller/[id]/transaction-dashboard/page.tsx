'use client';
import { useState } from 'react';
import { CalendarIcon, Info } from 'lucide-react';
import { OfferSummaryCardItem } from '@/components/dashboard/main/offerSummaryItem';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/lib/hook';
import { TransactionPropertyCard, TransactionPropertyCardButtons } from '@/components/dashboard/main/transaction-property-card';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

const steps = ['Accept Offer', 'Title & Escrow', 'Contingencies', 'Sign & Close'];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(2); // This state will be used to track the current step
  const { selectedOffer: offer } = useAppSelector(state => state.property);
  const claimedProperty = useSelector((state: any) => state.property.claimProperty);
  const router = useRouter()
  // Function to handle step click
  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Contingencies Section
  const contingenciesSection = () => (
    <div className="lg:col-span-3">
      <div className="bg-white p-6 pb-0 w-full rounded-lg">
        <div className="flex justify-between w-full items-center mb-2">
          <select className="border border-black rounded-md p-4 text-sm w-full">
            <option>Finance Contingency</option>
          </select>
        </div>

        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center bg-slate-100 p-2 rounded-md w-fit space-x-2 text-sm text-gray-600 mb-2">
            <CalendarIcon className="w-4 h-4" />
            <span>May 17, 2024</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">21 Days Left</p>
              <p className="text-sm text-gray-500 flex items-center">
                Finance <Info className="w-3 h-3 ml-1 text-orange-500" />
              </p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-md text-sm">Mark Complete</button>
          </div>
        </div>
      </div>

      <div className="bg-white px-6 rounded-md">
        <select className="w-full border border-black rounded-md p-4 text-sm w-full text-sm mb-3">
          <option>Appraisal Contingency</option>
        </select>
        <select className="w-full border border-black rounded-md p-4 text-sm w-full text-sm mb-3">
          <option>Inspection Contingency</option>
        </select>
      </div>
    </div>
  );

  // Sign & Close Section
  const signCloseSection = () => (
    <div>
      <p>Sign & Close</p>
    </div>
  );

  // Title & Escrow Section
  const titleEscrowSection = () => {
    return (
      <div className="space-y-6">
         <div className="mt-4  flex justify-end">
            <button className="px-4 py-2 bg-black text-white rounded-full text-white">Add Signatory</button>
          </div>
        <div className="bg-white  rounded-lg shadow-sm">
          {/* Title and Escrow Header */}
         
          
          {/* Seller Details */}
          <div className="space-y-4 ">
            <div className="bg-[#F7F2EB]  flex  space-x-8 space-y-4 flex-wrap p-8 rounded-lg shadow-sm">
              <h3 className="text-xl mb-2 font-medium  w-full text-gray-700">Seller Details</h3>
              <p className='flex flex-col'><strong>First Name:</strong> Dane</p>
              <p className='flex flex-col'><strong>Last Name:</strong> Deaner</p>
              <p className='flex flex-col'><strong>Middle Name:</strong> Deaner</p>
              <p className='flex flex-col' ><strong>Mobile:</strong> 616-2342-3245</p>
              <p className='flex flex-col'><strong>Email Address:</strong> James.lweobi@ocreel.com</p>
            </div>
            <div className="bg-[#F7F2EB]  flex  space-x-8 space-y-4 flex-wrap p-8 rounded-lg shadow-sm">
              <h3 className="text-xl mb-2 font-medium  w-full text-gray-700">Seller Details</h3>
              <p className='flex flex-col'><strong>First Name:</strong> Dane</p>
              <p className='flex flex-col'><strong>Last Name:</strong> Deaner</p>
              <p className='flex flex-col'><strong>Middle Name:</strong> Deaner</p>
              <p className='flex flex-col' ><strong>Mobile:</strong> 616-2342-3245</p>
              <p className='flex flex-col'><strong>Email Address:</strong> James.lweobi@ocreel.com</p>
            </div>
          </div>
  
          {/* Add Signatory Button */}
         
        </div>
  
      
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-8xl mx-auto space-y-2">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button onClick={()=>router.back()} className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Back</span>
          </button>
        </div>
        <div className="flex w-full justify-between  border-b items-center space-x-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">JD</div>
            <span className="text-sm font-medium">James Iweobi</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium">Dane Deaner</p>
              <p className="text-xs text-orange-500">Buyer</p>
            </div>
          </div>
          <div className="text-xs bg-orange-100 text-orange-600 py-1 px-2 rounded-full font-medium">1 Tasks</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#F8F8F8] p-8 py-16 rounded-lg shadow-sm space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => handleStepClick(index)} // Handle the click
                >
                  <div className={`w-4 h-4 rounded-full border ${index <= currentStep ? 'bg-black' : 'border-gray-400'}`} />
                  <span className={`text-sm ${index === currentStep ? 'text-orange-500 font-medium' : 'text-gray-700'}`}>{step}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#F8F8F8] p-4 rounded-lg shadow-sm text-center">
              <p className="text-lg font-bold mb-1">3/4</p>
              <p className="text-xs text-gray-500">steps complete</p>
            </div>

            <button className="w-full bg-gray-200 text-gray-500 rounded-md py-2 cursor-not-allowed">Complete</button>
          </div>

          {/* Display selected section based on the currentStep */}
          <div className="lg:col-span-3 space-y-6">
            {currentStep === 0 && <div className="bg-white p-6 rounded-lg shadow-sm">Accept Offer - Already Completed</div>}
            {currentStep === 1 && titleEscrowSection()}
            {currentStep === 2 && contingenciesSection()}
            {currentStep === 3 && signCloseSection()}
          </div>

          {/* Summary Section */}
          <div className="space-y-4 col-span-2">
            <TransactionPropertyCard
              imageSource={claimedProperty?.image}
              address={claimedProperty?.address}
              moreAddressDetails={claimedProperty?.name}
            />

            <p className='text-2xl font-bold'>Summary of Terms</p>

            <div className="bg-[#F8F8F8] p-5 rounded-lg shadow-sm">
              <div className="inline-block px-3 py-1 bg-lime-100 text-lime-700 rounded-full text-xs font-medium mb-4">
                Accepted
              </div>
              <div className=" grid grid-cols-2 items-center justify-between gap-5 px-4 ">
                <OfferSummaryCardItem
                  title="Offer Price"
                  description={formatCurrency(+offer?.price, offer?.offerPrice?.currency || 'USD')}
                  descriptionClass="font-bold"
                />
                <OfferSummaryCardItem
                  title="Loan Amount"
                  description={formatCurrency(+offer?.cashAmount, offer?.loanAmount?.currency || 'USD')}
                />
                <OfferSummaryCardItem title="Finance Type" description={offer?.financeType} />
                <OfferSummaryCardItem
                  title="Down Payment"
                  description={formatCurrency(+offer?.downPayment, offer?.downPayment?.currency || 'USD')}
                />

                <OfferSummaryCardItem
                  title="Finance Contingency"
                  description={`${offer?.financeContingencyDays} Days`}
                />
                <OfferSummaryCardItem
                  title="Appraisal Contingency"
                  description={`${offer?.appraisalContingencyDays} Days`}
                />
                <OfferSummaryCardItem
                  title="Inspection Contingency"
                  description={`${offer?.inspectionContingencyDays} Days`}
                />
                <OfferSummaryCardItem
                  title="Close Escrow"
                  description={`${offer?.closeEscrowDays} Days`}
                />
              </div>

              <button className="mt-5 w-full bg-black text-white py-2 rounded-md text-sm">
                View Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
