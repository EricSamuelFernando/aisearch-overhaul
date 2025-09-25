'use client';
import { useEffect, useState } from 'react';
import { CloseIcon, Progress } from '@mantine/core';
// import { useFAQApi, useIsFaqFilled } from "lib/api/useFAQApi";
// import { useParams, useRouter } from 'next/navigation';
// import { useAgentConversationApi } from 'lib/api/useConversationApi';
// import { encryptMessage } from 'lib/math-utilities';
// import { useAtom } from 'jotai';
// import { propertyReadWriteAtom } from 'store/atoms/property';
import Modal from '../common/Modal';
import { useAtom } from 'jotai';
import { propertyReadWriteAtom } from '@/store/atoms/property';
import { useParams, useRouter } from 'next/navigation';
import { useFAQApi, useIsFaqFilled } from '@/lib/api/useFAQApi';
import { useAgentConversationApi } from '@/lib/api/useConversationApi';

function BuyerApprovalForm({ data, setData, setCurrentStep }: any) {
  return (
    <div className="p-12 pt-0 pb-14 pt-12 w-full">
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Job</h3>
          <select
            value={data.job}
            onChange={(e) => setData((prev: any) => ({ ...prev, job: e.target.value }))}
            className="border text-sm border-gray-300 rounded-md w-full p-3"
          >
            <option value="">Enter a work area</option>
            <option value="Engineer">Engineer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Income</h3>
          <select
            value={data.income}
            onChange={(e) => setData((prev: any) => ({ ...prev, income: e.target.value }))}
            className="border text-sm border-gray-300 rounded-md w-full p-3"
          >
            <option value="">Select income type</option>
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      <h3 className="text-sm font-medium mb-2">Are they pre-approved?</h3>
      <div className="flex gap-4 text-sm mb-4">
        {["Yes", "No", "In Process"].map((opt) => (
          <button
            key={opt}
            onClick={() => setData((prev: any) => ({ ...prev, preApproved: opt }))}
            className={`p-2 border w-full rounded-md ${data.preApproved === opt ? 'bg-black text-white' : 'bg-white text-black'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-12">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">
          Cancel
        </button>
        <button onClick={() => setCurrentStep(2)} className="border px-10 py-2 border-black bg-black text-white rounded-full">
          Save
        </button>
      </div>
    </div>
  );
}

function BuyerDetailsForm({ data, setData, setCurrentStep }: any) {
  return (
    <div className="w-full p-12">
      <h3 className="text-sm font-medium mb-4">What is the buyer’s preferred closing timeline?</h3>
      <select
        value={data.closingTimeline}
        onChange={(e) => setData((prev: any) => ({ ...prev, closingTimeline: e.target.value }))}
        className="border text-sm border-gray-300 mb-12 rounded-md w-full p-2"
      >
        <option value="">Enter a timeline</option>
        <option value="30">30 days</option>
        <option value="60">60 days</option>
        <option value="90">90 days</option>
      </select>
      <h3 className="text-sm font-medium mb-4">Will I like the neighbors?</h3>
      <select
        value={data.neighborsLike}
        onChange={(e) => setData((prev: any) => ({ ...prev, neighbors: e.target.value }))}
        className="border text-sm border-gray-300 mb-12 rounded-md w-full p-2"
      >
        <option value="">Please select an option</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>

      <h3 className="text-sm font-medium mb-4">Will the buyer include any contingencies in their offer?</h3>
      <div className="flex gap-4 mb-12">
        {["Yes", "No", "Maybe"].map((opt) => (
          <button
            key={opt}
            onClick={() => setData((prev: any) => ({ ...prev, contingencies: opt }))}
            className={`p-2 border w-full rounded-md ${data.contingencies === opt ? 'bg-black text-white' : 'bg-white text-black'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-12">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">
          Cancel
        </button>
        <button onClick={() => setCurrentStep(3)} className="border px-10 py-2 border-black bg-black text-white rounded-full">
          Save
        </button>
      </div>
    </div>
  );
}

function BuyerTransactionForm({ data, setData, setCurrentStep, onSubmit }: any) {
  return (
    <div className="w-full p-12">
      <h3 className="text-sm font-medium mb-4">What is most important to the buyer in this transaction?</h3>
      <textarea
        value={data.importantToBuyer}
        onChange={(e) => setData((prev: any) => ({ ...prev, importantToBuyer: e.target.value }))}
        className="border border-gray-300 rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      />

      <h3 className="text-sm font-medium mb-4">Does the buyer have specific questions about the property?</h3>
      <textarea
        value={data.specificQuestions}
        onChange={(e) => setData((prev: any) => ({ ...prev, specificQuestions: e.target.value }))}
        className="border border-gray-300 rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      />

      <div className="flex justify-between mt-4">
        <button className="border px-10 py-2 border-black bg-white text-black rounded-full">
          Cancel
        </button>
        <button onClick={onSubmit} className="border px-10 py-2 border-black bg-black text-white rounded-full">
          Submit
        </button>
      </div>
    </div>
  );
}

function FaqBuyerModal(props: any) {
  const { setBuyerFaq, isAPI } = props;
  const [currentForm, setCurrentForm] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [currentProperty] = useAtom(propertyReadWriteAtom);
  console.log("Current property", currentProperty);

  const params = useParams();
  const engagementId = params?.id as string;
  const isValidEngagementId = typeof engagementId === 'string' && engagementId.length > 0;
  const router = useRouter()
  console.log("Data : ", currentProperty?.engagedProperty?.engagementId,'BUYER_AGENT',currentProperty?.engagedProperty?.userId,true);

  const { data: isFilled, isLoading, error } = useIsFaqFilled(
    currentProperty?.engagedProperty?.engagementId,
    'BUYER_AGENT',
    currentProperty?.engagedProperty?.userId,
    isValidEngagementId
  );
  const { createThreadMutation } = useAgentConversationApi()
  const [{ selectedProperty, engagedProperty }, setPropertyData] = useAtom(propertyReadWriteAtom)
  const faqToFormKeyMap: Record<string, keyof typeof formData> = {
  'Is the buyer pre-approved?': 'preApproved',
  'What is the buyer’s income type?': 'income',
  'What is the buyer’s job?': 'job',
  'Does the buyer have specific questions about the property?': 'specificQuestions',
  'What is most important to the buyer in this transaction?': 'importantToBuyer',
  'Will the buyer include any contingencies in their offer?': 'contingencies',
  'What is the buyer’s preferred closing timeline?': 'closingTimeline',
};
  const [formData, setFormData] = useState({
    closingTimeline: '',
    neighborsLike:'',
    contingencies: '',
    importantToBuyer: '',
    specificQuestions: '',
    job: '',
    income: '',
    preApproved: '',
  });

  const { createMultipleFaqsMutation, getAllFaqsByUserMutation } = useFAQApi(() => {
    setIsModalOpen(false);
  });

  const handleSubmit = async () => {
    const faqPayloads = [
      {
        question: "What is the buyer’s preferred closing timeline?",
        answer: formData.closingTimeline,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
      {
        question: "Will the buyer include any contingencies in their offer?",
        answer: formData.contingencies,
        agentType: "BUYER_AGENT",
        userId: currentProperty?.engagedProperty?.userId,
        engagementId,
      },
      {
        question: "What is most important to the buyer in this transaction?",
        answer: formData.importantToBuyer,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
      {
        question: "Does the buyer have specific questions about the property?",
        answer: formData.specificQuestions,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
      {
        question: "What is the buyer’s job?",
        answer: formData.job,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
      {
        question: "What is the buyer’s income type?",
        answer: formData.income,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
      {
        question: "Is the buyer pre-approved?",
        answer: formData.preApproved,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
      {
        question: "Will I like the neighbors?",
        answer: formData.neighborsLike,
        agentType: "BUYER_AGENT",
        engagementId,
        userId: currentProperty?.engagedProperty?.userId,
      },
    ].filter(item => item.answer);
    if (faqPayloads.length > 0) {
      await createMultipleFaqsMutation.mutateAsync({
        faqs: faqPayloads,
      });
    } else {
      console.log("No answers provided, not sending FAQ data.");
    }
    const threadPayloads = {
      listingId: engagedProperty?.engagement?.listingId?.toString(),
      propertyId: engagedProperty?.engagement?.propertyId,
      threadName: "New thread",
      // engagementId,
      propertyName: "New Property",
      propertyOwnerId: "29a5174b-b985-4239-a996-0c5d9cbc5591",
      buyerAgentId: "1b5ea235-556b-40db-a4a7-f71fd5ac5a37",
      sellerAgentId: "851524d2-7a93-4d06-b5d4-088a847f3f4a",
      //message: encryptMessage("Let's connect for this propperty")
      message: "Let's connect for this propperty"
    }

    await createThreadMutation.mutate(threadPayloads, {
      onSuccess: () => {
        router.push('/dashboard/chat')
      },
      onError: (error:any) => {

      },
    })

  };

  useEffect(() => {
    if (!engagementId) console.warn('Engagement ID not ready');
  }, [engagementId]);

  if (isLoading) return null;

  return (
    <>
      {isModalOpen && !isFilled && (
        <Modal closeModal={() => {
          setIsModalOpen(false)
          setBuyerFaq?.(false)
        }} isOpen={isModalOpen}>
          <div className="flex flex-col gap-2 overflow-x-hidden w-full">
            <div className="flex justify-between w-full p-12">
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-normal">Buyer Details</h3>
                <p className="text-md opacity-80">
                  Share details about the buyer in 5 minutes.
                </p>
              </div>
              <CloseIcon
                size="40"
                onClick={() => {
                  setIsModalOpen(false)
                }}
                className="cursor-pointer"
              />
            </div>

            <Progress color="orange" radius="xs" size="xs" value={33.33 * currentForm} />

            {currentForm === 1 && (
              <BuyerApprovalForm
                data={formData}
                setData={setFormData}
                setCurrentStep={setCurrentForm}
              />
            )}
            {currentForm === 2 && (
              <BuyerDetailsForm
                data={formData}
                setData={setFormData}
                setCurrentStep={setCurrentForm}
              />
            )}
            {currentForm === 3 && (
              <BuyerTransactionForm
                data={formData}
                setData={setFormData}
                onSubmit={handleSubmit}
                setCurrentStep={setCurrentForm}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
export default FaqBuyerModal;