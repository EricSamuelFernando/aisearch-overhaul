import RiskItem from './RiskItem';
import React from 'react';

interface RisksListProps {
  risks: {
    title: string;
    description: string;
  }[];
}

const RisksList: React.FC<RisksListProps> = ({ risks }) => (
  <section className='mb-8 mr-12 h-fit w-2/5 rounded-3xl bg-white px-8 py-12'>
    <h3 className='mb-8 text-base font-medium'>Potential Risks Involved</h3>
    {risks.map((risk, index) => (
      <RiskItem key={index} risk={risk} />
    ))}
  </section>
);

export default RisksList;
