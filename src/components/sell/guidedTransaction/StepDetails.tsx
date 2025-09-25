import React from 'react';

interface StepDetailsProps {
  step: {
    title: string;
    summary: string;
  };
  totalSteps: number;
  currentStep: number;
}

const StepDetails: React.FC<StepDetailsProps> = ({
  step,
  totalSteps,
  currentStep,
}) => (
  <section>
    <p className='mb-4 text-sm'>{`Step ${currentStep + 1}/${totalSteps}`}</p>
    <h3 className='mb-4 text-base font-bold'>{step.title}</h3>
    <p className='w-2/5 text-sm'>{step.summary}</p>
  </section>
);

export default StepDetails;
