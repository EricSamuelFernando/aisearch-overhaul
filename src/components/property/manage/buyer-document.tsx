"use client"
import { error } from '@/components/alert/notify';
import { OfferDocumentCard } from '@/components/dashboard/user/offer-document-card';
import { EngagedPropertyDocumentsInterface } from '@/components/dashboard/user/property-detail-layout';
import { VerticalDropzone } from '@/components/file-dropzone';
import { HeadingLevelTwo } from '@/components/heading';
import ManageDocument from '@/components/property/manage-document';
import { useMortgageServiceAPI } from '@/hooks/api/auth/mortgageAPIs';
import { userData } from '@/slices/auth/auth.slice';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

type Props = {
  propertyDocuments: any;
};

function BuyerDocument() {
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty);
  const [propertyDocuments, setPropertyDocuments] = useState<EngagedPropertyDocumentsInterface[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { getEngagedPropertyDocs,uploadNewFile } = useMortgageServiceAPI();
  const currentUser = useSelector(userData);
  const getPropertyDocuments = () => {
    setPropertyDocuments([] as EngagedPropertyDocumentsInterface[]);
    getEngagedPropertyDocs.mutate(engagedProperty?.propertyId, {
      onSuccess: (response) => {
        console.log(response?.data);
        if (response?.data?.data?.getUploadedDocumentsByPropertyId?.length) {
          setPropertyDocuments(response.data?.data?.getUploadedDocumentsByPropertyId);
        }
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
      }
    });
  };

  const handleFileChange = async (file:any) => {
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      console.log('Selected file:', file);
      const response = await uploadNewFile(file, currentUser.id, engagedProperty?.propertyId)
      getPropertyDocuments()
    } else {
      error({ message: "Only PDF files are supported" })
    }
  };
  
  useEffect(() => {
    getPropertyDocuments();
  }, []);

  return (
    <section className="py-4">
      <ManageDocument />
      <div className="my-10">
        <HeadingLevelTwo>Buyer Documents</HeadingLevelTwo>

        {/* Document Section */}
        <section className="my-8 flex flex-col md:flex-row gap-4 overflow-x-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-400">
          {/* Dropzone */}

          {/* Document Cards (Responsive: 2 per row) */}
          <section className='my-8 grid grid-cols-2 gap-8'>
          <VerticalDropzone
            setFiles={(files: File[]) => {
              console.log(files);
              handleFileChange(files[0])
            }}
          />
            {propertyDocuments?.length > 0 ? (
              propertyDocuments.map((doc, index) => (
                <>
                  <OfferDocumentCard key={index} document={doc} />
                </>
              ))
            ) : (
              <p className="text-gray-500">No documents found.</p>
            )}
          </section>
        </section>
      </div>
    </section>
  );
}

export default BuyerDocument;
