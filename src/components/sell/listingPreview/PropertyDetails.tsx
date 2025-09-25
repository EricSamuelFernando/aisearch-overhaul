import React from 'react';

const PropertyDetails: React.FC = () => (
  <section>
    <h2 className='mb-6 text-xl font-bold text-black'>About This Home</h2>
    <p className='font-mdeium mb-10 text-base text-[#606060]'>
      An enchanting tree-lined walkway leads to the front door. Enter to find a
      bright, open entryway. The light-filled primary suite awaits on this level
      of the home, complete with beautiful open beam ceilings, updated bath,
      walk-in closet/laundry and fireplace. The open stairwell ascends to the
      spacious living room featuring gorgeous cathedral ceilings and tons of
      natural light. The formal dining room and updated kitchen open to a
      spacious wrap-around deck shaded by majestic oak trees, perfect for
      entertaining or dining al fresco. This level also features two additional
      bedrooms and a full bath.
    </p>
    <section className='flex items-center'>
      <section className='mr-6 flex items-center gap-1'>
        <p className='text-base font-bold'>4 mins </p>
        <p className='text-base'>{' on Snaphomz'}</p>
      </section>
      <section className='mr-6 flex items-center gap-1'>
        <p className='text-base font-bold'>3,200 </p>
        <p className='text-base'>views</p>
      </section>
      <section className='mr-6 flex items-center gap-1'>
        <p className='text-base font-bold'>180 </p>
        <p className='text-base'>saves</p>
      </section>
    </section>
  </section>
);

export { PropertyDetails };
