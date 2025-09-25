// 'use client';

// import { useQueryState } from 'nuqs';
// import React, { useMemo, useState } from 'react';
// import BuyerDocument from './buyer-document';
// import BuyerOffers from './buyer-offers';
// import ContractAndAgreement from './contract-and-aggrement';
// import CounterOffers from './counter-offers';
// import DisclosureDocuments from './disclosure-documents';
// import NotaryDocuments from './notary-documents';
// import PersonalDocuments from './personal-documents';
// import TitleAndEscrow from './title-and-escrow';
// import { SharedAggrementDocuments } from './shared-aggrement-documents';
// import { SharedDisclosureDocuments } from './shared-disclosure-documents';
// import { SharedProofDocuments } from './shared-proof-documents';
// import { SharedFolder } from './shared-folder';


// interface AccordionProps {
//   title: string;
//   children: React.ReactNode;
//   isOpen: boolean;
//   onClick: () => void;
// }

// interface ListItem {
//   label: React.ReactNode;
//   subTitle: React.ReactNode;
//   content: React.ReactNode;
// }

// const Accordion: React.FC<AccordionProps> = ({
//   title,
//   children,
//   isOpen,
//   onClick,
// }) => {
//   return (
//     <div>
//       <div
//         className='flex cursor-pointer items-center justify-between'
//         onClick={onClick}
//       >
//         <h2
//           className={`py-4 text-lg  font-semibold ${
//             isOpen ? 'text-orange-500' : 'text-black'
//           }`}
//         >
//           {title}
//         </h2>
//       </div>
//       {isOpen && <div className='space-y-4'>{children}</div>}
//     </div>
//   );
// };

// const ListItem: React.FC<{
//   label: React.ReactNode;
//   subTitle: React.ReactNode;
//   onClick: () => void;
// }> = ({ label, subTitle, onClick }) => {
//   return (
//     <div
//       className='cursor-pointer rounded-md bg-[#F7F2EB] p-4'
//       onClick={onClick}
//     >
//       <h2 className='py-1 font-semibold text-black'>{label}</h2>
//       <p className='font-light text-[#747474]'>{subTitle}</p>
//     </div>
//   );
// };

// const accordionData = [
//   {
//     title: 'Request',
//     items: [
//       {
//         label: 'Upload Document',
//         subTitle: 'Agent’s request to upload a document',
//         content: <BuyerDocument />,
//       },
//       {
//         label: 'Contract & Agreement',
//         subTitle: 'A request to sign a document',
//         content: <ContractAndAgreement />,
//       },
//     ],
//     key: 'request',
//   },
//   {
//     title: 'Offer',
//     items: [
//       {
//         label: 'Counter Offer',
//         subTitle: 'Seller Counter Offer',
//         content: <CounterOffers />,
//       },
//       {
//         subTitle: 'Your drafts & offers',
//         label: 'My Offers',
//         content: <BuyerOffers />,
//       },
//     ],
//     key: 'offer',
//   },
//   {
//     title: 'Title & Escrow',
//     items: [
//       {
//         label: 'Title and Escrows',
//         subTitle: 'Your title and escrow details',
//         content: <TitleAndEscrow />,
//       },
//     ],
//     key: 'title-and-escrow',
//   },
//   {
//     title: 'Documents',
//     items:[
//       {
//         label: 'All',
//         subTitle: 'Your uploaded documents',
//         items: [
    
//           // {
//           //   label: 'Documents',
//           //   subTitle: 'You and other permitted user',
//           //   content: <SharedRepo/>,
//           // },
//           {
//             label: 'Disclosure',
//             subTitle: 'disclosure shared  documents',
//             content: <SharedFolder
//                     folderName='disclosure-document'
//                     folderUrl='/disclosure-document'/>,
//           },
//           {
//             label: 'Agreements ',
//             subTitle: 'agreement shared  documents',
//             content:  <SharedFolder
//             folderName='agreement-document'
//             folderUrl='/disclosure-document'/>,
//           },
//           {
//             label: 'Proof',
//             subTitle: 'shared proof documents',
//             content:  <SharedFolder
//             folderName='proof-document'
//             folderUrl='/proof-document'/> ,
//           },
          
//         ],
//       },
//       {
//         label: 'Shared',
//         subTitle: 'Your shared documents',
//         items: [
//           {
//             label: 'Disclosure',
//             subTitle: 'disclosure shared  documents',
//             content: <SharedFolder
//                     folderName='disclosure-document'
//                     folderUrl='/disclosure-document'/>,
//           },
//           {
//             label: 'Agreements ',
//             subTitle: 'agreement shared  documents',
//             content:  <SharedFolder
//             folderName='agreement-document'
//             folderUrl='/disclosure-document'/>,
//           },
//           {
//             label: 'Proof',
//             subTitle: 'shared proof documents',
//             content:  <SharedFolder
//             folderName='proof-document'
//             folderUrl='/proof-document'/> ,
//           },
          
//         ],
//       },
//     ],
//     // items: [
//     //   {
//     //     label: 'Personal',
//     //     subTitle: 'You and other permitted user',
//     //     content: <PersonalDocuments />,
//     //   },
//     //   {
//     //     label: 'Disclosure',
//     //     subTitle: 'Seller Shared documents',
//     //     content: <DisclosureDocuments />,
//     //   },
//     //   {
//     //     label: 'Notary Sign & Close',
//     //     subTitle: '',
//     //     content: <NotaryDocuments />,
//     //   },
//     // ],
//     key: 'documents',
//   },
//   {
//     title: 'Shared',
//     items: [
    
//       // {
//       //   label: 'Documents',
//       //   subTitle: 'You and other permitted user',
//       //   content: <SharedRepo/>,
//       // },
//       {
//         label: 'Disclosure',
//         subTitle: 'disclosure shared  documents',
//         content: <SharedFolder
//                 folderName='disclosure-document'
//                 folderUrl='/disclosure-document'/>,
//       },
//       {
//         label: 'Agreements ',
//         subTitle: 'agreement shared  documents',
//         content:  <SharedFolder
//         folderName='agreement-document'
//         folderUrl='/disclosure-document'/>,
//       },
//       {
//         label: 'Proof',
//         subTitle: 'shared proof documents',
//         content:  <SharedFolder
//         folderName='proof-document'
//         folderUrl='/proof-document'/> ,
//       },
      
//     ],
//     key: 'shared',
//   }
// ];

// const ManagePropertyContent: React.FC = () => {
//   const [tabKey, setTabKey] = useQueryState('manage', {
//     defaultValue: accordionData[4].key,
//   });

//   const [activeTabContent, setActiveTabContent] = useState<React.ReactNode>(
//     accordionData[4].items[0].content,
//   );

//   const handleAccordionItemClick = (content: React.ReactNode) => {
//     setActiveTabContent(content);
//   };

//   const handleAccordionClick = (index: number) => {
//     setActiveTabContent(accordionData[index].items[0].content);
//   };

//   return (
//     <div className='grid grid-cols-3 gap-x-8'>
//       <div className='col-span-1 py-10'>
//         {accordionData.map((accordion, index) => (
//           <Accordion
//             key={index}
//             title={accordion.title}
//             isOpen={accordion.key === tabKey}
//             onClick={() => {
//               setTabKey(accordion.key);
//               handleAccordionClick(index);
//             }}
//           >
//             {accordion.items.map((item, idx) => (
//               <ListItem
//                 key={idx}
//                 label={item.label}
//                 subTitle={item.subTitle}
//                 onClick={() => handleAccordionItemClick(item.content)}
//               />
//             ))}
//           </Accordion>
//         ))}
//       </div>
//       <div className='col-span-2 px-4'>
//         <div>{activeTabContent}</div>
//       </div>
//     </div>
//   );
// };

// export default ManagePropertyContent;

// 'use client';

// import { useQueryState } from 'nuqs';
// import React, { useMemo, useState } from 'react';
// import BuyerDocument from './buyer-document';
// import BuyerOffers from './buyer-offers';
// import ContractAndAgreement from './contract-and-aggrement';
// import CounterOffers from './counter-offers';
// import DisclosureDocuments from './disclosure-documents';
// import NotaryDocuments from './notary-documents';
// import PersonalDocuments from './personal-documents';
// import TitleAndEscrow from './title-and-escrow';
// import { SharedAggrementDocuments } from './shared-aggrement-documents';
// import { SharedDisclosureDocuments } from './shared-disclosure-documents';
// import { SharedProofDocuments } from './shared-proof-documents';
// import { SharedFolder } from './shared-folder';
// import AllDocument from './all-document';
// import SharedDocument from './shared-document';


// interface AccordionProps {
//   title: string;
//   children: React.ReactNode;
//   isOpen: boolean;
//   onClick: () => void;
// }

// interface ListItem {
//   label: React.ReactNode;
//   subTitle: React.ReactNode;
//   content: React.ReactNode;
//   items?: ListItem[]; // Added items for nested items
// }

// const Accordion: React.FC<AccordionProps> = ({
//   title,
//   children,
//   isOpen,
//   onClick,
// }) => {
//   return (
//     <div>
//       <div
//         className='flex cursor-pointer items-center justify-between'
//         onClick={onClick}
//       >
//         <h2
//           className={`py-4 text-lg  font-semibold ${
//             isOpen ? 'text-orange-500' : 'text-black'
//           }`}
//         >
//           {title}
//         </h2>
//       </div>
//       {isOpen && <div className='space-y-4'>{children}</div>}
//     </div>
//   );
// };



// const accordionData = [
//   {
//     title: 'Request',
//     items: [
//       {
//         label: 'Upload Document',
//         subTitle: 'Agent’s request to upload a document',
//         content: <BuyerDocument />,
//       },
//       {
//         label: 'Contract & Agreement',
//         subTitle: 'A request to sign a document',
//         content: <ContractAndAgreement />,
//       },
//     ],
//     key: 'request',
//   },
//   {
//     title: 'Offer',
//     items: [
//       {
//         label: 'Counter Offer',
//         subTitle: 'Seller Counter Offer',
//         content: <CounterOffers />,
//       },
//       {
//         subTitle: 'Your drafts & offers',
//         label: 'My Offers',
//         content: <BuyerOffers />,
//       },
//     ],
//     key: 'offer',
//   },
//   {
//     title: 'Title & Escrow',
//     items: [
//       {
//         label: 'Title and Escrows',
//         subTitle: 'Your title and escrow details',
//         content: <TitleAndEscrow />,
//       },
//     ],
//     key: 'title-and-escrow',
//   },
//   {
//     title: 'Documents',
//     items: [
//       {
//         label: 'All',
//         subTitle: 'Your uploaded documents',
//         content:<AllDocument/>
//       },
//       {
//         label: 'Shared',
//         subTitle: 'Your shared documents',
//         content:<SharedDocument/>
      
//       },
//     ],
//     key: 'documents',
//   },
//   // {
//   //   title: 'Shared',
//   //   items: [
//   //     {
//   //       label: 'Disclosure',
//   //       subTitle: 'disclosure shared  documents',
//   //       content: <SharedFolder
//   //         folderName='disclosure-document'
//   //         folderUrl='/disclosure-document' />,
//   //     },
//   //     {
//   //       label: 'Agreements',
//   //       subTitle: 'agreement shared  documents',
//   //       content: <SharedFolder
//   //         folderName='agreement-document'
//   //         folderUrl='/disclosure-document' />,
//   //     },
//   //     {
//   //       label: 'Proof',
//   //       subTitle: 'shared proof documents',
//   //       content: <SharedFolder
//   //         folderName='proof-document'
//   //         folderUrl='/proof-document' />,
//   //     },
//   //   ],
//   //   key: 'shared',
//   // },
// ];

// const ManagePropertyContent: React.FC = () => {
//   const [tabKey, setTabKey] = useQueryState('manage', {
//     defaultValue: accordionData[0].key,
//   });

//   const [activeTabContent, setActiveTabContent] = useState<React.ReactNode>(
//     accordionData[0].items[0].content,
//   );

//   const handleAccordionItemClick = (content: React.ReactNode) => {
//     setActiveTabContent(content);
//   };

//   const handleAccordionClick = (index: number) => {
//     setActiveTabContent(accordionData[index].items[0].content);
//   };
//   const ListItemComponent: React.FC<{
//     label: React.ReactNode;
//     subTitle: React.ReactNode;
//     onClick: () => void;
//     items?: ListItem[]; // Added to handle nested items
//   }> = ({ label, subTitle, onClick, items }) => {
//     return (
//       <div
//         className='cursor-pointer rounded-md bg-[#F7F2EB] p-4'
//         onClick={onClick}
//       >
//         <h2 className='py-1 font-semibold text-black'>{label}</h2>
//         <p className='font-light text-[#747474]'>{subTitle}</p>
  
//         {/* Render nested items if available */}
//         {items && (
//           <div className='pl-4'>
//             {items.map((nestedItem, idx) => (
//               <ListItemComponent
//                 key={idx}
//                 label={nestedItem.label}
//                 subTitle={nestedItem.subTitle}
//                 onClick={() => handleAccordionClick(idx)}  // Update to your specific action
//                 items={nestedItem.items}  // Pass down nested items
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className='grid grid-cols-3 gap-x-8'>
//       <div className='col-span-1 py-10'>
//         {accordionData.map((accordion, index) => (
//           <Accordion
//             key={index}
//             title={accordion.title}
//             isOpen={accordion.key === tabKey}
//             onClick={() => {
//               setTabKey(accordion.key);
//               handleAccordionClick(index);
//             }}
//           >
//             {accordion.items.map((item:any, idx) => (
//               <ListItemComponent
//                 key={idx}
//                 label={item.label}
//                 subTitle={item.subTitle}
//                 onClick={() => handleAccordionItemClick(item?.content)}
//                 items={item.items} // Pass down nested items if they exist
//               />
//             ))}
//           </Accordion>
//         ))}
//       </div>
//       <div className='col-span-2 px-4'>
//         <div>{activeTabContent}</div>
//       </div>
//     </div>
//   );
// };

// export default ManagePropertyContent;
'use client';

import { useQueryState } from 'nuqs';
import React, { useState, useEffect } from 'react';
import BuyerDocument from './buyer-document';
import BuyerOffers from './buyer-offers';
import ContractAndAgreement from './contract-and-aggrement';
import CounterOffers from './counter-offers';
import DisclosureDocuments from './disclosure-documents';
import NotaryDocuments from './notary-documents';
import PersonalDocuments from './personal-documents';
import TitleAndEscrow from './title-and-escrow';
import { SharedAggrementDocuments } from './shared-aggrement-documents';
import { SharedDisclosureDocuments } from './shared-disclosure-documents';
import { SharedProofDocuments } from './shared-proof-documents';
import { SharedFolder } from './shared-folder';
import AllDocument from './all-document';
import SharedDocument from './shared-document';
import CustomProgressBar from './CustomProgressBar';  // Adjust the path as needed

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

interface ListItem {
  label: React.ReactNode;
  subTitle: React.ReactNode;
  content: React.ReactNode;
  items?: ListItem[]; // Added items for nested items
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  isOpen,
  onClick,
}) => {
  return (
    <div>
      <div
        className='flex cursor-pointer items-center justify-between'
        onClick={onClick}
      >
        <h2
          className={`py-4 text-lg  font-semibold ${
            isOpen ? 'text-orange-500' : 'text-black'
          }`}
        >
          {title}
        </h2>
      </div>
      {isOpen && <div className='space-y-4'>{children}</div>}
    </div>
  );
};

const accordionData = [
  {
    title: 'Request',
    items: [
      {
        label: 'Upload Document',
        subTitle: 'Agent’s request to upload a document',
        content: <BuyerDocument />,
      },
      {
        label: 'Contract & Agreement',
        subTitle: 'A request to sign a document',
        content: <ContractAndAgreement />,
      },
    ],
    key: 'request',
  },
  {
    title: 'Offer',
    items: [
      {
        label: 'Counter Offer',
        subTitle: 'Seller Counter Offer',
        content: <CounterOffers />,
      },
      {
        subTitle: 'Your drafts & offers',
        label: 'My Offers',
        content: <BuyerOffers />,
      },
    ],
    key: 'offer',
  },
  {
    title: 'Title & Escrow',
    items: [
      {
        label: 'Title and Escrows',
        subTitle: 'Your title and escrow details',
        content: <TitleAndEscrow />,
      },
    ],
    key: 'title-and-escrow',
  },
  {
    title: 'Documents',
    items: [
      {
        label: 'All',
        subTitle: 'Your uploaded documents',
        content: <AllDocument />,
      },
      {
        label: 'Shared',
        subTitle: 'Your shared documents',
        content: <SharedDocument />,
      },
    ],
    key: 'documents',
  },
];

const ManagePropertyContent: React.FC = () => {
  const [tabKey, setTabKey] = useQueryState('manage', {
    defaultValue: accordionData[0].key,
  });

  const [activeTabContent, setActiveTabContent] = useState<React.ReactNode>(
    accordionData[0].items[0].content,
  );

  // State to track the progress of each section
  const [progress, setProgress] = useState<{ [key: string]: number }>({
    request: 10,
    offer: 10,
    'title-and-escrow': 10,
    documents: 10,
  });

  // State to manage loading state for documents
  const [loading, setLoading] = useState({
    allDocuments: true,
    sharedDocuments: true,
  });

  // Simulate loading and then update progress
  useEffect(() => {
    // Simulate document loading
    const loadDocuments = async () => {
      // Simulate delay
      setTimeout(() => {
        setProgress((prev) => ({
          ...prev,
          documents: 50, // Update to 50% after documents load
        }));
        setLoading({
          allDocuments: false, // Set allDocuments as loaded
          sharedDocuments: false, // Set sharedDocuments as loaded
        });
      }, 2000); // 2 seconds delay for loading
    };

    loadDocuments();
  }, []);

  const handleAccordionItemClick = (content: React.ReactNode) => {
    setActiveTabContent(content);
  };

  const handleAccordionClick = (index: number) => {
    setActiveTabContent(accordionData[index].items[0].content);
  };

  const ListItemComponent: React.FC<{
    label: React.ReactNode;
    subTitle: React.ReactNode;
    onClick: () => void;
    sectionKey: string; // Pass the section key to handle progress updates
  }> = ({ label, subTitle, onClick, sectionKey }) => {
    return (
      <div
        className='cursor-pointer rounded-md bg-[#F7F2EB] p-4'
        onClick={onClick}
      >
        <h2 className='py-1 font-semibold text-black'>{label}</h2>
        <p className='font-light text-[#747474]'>{subTitle}</p>

        {/* Render Progress or Loading State */}
        {loading.allDocuments ? (
          <CustomProgressBar progress={progress[sectionKey]} size={100} />
        ) : (
          <span>Documents Loaded</span> // Replace with actual document content
        )}
      </div>
    );
  };

  return (
    <div className='grid grid-cols-3 gap-x-8'>
      <div className='col-span-1 py-10'>
        {accordionData.map((accordion, index) => (
          <Accordion
            key={index}
            title={accordion.title}
            isOpen={accordion.key === tabKey}
            onClick={() => {
              setTabKey(accordion.key);
              handleAccordionClick(index);
            }}
          >
            {accordion.items.map((item, idx) => (
              <ListItemComponent
                key={idx}
                label={item.label}
                subTitle={item.subTitle}
                onClick={() => handleAccordionItemClick(item?.content)}
                sectionKey={accordion.key} // Pass the section key to handle progress updates
              />
            ))}
          </Accordion>
        ))}
      </div>
      <div className='col-span-2 px-4'>
        <div>{activeTabContent}</div>
      </div>
    </div>
  );
};

export default ManagePropertyContent;
