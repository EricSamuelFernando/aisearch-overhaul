'use client';

import CustomInput from '@/components/customs/input';
import { DisclsoureDocumentCard } from '@/components/dashboard/main/document-card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { Icons } from '../../icons';
import { CloudUpload, Download, EllipsisVertical, FileText, Pencil, X } from 'lucide-react';
import { useMortgageServiceAPI } from '@/hooks/api/auth/mortgageAPIs';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { error } from '@/components/alert/notify';

export const RestrictedDocument = () => {
  return (
    <div className='flex h-[inherit] w-full flex-col items-center justify-center gap-7'>
      <div className='flex w-full flex-col items-center justify-center gap-3'>
        <Image
          width={120}
          height={120}
          src='/assets/images/restricted.svg'
          objectFit='contain'
          alt='Agent'
        />
        <p className='text-grey-150'>Document access restricted</p>
      </div>
      {/* <CustomButton
        variant="filled"
        label="Request access"
        className="px-6 text-center text-white bg-black rounded-3xl"
      /> */}

      <Button roundness='full'>Request Access</Button>
    </div>
  );
};

function Disclosure(props: any) {
  const { propertyDocs, handleAwsUploadResponse, loading, handleEditDocument } = props;
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; doc: any | null }>({
    open: false,
    doc: null,
  });
  const [documentName, setDocumentName] = useState("");
  const documents = [
    { id: 1, title: 'Cover Sheet', updatedAt: 'Dec 21, 2023 02:50 PM' },
    { id: 2, title: 'Title Documents', updatedAt: 'Dec 18, 2023 11:30 AM' },
    { id: 3, title: 'Disclosure Statement Form', updatedAt: 'Dec 18, 2023 09:45 AM' },
  ];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      handleAwsUploadResponse(file);
    } else {
      error({ message: "Only PDF files are supported" })
    }
  };

  const handleDownload = (doc: any) => {
    const link = document.createElement("a");
    link.href = doc.documentUrl; // Assuming documentUrl contains the direct link to the PDF
    link.download = doc.documentName || "document.pdf"; // Sets default filename
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      {propertyDocs.length > 0 ? (
        <div className="h-full px-4">
          {/* Top Bar */}
          <div className="flex h-max items-start justify-between gap-x-8">
            {/* Search Input */}
            <CustomInput
              placeholder="Search Document"
              className="placeholder:text-base"
              labelClass="hidden p-0 m-0"
              leftSection={<Icons.Search className="h-4 w-4" />}
              containerClass="w-2/3"
            />

            {/* Summarize Button */}
            <div className="w-1/3 py-1">
              <button className="flex items-center justify-between gap-x-2 rounded-3xl bg-black px-4 py-2 text-white">
                <span>Summarize</span>
                <span className="h-5 w-5">
                  <Icons.ColoredAi className="h-5 w-5" />
                </span>
              </button>
            </div>

            {/* Upload Button */}
            <div className="w-1/3 py-1">
              <label
                htmlFor="file-upload"
                className={`flex cursor-pointer items-center justify-between gap-x-2 rounded-3xl px-4 py-2 text-white 
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black'}`}
              >
                <span>
                  <CloudUpload className="h-5 w-5" />
                </span>
                <span>Upload</span>
              </label>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                disabled={loading}
              />
            </div>

          </div>

          {/* Document List */}
          <>{loading ? <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
          </div> : <>
            {propertyDocs.map((doc: any, index: number) => (
              <aside key={doc.id} className="p-3 relative">
                <div className="flex items-center cursor-pointer justify-between rounded-lg bg-white p-4 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    {/* PDF Icon */}
                    <div
                      className="h-12 w-12 flex items-center justify-center rounded-md bg-orange-100 cursor-pointer"
                      onClick={() => handleDownload(doc)}
                    >
                      <FileText className="h-8 w-8 text-red-500" />
                    </div>

                    {/* Document Info */}
                    <div>
                      <h3 className="text-lg font-semibold">{doc.documentName}</h3>
                      <p className="text-sm text-gray-500">{`Updated ${doc.uploadedAt}`}</p>
                    </div>
                  </div>

                  {/* Menu Button */}
                  <div className="relative">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === index ? null : index);
                      }}
                    >
                      <EllipsisVertical />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === index && (
                      <div className="absolute right-0 top-10 w-36 bg-white shadow-lg rounded-md border z-50">
                        <button
                          className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                          onClick={() => {
                            setEditModal({ open: true, doc });
                            setOpenDropdown(null);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            ))}
            {editModal.open && editModal.doc && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Rename Document</h2>
                    <button onClick={() => setEditModal({ open: false, doc: null })}>
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>

                  <label className="block text-sm font-medium text-gray-700">Document Name</label>
                  <input
                    type="text"
                    defaultValue={editModal.doc.documentName}
                    className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-indigo-300"
                    onChange={(e) => {
                      setDocumentName(e.target.value);
                    }}
                  />

                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2"
                      onClick={() => setEditModal({ open: false, doc: null })}
                    >
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-md"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditDocument(editModal.doc.id, documentName)
                        setEditModal({ open: false, doc: null })
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>}</>
        </div>
      ) : (
        <>
          <div className="flex h-max items-end justify-between gap-x-8">
            {/* Upload Button */}
            <div className="w-md py-1">
              <label
                htmlFor="file-upload"
                className={`flex cursor-pointer items-center justify-center gap-x-2 rounded-full px-6 py-3 text-white 
          transition-all duration-300 shadow-md ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 active:scale-95'
                  }`}
              >
                <CloudUpload className="h-5 w-5" />
                <span className="text-sm font-medium">Upload File</span>
              </label>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="application/pdf,image/*"
                disabled={loading}
              />
            </div>
          </div>

          {/* No Documents Message */}
          <div className="flex items-center justify-center mt-6">
            <span className="text-gray-500 text-sm italic">
              No documents were found
            </span>
          </div>

          {/* <RestrictedDocument /> */}
        </>

      )}
    </>
  );
}

export default Disclosure;
