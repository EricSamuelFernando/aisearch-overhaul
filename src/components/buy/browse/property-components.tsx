'use client';

import NewMLSPropertyCard from './new-mls-card';
import { LandingPropertyListingShuffledSet } from '@/interfaces/property.interface';
import PropertyCards from './property-card';

const PropertyComponents = (props: any) => {
  console.log(props);
  return props.type === 'mls' ? (
    <NewMLSPropertyCard {...props.data} />
  ) : (
    <PropertyCards {...props} />
  );
};

export default PropertyComponents;
