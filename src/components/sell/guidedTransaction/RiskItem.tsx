import React from 'react';

interface RiskItemProps {
  risk: {
    title: string;
    description: string;
  };
}

const RiskItem: React.FC<RiskItemProps> = ({ risk }) => (
  <details className='mb-6'>
    <summary className='content block border-b border-solid border-[#D7D7D7] pb-4 text-base font-medium after:inline-block'>
      {risk.title}
    </summary>
    <p className='text-sm transition ease-in-out'>{risk.description}</p>
  </details>
);

export default RiskItem;
