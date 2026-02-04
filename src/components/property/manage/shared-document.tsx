"use client"
import { useState } from "react";
import { SharedFolder } from "./shared-folder";
import Image from "next/image";
import { FolderIcon } from "@public/assets/icons";



function SharedDocument({propertyId} :any) {
  const [activeTab, setActiveTab] = useState<number>(0); // Store the index of active tab
  
  const handleButtonClick = (index: number) => {
    setActiveTab(index);
  };
  const repos = [
    {
      label: 'Disclosure',
      subTitle: 'disclosure shared documents',
      content: <SharedFolder 
      folderName='disclosure-document' 
      folderUrl='/disclosure-document'
      shared={true}
      pId={propertyId}
       />,
    },
    {
      label: 'Agreements',
      subTitle: 'agreement shared documents',
      content: <SharedFolder 
      folderName='agreement-document' 
      folderUrl='/agreement-document' 
      shared={true}
      pId={propertyId}
      />,
    },
    {
      label: 'Other Docs',
      subTitle: 'shared proof documents',
      content: <SharedFolder 
      folderName='proof-document' 
      folderUrl='/proof-document' 
      shared={true}
      pId={propertyId}
      />,
    },
  ];
  return (
    <div className="w-full">
      <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6'>
        {repos.map((repo, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            className={`flex items-center justify-center sm:justify-start gap-2 p-3 sm:p-4 lg:p-6 w-full sm:w-auto sm:min-w-[120px] lg:w-60 rounded-lg hover:bg-grey-190 transition-colors text-center sm:text-left ${activeTab === index ? 'bg-orange-200 text-orange-500' : 'bg-[#F7F2EB]'}`}
          >
            <Image
              alt={'folder'}
              src={FolderIcon}
              width={20}
              height={20}
              className='object-contain object-center sm:w-6 sm:h-6 lg:w-7 lg:h-7'
            />
            <p className="text-xs sm:text-sm font-medium">{repo.label}</p>
          </button>
        ))}
      </div>

      <div className='w-full'>
        <div className="w-full overflow-hidden">{repos[activeTab]?.content}</div>
      </div>
    </div>
  );
}

export default SharedDocument;
