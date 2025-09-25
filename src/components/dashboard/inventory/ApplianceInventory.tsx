// import { Title, TextInput, Select } from '@mantine/core';
// import React from 'react';
// import ReactDatePicker from 'react-datepicker';
// import { FileInput } from '@components/ui/FileInput';

// type Props = {
//   formData: any;
//   onChange: (
//     section: string,
//     field: string,
//     index: number
//   ) => (e: React.ChangeEvent<HTMLInputElement> | string | boolean) => void;
//   onFileChange: (
//     section: string,
//     field: string,
//     index: number
//   ) => (file: File | null) => void;
// };

// export default function ApplianceInventory({
//   formData,
//   onChange,
//   onFileChange,
// }: Props) {
//   const index = 0;
//   const item = formData.applianceInventory[index];

//   return (
//     <>
//       <Title className="mb-4">Appliance Inventory</Title>

//       <TextInput
//         label="Type of appliance"
//         placeholder="Dishwasher, Air Conditioner..."
//         value={item.type}
//         onChange={onChange('applianceInventory', 'type', index)}
//         classNames={{
//           input: 'bg-slate-100 p-4 focus:ring-0',
//         }}
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//         <TextInput
//           label="Brand name"
//           value={item.brandName}
//           onChange={onChange('applianceInventory', 'brandName', index)}
//           classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//         />
//         <TextInput
//           label="Model number"
//           value={item.modelNumber}
//           onChange={onChange('applianceInventory', 'modelNumber', index)}
//           classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//         <Select
//           label="Under warranty?"
//           data={['Yes', 'No']}
//           value={item.warranty ? 'Yes' : 'No'}
//           onChange={(v) =>
//             onChange('applianceInventory', 'warranty', index)(v === 'Yes')
//           }
//           classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//         />
//         <Select
//           label="Condition"
//           data={['New', 'Good', 'Fair', 'Poor']}
//           value={item.condition}
//           // @ts-ignore
//           onChange={onChange('applianceInventory', 'condition', index)}
//           classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//         <TextInput
//           label="Serial number"
//           value={item.serialNumber}
//           onChange={onChange('applianceInventory', 'serialNumber', index)}
//           classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//         />
//         <ReactDatePicker
//           selected={
//             item.purchaseDate ? new Date(item.purchaseDate) : null
//           }
//           onChange={(d) =>
//             onChange('applianceInventory', 'purchaseDate', index)(
//               (d as Date).toISOString().split('T')[0]
//             )
//           }
//           placeholderText="YYYY-MM-DD"
//           className="bg-slate-100 p-4 w-full"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//         <ReactDatePicker
//           selected={
//             item.warrantyExpirationDate
//               ? new Date(item.warrantyExpirationDate)
//               : null
//           }
//           onChange={(d) =>
//             onChange('applianceInventory', 'warrantyExpirationDate', index)(
//               (d as Date).toISOString().split('T')[0]
//             )
//           }
//           placeholderText="YYYY-MM-DD"
//           className="bg-slate-100 p-4 w-full"
//         />
//         <FileInput
//           label="Upload receipt (optional)"
//           // @ts-ignore
//           onChange={(file) =>
//             onFileChange('applianceInventory', 'receiptBase64', index)(
//               file
//             )
//           }
//         />
        
//       </div>
//     </>
//   );
// }


// import { Title, TextInput, Select, Button } from '@mantine/core';
// import React, { useState } from 'react';
// import ReactDatePicker from 'react-datepicker';
// import { FileInput } from '@components/ui/FileInput';

// type Props = {
//   formData: any;
//   onChange: (
//     section: string,
//     field: string,
//     index: number
//   ) => (e: React.ChangeEvent<HTMLInputElement> | string | boolean) => void;
//   onFileChange: (
//     section: string,
//     field: string,
//     index: number
//   ) => (file: File | null) => void;
// };

// export default function ApplianceInventory({
//   formData,
//   onChange,
//   onFileChange,
// }: Props) {
//   const [applianceIndex, setApplianceIndex] = useState(1); // Start with one appliance
//   const appliances = formData.applianceInventory;

//   // Function to handle adding new appliance
// const addMoreAppliance = () => {
//   const newAppliance = {
//     type: '',
//     brandName: '',
//     modelNumber: '',
//     warranty: false,
//     condition: 'Good',
//     serialNumber: '',
//     purchaseDate: '',
//     warrantyExpirationDate: '',
//   };

//   // Notify parent via onChange with full updated list
//   onChange('applianceInventory', '', 0)(
//     [...appliances, newAppliance] as any
//   );
// };
//   return (
//     <>
//       <Title className="mb-4">Appliance Inventory</Title>

//       {/* Display the appliances dynamically */}
// {appliances.map((item, index) => (
//         <div key={index}>
//           <TextInput
//             label="Type of appliance"
//             placeholder="Dishwasher, Air Conditioner..."
//             value={item.type}
//             onChange={onChange('applianceInventory', 'type', index)}
//             classNames={{
//               input: 'bg-slate-100 p-4 focus:ring-0',
//             }}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//             <TextInput
//               label="Brand name"
//               value={item.brandName}
//               onChange={onChange('applianceInventory', 'brandName', index)}
//               classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//             />
//             <TextInput
//               label="Model number"
//               value={item.modelNumber}
//               onChange={onChange('applianceInventory', 'modelNumber', index)}
//               classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//             <Select
//               label="Under warranty?"
//               data={['Yes', 'No']}
//               value={item.warranty ? 'Yes' : 'No'}
//               onChange={(v) =>
//                 onChange('applianceInventory', 'warranty', index)(v === 'Yes')
//               }
//               classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//             />
//             <Select
//               label="Condition"
//               data={['New', 'Good', 'Fair', 'Poor']}
//               value={item.condition}
//               onChange={onChange('applianceInventory', 'condition', index)}
//               classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//             <TextInput
//               label="Serial number"
//               value={item.serialNumber}
//               onChange={onChange('applianceInventory', 'serialNumber', index)}
//               classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
//             />
//             <ReactDatePicker
//               selected={item.purchaseDate ? new Date(item.purchaseDate) : null}
//               onChange={(d) =>
//                 onChange('applianceInventory', 'purchaseDate', index)(
//                   (d as Date).toISOString().split('T')[0]
//                 )
//               }
//               placeholderText="YYYY-MM-DD"
//               className="bg-slate-100 p-4 w-full"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//             <ReactDatePicker
//               selected={
//                 item.warrantyExpirationDate
//                   ? new Date(item.warrantyExpirationDate)
//                   : null
//               }
//               onChange={(d) =>
//                 onChange('applianceInventory', 'warrantyExpirationDate', index)(
//                   (d as Date).toISOString().split('T')[0]
//                 )
//               }
//               placeholderText="YYYY-MM-DD"
//               className="bg-slate-100 p-4 w-full"
//             />
//             <FileInput
//               label="Upload receipt (optional)"
//               onChange={(file) =>
//                 onFileChange('applianceInventory', 'receiptBase64', index)(file)
//               }
//             />
//           </div>
//         </div>
//       ))}

//       {/* Add More Button */}
//       <Button variant="outline" onClick={addMoreAppliance} className="mt-4">
//         Add More
//       </Button>
//     </>
//   );
// }


import { Title, TextInput, Select } from '@mantine/core';
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { FileInput } from '@components/ui/FileInput';

type Props = {
  formData: any;
  onChange: (
    section: string,
    field: string,
    index: number
  ) => (e: React.ChangeEvent<HTMLInputElement> | string | boolean) => void;
  onFileChange: (
    section: string,
    field: string,
    index: number
  ) => (file: File | null) => void;
  index: number;
};


export default function ApplianceInventory({
  formData,
  onChange,
  onFileChange,
  index,
}: Props) {
  const item = formData.applianceInventory[index];
const isExpanded = item.isExpanded;


  return (
    <>
{!isExpanded ? (
  <TextInput
    label="Add other data, if you have required"
    placeholder="Type of appliance"
    value={item.type}
    onChange={onChange('applianceInventory', 'type', index)}
    classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
  />
) : (
    <>
     <TextInput
        label="Type of appliance"
        placeholder="Dishwasher, Air Conditioner..."
        value={item.type}
        onChange={onChange('applianceInventory', 'type', index)}
        classNames={{
          input: 'bg-slate-100 p-4 focus:ring-0',
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="Brand name"
          value={item.brandName}
          onChange={onChange('applianceInventory', 'brandName', index)}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Model number"
          value={item.modelNumber}
          onChange={onChange('applianceInventory', 'modelNumber', index)}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select
          label="Under warranty?"
          data={['Yes', 'No']}
          value={item.warranty ? 'Yes' : 'No'}
          onChange={(v) =>
            onChange('applianceInventory', 'warranty', index)(v === 'Yes')
          }
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <Select
          label="Condition"
          data={['New', 'Good', 'Fair', 'Poor']}
          value={item.condition}
          // @ts-ignore
          onChange={onChange('applianceInventory', 'condition', index)}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="Serial number"
          value={item.serialNumber}
          onChange={onChange('applianceInventory', 'serialNumber', index)}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <ReactDatePicker
          selected={
            item.purchaseDate ? new Date(item.purchaseDate) : null
          }
          onChange={(d) =>
            onChange('applianceInventory', 'purchaseDate', index)(
              (d as Date).toISOString().split('T')[0]
            )
          }
          placeholderText="YYYY-MM-DD"
          className="bg-slate-100 p-4 w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ReactDatePicker
          selected={
            item.warrantyExpirationDate
              ? new Date(item.warrantyExpirationDate)
              : null
          }
          onChange={(d) =>
            onChange('applianceInventory', 'warrantyExpirationDate', index)(
              (d as Date).toISOString().split('T')[0]
            )
          }
          placeholderText="YYYY-MM-DD"
          className="bg-slate-100 p-4 w-full"
        />
        <FileInput
          label="Upload receipt (optional)"
          // @ts-ignore
          onChange={(file) =>
            onFileChange('applianceInventory', 'receiptBase64', index)(
              file
            )
          }
        />
        
      </div>
    </>
  )}
    </>
  );
}