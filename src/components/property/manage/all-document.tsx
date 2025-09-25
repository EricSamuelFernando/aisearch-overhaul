import { useState } from "react";
import { SharedFolder } from "./shared-folder";
import Image from "next/image";
import { FolderIcon } from "@public/assets/icons";




type Iprops = {
  propertyId?: string;
  handleEditDocument?: (docId: string, docName: string) => void;
}

function AllDocument({ propertyId, handleEditDocument }: Iprops) {
  const [activeTab, setActiveTab] = useState<number>(0);

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
        pId={propertyId}
        handleEditDocument={handleEditDocument}
      />,
    },
    {
      label: 'Agreements',
      subTitle: 'agreement shared documents',
      content: <SharedFolder
        folderName='agreement-document'
        folderUrl='/agreement-document'
        pId={propertyId}
        handleEditDocument={handleEditDocument}
      />,
    },
    {
      label: 'Other Docs',
      subTitle: 'shared proof documents',
      content: <SharedFolder
        folderName='proof-document'
        folderUrl='/proof-document'
        handleEditDocument={handleEditDocument }
        pId={propertyId} />,
    },
  ];

  console.log("Respoooooooooooo",repos);
  

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
            <p className="text-xs">{repo.label}</p>
          </button>
        ))}
      </div>

      <div className=''>
        <div>{repos[activeTab]?.content}</div> {/* Dynamically render the content */}
      </div>
    </div>
  );
}

export default AllDocument;
