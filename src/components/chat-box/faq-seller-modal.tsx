'use client';
import { useState } from 'react';
import { CloseIcon, Progress } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { claimedPropertyReadWriteAtom } from '@/store/atoms/claimed-property';
import { useAgentConversationApi } from '@/lib/api/useConversationApi';
import { useFAQApi, useIsFaqFilled } from '@/lib/api/useFAQApi';
import { agentReadWriteAtom } from '@/store/atoms/agent-atom';
import Modal from '../common/Modal';
// import { Button } from 'components/common/buttons/Button';
// import Modal from 'components/common/Modal';
// import { useAtom } from 'jotai';
// import { propertyReadWriteAtom } from 'store/atoms/property';
// import { claimedPropertyReadWriteAtom } from 'store/atoms/claimed-property';
// import { useFAQApi, useIsFaqFilled } from 'lib/api/useFAQApi';
// import { useAgentConversationApi } from 'lib/api/useConversationApi';
// import { encryptMessage } from 'lib/math-utilities';
// import { useRouter } from 'next/navigation';
// import { agentReadWriteAtom } from 'store/atoms/agent-atom';

function BuyerDetailsForm({ setCurrentStep, formData, setFormData }: any) {
  const handleSave = () => {
    setCurrentStep((current: number) => current + 1);
  };

  return (
    <div className="w-full p-12 pt-4">
      <h3 className="text-sm font-medium mb-4">What is the buyer’s preferred closing timeline?</h3>
      <select
        value={formData.closingTimeline}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, closingTimeline: e.target.value }))}
        className="border text-sm border-gray-300 mb-12 rounded-md w-full p-2"
      >
        <option value="">Enter a timeline</option>
        <option value="30">30 days</option>
        <option value="60">60 days</option>
        <option value="90">90 days</option>
      </select>

      <h3 className="text-sm font-medium mb-4">Can I raise a family here?</h3>
      <select
        value={formData.raiseFamily}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, raiseFamily: e.target.value }))}
        className="border text-sm border-gray-300 mb-12 rounded-md w-full p-2"
      >
        <option value="">Enter a timeline</option>
        <option value="30">30 days</option>
        <option value="60">60 days</option>
        <option value="90">90 days</option>
      </select>

      <h3 className="text-sm font-medium mb-4">Does the buyer have specific questions about the property?</h3>
      <textarea
        value={formData.specificSellerQuestions}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, specificSellerQuestions: e.target.value }))}
        className="border border-gray-300 rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      />

      <div className="flex justify-between mt-4">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">Cancel</button>
        <button onClick={handleSave} className="border px-10 py-2 border-black bg-black text-white rounded-full">Save</button>
      </div>
    </div>
  );
}

function SellerPropertyInfoForm({ setCurrentStep, setIsModalOpen, formData, setFormData }: any) {
  const router = useRouter();
  const [currentProperty] = useAtom(claimedPropertyReadWriteAtom)
  const { createThreadMutation } = useAgentConversationApi()
  const { createMultipleFaqsMutation, getAllFaqsByUserMutation } = useFAQApi(() => {
    setIsModalOpen(false);
  });
  const handleSave = async () => {
    try {
      const faqPayloads = [
        {
          question: "Are there any current offers on the property?",
          answer: formData?.currentOffers,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Why were they rejected?",
          answer: formData?.offerRejectionReason,
          agentType: "SELLER_AGENT",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10"
        },
        {
          question: "What is the buyer’s preferred closing timeline?",
          answer: formData?.closingTimeline,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Does the buyer have specific questions about the property?",
          answer: formData?.specificSellerQuestions,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Are there any current offers on the property?",
          answer: formData?.compensationOffers,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Is it negotiable?",
          answer: formData?.isNegotiable,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Are offers being reviewed as they come?",
          answer: formData?.reviewAsTheyCome,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Is the seller open to preemptive offers?",
          answer: formData?.preemptiveOffers,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "What factors, other than price, would influence the seller’s decision?",
          answer: formData?.importantToBuyer,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Provide specific information about zoning for this property?",
          answer: formData?.zoningInfo,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
        {
          question: "Can I raise a family here?",
          answer: formData?.raiseFamily,
          agentType: "SELLER_AGENT",
          engagementId: "8a40a567-e923-41c6-8d81-6c36369cbc10",
          userId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        },
      ].filter(item => item.answer);
    
      if (faqPayloads.length > 0) {
      await createMultipleFaqsMutation.mutateAsync({
        faqs: faqPayloads,
      });
      }else {
        console.log("No answers provided, not sending FAQ data.");
      }
      const threadPayloads = {
        listingId: currentProperty?.listingId?.toString(),
        propertyId: currentProperty?.id,
        threadName: "New thread",
        propertyName: "New Property",
        propertyOwnerId: currentProperty?.snaphomz_sale_data?.owner?.owner?.owner_id,
        buyerAgentId: "1b5ea235-556b-40db-a4a7-f71fd5ac5a37",
        sellerAgentId: currentProperty?.agent_id,
        // message: encryptMessage("Let's connect for this propperty")
        message: "Let's connect for this propperty"
      }

      await createThreadMutation.mutate(threadPayloads, {
        onSuccess: (data) => {
          router.push('/dashboard/chat')
        },
        onError: (error) => {

        },
      })
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  return (
    <div className="w-full p-12 pt-4">
      <h3 className="text-sm mb-4 font-medium">What factors, other than price, would influence the seller’s decision?</h3>
      <textarea
        value={formData.importantToBuyer}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, importantToBuyer: e.target.value }))}
        className="border border-gray-300 rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      />

      <h3 className="text-sm font-medium mb-4">Provide specific information about zoning for this property?</h3>
      <textarea
        value={formData.zoningInfo}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, zoningInfo: e.target.value }))}
        className="border border-gray-300 rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      />

      <div className="flex justify-between mt-4">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">Cancel</button>
        <button onClick={handleSave} className="border px-10 py-2 border-black bg-black text-white rounded-full">Save</button>
      </div>
    </div>
  );
}

function SellerOfferForm({ setCurrentStep, formData, setFormData }: any) {
  const handleSave = () => {
    setCurrentStep((current: number) => current + 1);
  };

  return (
    <div className="p-12 pt-0 pb-14 w-full">
      <h3 className="text-sm font-medium mb-2">Are there any current offers on the property?</h3>
      <div className="flex gap-4 text-sm mb-10">
        {['Yes', 'No'].map(option => (
          <button
            key={option}
            onClick={() => setFormData((prev: any) => ({ ...prev, currentOffers: option }))}
            className={`p-2 border border-black w-full text-black rounded-md ${formData.currentOffers === option ? 'border-orange-500' : 'bg-white'}`}
          >
            {option}
          </button>
        ))}
      </div>

      {formData.currentOffers === 'No' && (
        <>
          <h3 className="text-sm font-medium mb-4">Why were they rejected?</h3>
          <textarea
            value={formData.offerRejectionReason}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, offerRejectionReason: e.target.value }))}
            className="border border-gray-300 rounded-md w-full p-2 mb-6 h-20 resize-none"
            placeholder="Description"
          />
        </>
      )}

      <div className="flex justify-between mt-4">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">Cancel</button>
        <button onClick={handleSave} className="border px-10 py-2 border-black bg-black text-white rounded-full">Save</button>
      </div>
    </div>
  );
}

function SellerCompensationForm({ setCurrentStep, formData, setFormData }: any) {
  const handleSave = () => {
    setCurrentStep((current: number) => current + 1);
  };

  return (
    <div className="p-12 pt-0 pb-14 w-full">
      <h3 className="text-sm font-medium mb-2">Are there any current offers on the property?</h3>
      <div className="flex gap-4 text-sm mb-10">
        {['Yes', 'No'].map(option => (
          <button
            key={option}
            onClick={() => setFormData((prev: any) => ({ ...prev, compensationOffers: option }))}
            className={`p-2 border border-black w-full text-black rounded-md ${formData.compensationOffers === option ? 'border-orange-500' : 'bg-white'}`}
          >
            {option}
          </button>
        ))}
      </div>

      {formData.compensationOffers === 'Yes' && (
        <>
          <h3 className="text-sm font-medium mb-2">Is it negotiable?</h3>
          <div className="flex gap-4 text-sm mb-10">
            {['Yes', 'No'].map(option => (
              <button
                key={option}
                onClick={() => setFormData((prev: any) => ({ ...prev, isNegotiable: option }))}
                className={`p-2 border border-black w-full text-black rounded-md ${formData.isNegotiable === option ? 'border-orange-500' : 'bg-white'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between mt-4">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">Cancel</button>
        <button onClick={handleSave} className="border px-10 py-2 border-black bg-black text-white rounded-full">Save</button>
      </div>
    </div>
  );
}

function SellerOfferReviewForm({ setCurrentStep, formData, setFormData }: any) {
  const handleSave = () => {
    setCurrentStep((current: number) => current + 1);
  };

  return (
    <div className="p-12 pt-0 pb-14 w-full">
      <h3 className="text-sm font-medium mb-2">Are offers being reviewed as they come?</h3>
      <div className="flex gap-4 text-sm mb-10">
        {['Yes', 'No'].map(option => (
          <button
            key={option}
            onClick={() => setFormData((prev: any) => ({ ...prev, reviewAsTheyCome: option }))}
            className={`p-2 border border-black w-full text-black rounded-md ${formData.reviewAsTheyCome === option ? 'border-orange-500' : 'bg-white'}`}
          >
            {option === 'No' ? 'No, there’s a set offer date' : 'Yes'}
          </button>
        ))}
      </div>

      {formData.reviewAsTheyCome === 'No' && (
        <>
          <h3 className="text-sm font-medium mb-2">Is the seller open to preemptive offers?</h3>
          <div className="flex gap-4 text-sm mb-10">
            {['Yes', 'No'].map(option => (
              <button
                key={option}
                onClick={() => setFormData((prev: any) => ({ ...prev, preemptiveOffers: option }))}
                className={`p-2 border border-black w-full text-black rounded-md ${formData.preemptiveOffers === option ? 'border-orange-500' : 'bg-white'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between mt-4">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">Cancel</button>
        <button onClick={handleSave} className="border px-10 py-2 border-black bg-black text-white rounded-full">Save</button>
      </div>
    </div>
  );
}

function FaqSellerModal(props: any) {
  const { setSellerFaq } = props;
  const [agentData] = useAtom(agentReadWriteAtom);
  const [currentForm, setCurrentForm] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [formData, setFormData] = useState<any>({
    closingTimeline: '',
    raiseFamily:'',
    specificSellerQuestions: '',
    importantToBuyer: '',
    zoningInfo: '',
    currentOffers: '',
    offerRejectionReason: '',
    compensationOffers: '',
    isNegotiable: '',
    reviewAsTheyCome: '',
    preemptiveOffers: '',
  });

  const { data: isFilled, isLoading, error } = useIsFaqFilled(
    "8a40a567-e923-41c6-8d81-6c36369cbc10",
    'SELLER_AGENT',
    agentData?.user?.id || "",
    true
  );

  return (
    <>
      {!isFilled && (
        <Modal closeModal={() => {
          setIsModalOpen(false);
          setSellerFaq?.(false);
        }} isOpen={isModalOpen}>
          <div className="flex flex-col gap-2 overflow-x-hidden w-full">
            <div className='flex justify-between w-full p-12'>
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-normal">Seller Details</h3>
                <p className="text-md opacity-80">Share details about the seller in 5 minutes.</p>
              </div>
              <CloseIcon size='40' onClick={() => {
                setIsModalOpen(false);
                setSellerFaq?.(false);
              }} className='cursor-pointer' />
            </div>

            <Progress color="orange" radius="xs" size="xs" value={20 * currentForm} />

            {
              currentForm === 1 ? <SellerOfferForm setCurrentStep={setCurrentForm} formData={formData} setFormData={setFormData} /> :
                currentForm === 2 ? <BuyerDetailsForm setCurrentStep={setCurrentForm} formData={formData} setFormData={setFormData} /> :
                  currentForm === 3 ? <SellerCompensationForm setCurrentStep={setCurrentForm} formData={formData} setFormData={setFormData} /> :
                    currentForm === 4 ? <SellerOfferReviewForm setCurrentStep={setCurrentForm} formData={formData} setFormData={setFormData} /> :
                      currentForm === 5 ? <SellerPropertyInfoForm setCurrentStep={setCurrentForm} formData={formData} setFormData={setFormData} setIsModalOpen={setIsModalOpen} /> :
                        null
            }
          </div>
        </Modal>
      )}
    </>
  );
}

export default FaqSellerModal;
