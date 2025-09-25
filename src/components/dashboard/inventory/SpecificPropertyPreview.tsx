
// 'use client';
// import React from 'react';
// import { useRouter } from 'next/router';
// import { Title, Text, Button, Card, SimpleGrid, Image } from '@mantine/core';

// interface Property {
//   _id: string;
//   address: string;
//   city: string;
//   state: string;
//   zip_code: string;
//   phone: string;
//   property_photos: string[];
//   appliance_inventory?: any[];
//   mortgage_information?: any;
//   home_insurance_info?: any;
//   non_permitted_improvements?: any;
//   optional_utility_providers?: any;
// }
// // Now purely presentational. We get `property` from the parent.
// type Props = { property: Property }

// export default function SpecificPropertyPreview({ property }: Props) {
//   const router = useRouter()

//   return (
//     <div>
//       <Button variant="subtle" onClick={() => router.back()}>
//         ← Back
//       </Button>
//       <Title order={2} className="mt-4 mb-2">
//         Property Details
//       </Title>

//       <SimpleGrid cols={1} spacing="md" mb="xl">
//         {property.property_photos?.map((src, idx) => (
//           <Image key={idx} src={src} height={200} radius="md" />
//         ))}
//       </SimpleGrid>

//       <Card shadow="sm" padding="lg">
//         <Text>
//           <strong>Address:</strong> {property.address}, {property.city}, {property.state} {property.zip_code}
//         </Text>
//         <Text>
//           <strong>Contact:</strong> {property.phone}
//         </Text>

//         {property.mortgage_information && (
//           <div className="mt-4">
//             <Title order={4}>Mortgage</Title>
//             <Text>Loan Amount: {property.mortgage_information.original_loan_amount}</Text>
//             <Text>Monthly Payment: {property.mortgage_information.monthly_payment}</Text>
//             <Text>Interest Rate: {property.mortgage_information.interest_rate}%</Text>
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }

import React from 'react'

const SpecificPropertyPreview = () => {
  return (
    <div>SpecificPropertyPreview</div>
  )
}

export default SpecificPropertyPreview