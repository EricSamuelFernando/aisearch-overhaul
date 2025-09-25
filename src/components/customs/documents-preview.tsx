import React from 'react';

import { CustomFileInputBuyer } from '../custom-file-input';
import { CardItem } from './card-item';

export interface Document {
  name: string;
  type: string;
  url: string;
}

export interface DocumentsProps {
  documents: any[];
  addFileToDocuments: (file: File) => void;
}

const DocumentsUpload: React.FC<DocumentsProps> = ({
  addFileToDocuments,
  documents,
}) => {
  return (
    <section className='flex h-4/5 w-full flex-col items-center justify-between gap-x-5 py-8'>
      <div className='flex h-4/5 w-full'>
        <div className='flex h-4/5 w-full flex-col'>
          <CustomFileInputBuyer handleFile={addFileToDocuments} />
          <section className='mt-6 grid grid-cols-2 gap-7'>
            {documents.map((doc, index) => (
              <CardItem
                key={index}
                title={doc.name || doc}
                updatedDate={`Updated ${new Date().toLocaleString()}`}
              />
            ))}
          </section>
        </div>
      </div>
    </section>
  );
};

export default DocumentsUpload;
