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
    <div className="">
      <div className='button-group gap-2 flex'>
      {repos.map((repo, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            className={`flex  items-center gap-2 p-6  w-60 rounded-lg hover:bg-grey-190  ${activeTab === index ? 'bg-orange-200 text-orange-500' : 'bg-[#F7F2EB]'}`}
          >
            <Image
              alt={'folder'}
              src={FolderIcon}
              width={28}
              height={28}
              className='object-contain object-center'
            />
           <p className="text-xs ">{repo.label}</p> 
          </button>
        ))}
      </div>

      <div className=''>
        <div>{repos[activeTab]?.content}</div> {/* Dynamically render the content */}
      </div>
    </div>
  );
}

export default SharedDocument;
