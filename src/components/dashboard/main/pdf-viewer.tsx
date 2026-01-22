import React from 'react';
import Modal from './modal';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  type?: string;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  type
}) => {
  const getViewerUrl = () => {
    try {
      const url = new URL(documentUrl);
      const pathname = url.pathname;
      const extension = pathname.split('.').pop()?.toLowerCase() || "";

      // Direct view for AWS S3 pre-signed PDFs
      if (type === 'preSignedViewUrl' && extension === 'pdf') {
        return documentUrl;
      }

      // Google Viewer for PDF
      if (extension === 'pdf') {
        return `https://docs.google.com/gview?url=${encodeURIComponent(documentUrl)}&embedded=true`;
      }

      // Plain text files
      if (extension === 'txt') {
        return documentUrl;
      }

      if (extension === 'png' || extension === 'jpeg') {
        return documentUrl;
      }

      // Office formats (Word, Excel, PowerPoint)
      if (
        ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)
      ) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`;
      }

      return null;
    } catch (err) {
      console.error('Invalid document URL', err);
      return null;
    }
  };

  const viewerUrl = getViewerUrl();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Document Viewer'
      className='w-3/4'
    >
      <div className='pdf-viewer-container h-[80vh] w-full'>
        {viewerUrl ? (
          <iframe
            src={viewerUrl}
            width='100%'
            height='100%'
            style={{ border: 'none' }}
          />
        ) : (
          <p className='text-center text-red-500 mt-10'>
            Unsupported file format or invalid document URL.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default PDFViewerModal;
