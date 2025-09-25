'use client';

import { useState } from 'react';
import {
  FileText,
  EllipsisVertical,
  Pencil,
  Download,
  X,
  Eye,
  Delete,
  Trash,
  Share
} from 'lucide-react';
// Update path to your actual API util
import { downloadDocumentPreSigned } from '@/lib/utils';
import PDFViewerModal from '@/components/dashboard/main/pdf-viewer';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthToken } from '@/lib/storage';
import { useRepoManagementApi, useViewUploadedFileUrl } from '@/hooks/api/document/useRepoManagement';
import { useRouter } from 'next/navigation';
import { error, success } from '@/components/alert/notify';

interface Props {
  doc: any;
  key:string;
  index: number;
  onDownload: (doc: any) => void;
  onEditHandler?: (id: string, name: string) => void;
  onDelete: (id: string,) => void
}

export const GeneralDocumentCard = ({ doc, index, onDownload, onEditHandler, onDelete,key }: Props) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const { data: downloadUrl, isLoading } = useViewUploadedFileUrl(doc?.fileUrl);
  const [editModal, setEditModal] = useState<{ open: boolean; doc: any | null }>({
    open: false,
    doc: null,
  });
  const router = useRouter()
  const queryClient = useQueryClient();
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';

  const fetchPresignedUrl = async (fileName: string): Promise<string | null> => {
    try {
      const result = await queryClient.fetchQuery({
        queryKey: ['viewUploadedFile', fileName],
        queryFn: async () => {
          const response = await axios.post(
            GRAPHQL_URI,
            {
              query: `query ViewUplaodedFile($fileName: String!) {
              viewUplaodedFile(fileName: $fileName)
            }`,
              variables: { fileName },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAuthToken()}`,

              }
            }
          );

          if (response.status !== 200 || response.data.errors) {
            throw new Error(response.data?.errors?.[0]?.message || 'Failed to fetch file URL');
          }

          return response.data.data.viewUplaodedFile;
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to get presigned URL', error);
      return null;
    }
  };


  const [documentName, setDocumentName] = useState(doc?.fileName || '');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const { useGrantAccess: { mutate, data, status } } = useRepoManagementApi()
  
  const handleGrantAcess = async () => {
    try {
      const payload = {
        repoId: doc?.id,
        accessType: 'OWNER'
      }
      mutate(payload)
    }
     catch (error) {
    }
  }

  const handleDownload = async () => {
    const url = await fetchPresignedUrl(doc?.fileUrl);
    if (url) {
      downloadDocumentPreSigned(url, doc?.fileName);
    } else {
      alert('Download link generation failed.');
    }
  };

  const handleView = async () => {
    const url = await fetchPresignedUrl(doc?.fileUrl);
    if (url) {
      setViewerUrl(url);
      setIsViewerOpen(true);
    } else {
      alert('Unable to open document viewer.');
    }
  };

  return (
    <>
      <aside key={doc.id} className="p-3 w-full relative">
        <div className="flex items-center justify-between rounded-lg bg-white p-4 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 flex items-center justify-center rounded-md bg-orange-100 cursor-pointer"
              onClick={() => onDownload(doc)}
            >
              <FileText className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{doc.fileName}</h3>
              <p className="text-sm text-gray-500">{`Updated ${doc.uploadedAt}`}</p>
            </div>
          </div>

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
                  Rename
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                  onClick={() => {
                    handleGrantAcess()
                  }}
                >
                  <Share className="h-4 w-4" />
                  Share
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                  onClick={() => {
                    if (downloadUrl) {
                      navigator.clipboard.writeText(downloadUrl);
                      success({ message: 'Link copied to clipboard!' });
                    }
                    else {
                      error({ message: 'File link not available yet.' });
                    }
                  }}
                >
                  <Share className="h-4 w-4" />
                  Copy External Link
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                  onClick={() => {
                    handleDownload();
                    setOpenDropdown(null);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                  onClick={() => {
                    handleView();
                    setOpenDropdown(null);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 w-full text-sm hover:bg-gray-100"
                  onClick={() => {
                    onDelete(doc?.id);
                    setOpenDropdown(null);
                  }}
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Edit Modal */}
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
              onChange={(e) => setDocumentName(e.target.value)}
            />

            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2"
                onClick={() => setEditModal({ open: false, doc: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-md"
                onClick={() => {
                  console.log("DAta : ",key,editModal,",",doc);
                  
                  onEditHandler?.(editModal.doc.id, documentName);
                  setEditModal({ open: false, doc: null });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


      {/* PDF Viewer Modal */}
      {isViewerOpen && viewerUrl && (
        <PDFViewerModal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setViewerUrl('');
          }}
          type={'preSignedViewUrl'}
          documentUrl={viewerUrl}
        />
      )}
    </>
  );
};
