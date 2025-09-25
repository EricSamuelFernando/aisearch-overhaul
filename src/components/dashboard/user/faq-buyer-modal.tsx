'use client';

import { useEffect, useState } from 'react';
import CustomModal from '@/components/shared/custom-modal';
import { useDisclosure } from '@mantine/hooks';
import { CloseIcon, Progress, Stepper, StepperProps } from '@mantine/core';
import { Button } from '@/components/ui/button';


function BuyerDetailsForm({setCurrentStep}:any) {
  const [closingTimeline, setClosingTimeline] = useState('');
  const [contingencies, setContingencies] = useState('');

  const handleSave = () => {
    // Handle saving logic here
    console.log('Saved data:', { closingTimeline, contingencies });
    setCurrentStep((current:any) => current + 1)
  };

  return (
    <div className="w-full p-12">
      <h3 className="text-md font-medium mb-4">What is the buyer’s preferred closing timeline?</h3>
      <select
        value={closingTimeline}
        onChange={(e) => setClosingTimeline(e.target.value)}
        className="border border-gray-300 mb-12 rounded-md w-full p-4 "
      >
        <option value="">Enter a timeline</option>
        <option value="30">30 days</option>
        <option value="60">60 days</option>
        <option value="90">90 days</option>
      </select>

      <h3 className="text-md font-medium mb-4">Will the buyer include any contingencies in their offer?</h3>
      <div className="flex gap-4 mb-12">
        <Button
          onClick={() => setContingencies('Yes')}
          className={`p-6 border border-black w-full  text-black rounded-md ${contingencies === 'Yes' ? 'bg-black text-white' : 'bg-white'}`}
        >
          Yes
        </Button>
        <Button
          onClick={() => setContingencies('No')}
          className={`p-6  border border-black w-full  text-black  ${contingencies === 'No' ? 'bg-black text-white' : 'bg-white'}`}
        >
          No
        </Button>
        <Button
          onClick={() => setContingencies('Maybe')}
          className={`p-6 border border-black w-full  text-black  ${contingencies === 'Maybe' ? 'bg-black text-white' : 'bg-white'}`}
        >
          Maybe
        </Button>
      </div>
      <div className="flex justify-between">
        <Button onClick={() => console.log('Cancelled')} className="border px-12 border-black bg-white text-black rounded-full">
          Cancel
        </Button>
        <Button onClick={handleSave} className="border px-12 border-black bg-black text-white rounded-full">
          Save
        </Button>
      </div>

   
    </div>
  );
}

function BuyerTransactionForm({setCurrentStep}:any) {
  const [importantToBuyer, setImportantToBuyer] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');

  const handleSave = () => {
    // Handle saving logic here
    console.log('Saved data:', { importantToBuyer, specificQuestions });
    setCurrentStep((current:any) => current+1)
  };

  return (
    <div className="w-full p-12">
      <h3 className="text-md mb-4 font-medium" >What is most important to the buyer in this transaction?</h3>
      <textarea
        value={importantToBuyer}
        onChange={(e) => setImportantToBuyer(e.target.value)}
        className="border border-gray-300  rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      ></textarea>

      <h3 className="text-md font-medium mb-4">Does the buyer have specific questions about the property?</h3>
      <textarea
        value={specificQuestions}
        onChange={(e) => setSpecificQuestions(e.target.value)}
        className="border border-gray-300  rounded-md w-full p-2 mb-6 h-20 resize-none"
        placeholder="Description"
      ></textarea>

     <div className="flex justify-between">
        <Button onClick={() => console.log('Cancelled')} className="border px-12 border-black bg-white text-black rounded-full">
          Cancel
        </Button>
        <Button onClick={handleSave} className="border px-12 border-black bg-black text-white rounded-full">
          Save
        </Button>
      </div>
    </div>
  );
}

function BuyerApprovalForm({setCurrentStep}:any) {
  const [job, setJob] = useState('');
  const [income, setIncome] = useState('');
  const [preApproved, setPreApproved] = useState('');

  const handleSave = () => {
    // Handle saving logic here
    console.log('Saved data:', { job, income, preApproved });
    setCurrentStep((current:any) => current+1)
  };

  return (
    <div className="p-12 pt-0 w-full">
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <h3 className="text-md font-medium mb-4">Job</h3>
          <select
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="border border-gray-300 rounded-md w-full p-4"
          >
            <option value="">Enter a work area</option>
            <option value="Engineer">Engineer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div className="flex-1">
          <h3 className="text-md font-medium mb-4">Income</h3>
          <select
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="border border-gray-300 rounded-md w-full p-4"
          >
            <option value="">Select income type</option>
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      <h3 className="text-md font-medium mb-4 ">Are they pre-approved?</h3>
      <div className="flex gap-4 mb-4">
        <Button
          onClick={() => setPreApproved('Yes')}
          className={`p-6 border border-black w-full  text-black rounded-md ${preApproved === 'Yes' ? 'bg-black text-white' : 'bg-white'}`}
        >
          Yes
        </Button>
        <Button
          onClick={() => setPreApproved('No')}
          className={`p-6 border border-black w-full  text-black rounded-md ${preApproved === 'No' ? 'bg-black text-white' : 'bg-white'}`}
        >
          No
        </Button>
        <Button
          onClick={() => setPreApproved('In Process')}
          className={`p-6 border border-black w-full  text-black rounded-md ${preApproved === 'In Process' ? 'bg-black text-white' : 'bg-white'}`}
        >
          In Process
        </Button>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={() => console.log('Cancelled')} className="border px-12 border-black bg-white text-black rounded-full">
          Cancel
        </Button>
        <Button onClick={handleSave} className="border px-12 border-black bg-black text-white rounded-full">
          Save
        </Button>
      </div>
    </div>
  );
}




function FaqBuyerModal() {
  const [opened, { open, close }] = useDisclosure(true);
  const [currentForm, setCurrentForm] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setCurrentForm(0);
    }
  }, [isOpen]);

  const handleNextForm = () => {
    setCurrentForm((prev) => (prev + 1) % 3); // Cycle between forms
  };

  const handlePrevForm = () => {
    setCurrentForm((prev) => (prev - 1 + 3) % 3); // Cycle backward through forms
  };

  return (
    <CustomModal
      isOpen={opened}
      onClose={close}
      className="backdrop-blur-sm"
      disableEscapeClose={false}
      closeDisabled={false}
      backdropBlur="pointer-event-none"
    >
      <div className="flex min-w-[50rem] max-w-4xl flex-col gap-2 overflow-x-hidden md:min-w-[50rem]">
        <div className='flex justify-between w-full p-12 '>
        <div className=" flex flex-col gap-3">
          <h3 className="text-3xl font-normal">Buyer Details</h3>
          <p className="text-lg opacity-80">Share details about the buyer in 5 minutes.</p>
        </div>
        <CloseIcon size='40' onClick={close} className='cursor-pointer'/>
        </div>
      <Progress color="orange" radius="xs" size="xs" value={50}/>;

      {
            currentForm === 0 ?  <BuyerApprovalForm setCurrentStep={setCurrentForm}/> :

            currentForm === 1 ?  <BuyerDetailsForm setCurrentStep={setCurrentForm}/> :

            currentForm === 2 ? <BuyerTransactionForm setCurrentStep={setCurrentForm}/>:
            ""

      }

      
       
     
      </div>
    </CustomModal>
  );
}

export default FaqBuyerModal;
