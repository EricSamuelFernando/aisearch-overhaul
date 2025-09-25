'use client';

import { useState } from 'react';
import ActionButtons from '../sell/guidedTransaction/ActionButtons';
import RisksList from '../sell/guidedTransaction/RisksList';
import StepDetails from '../sell/guidedTransaction/StepDetails';
import StepItem from '../sell/guidedTransaction/StepItem';

interface Step {
  title: string;
  description: string;
  icon: string;
  alt: string;
  summary: string;
}

interface Risk {
  title: string;
  description: string;
}

function Guidedtransactions() {
  const [isActiveTab, setIsActiveTab] = useState(0);
  const steps: Step[] = [
    {
      title: 'Schedule a Tour',
      description: 'Assisted or self composed',
      icon: '/assets/icons/scheduleTour.svg',
      alt: 'Snap Homz home',
      summary:
        'Ready to show off your home to potential buyers? Scheduling a home tour is simple and efficient with our platform’s integrated calendar feature.',
    },
    {
      title: 'Accept an Offer',
      description: 'Template message',
      icon: '/assets/icons/acceptOffer.svg',
      alt: 'Accept offer',
      summary:
        'Ready to show off your home to potential buyers? Scheduling a home tour is simple and efficient with our platform’s integrated calendar feature.',
    },
    {
      title: 'Title & Escrow',
      description: 'Platform recommended',
      icon: '/assets/icons/escrow.svg',
      alt: 'Title & Escrow',
      summary:
        'Ready to show off your home to potential buyers? Scheduling a home tour is simple and efficient with our platform’s integrated calendar feature.',
    },
    {
      title: 'Contingencies',
      description: 'Assisted or self review',
      icon: '/assets/icons/contingencies.svg',
      alt: 'Contingencies',
      summary:
        'Ready to show off your home to potential buyers? Scheduling a home tour is simple and efficient with our platform’s integrated calendar feature.',
    },
    {
      title: 'Sign & Close',
      description: 'Online digital signature',
      icon: '/assets/icons/sign.svg',
      alt: 'Sign & Close',
      summary:
        'Ready to show off your home to potential buyers? Scheduling a home tour is simple and efficient with our platform’s integrated calendar feature.',
    },
  ];

  const risks: Risk[] = [
    {
      title: 'Lack of Legal Protection',
      description:
        'Resolving disputes over property condition, ownership, or contractual obligations without professional mediation or legal support can be challenging and costly for both buyers and sellers.',
    },
    {
      title: 'Limited Recourse for Disputes',
      description:
        'Resolving disputes over property condition, ownership, or contractual obligations without professional mediation or legal support can be challenging and costly for both buyers and sellers.',
    },
    {
      title: 'Document Oversight',
      description:
        'Resolving disputes over property condition, ownership, or contractual obligations without professional mediation or legal support can be challenging and costly for both buyers and sellers.',
    },
  ];

  return (
    <main>
      <section className='bg-grey-190 pt-20'>
        <section className='grid grid-cols-4 gap-8'>
          <ol className='w-full space-y-8 overflow-hidden'>
            {steps.map((step, index, items) => (
              <StepItem
                isLastItem={index + 1 !== items.length}
                key={index}
                step={step}
                index={index}
                isActive={isActiveTab === index}
                onClick={() => setIsActiveTab(index)}
              />
            ))}
          </ol>
          <section className='col-span-3 flex justify-between border-l border-solid border-[#DBE2EE] pl-10'>
            <StepDetails
              step={steps[isActiveTab]}
              totalSteps={steps.length}
              currentStep={isActiveTab}
            />
            <RisksList risks={risks} />
          </section>
        </section>
        <ActionButtons />
      </section>
    </main>
  );
}

export default Guidedtransactions;
