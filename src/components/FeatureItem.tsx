import React from 'react';

type IFeaturesProps = {
  title: string;
  items: string[];
};

const FeatureItem = ({ title, items }: IFeaturesProps) => {
  return (
    <section className='mb-5'>
      <h4 className='mb-4 text-base font-medium'>{title}</h4>
      {items.map((item, index) => (
        <section className='mb-2 flex items-center' key={index}>
          <div className='mr-4 h-2 w-2 rounded-full bg-[#FFB895]' />
          <p className='font-mdeium text-sm text-grey-750'>{item}</p>
        </section>
      ))}
    </section>
  );
};

export { FeatureItem };
