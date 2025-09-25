import React from 'react';
import Image from 'next/image';

interface DocumentCardProps {
  documentId?: string;
  title?: string;
  description?: string;
  isSelected?: boolean;
  onSelect?: (documentId: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const DisclsoureDocumentCard: React.FC<DocumentCardProps> = ({
  title = 'Cover Sheet',
  description = 'Updated Dec 21, 2023 02:50 PM',
}) => {
  return (
    <section className='cursor-pointer   items-center gap-x-4 p-4 transition-all duration-500 ease-in-out hover:bg-grey-880'>
      <Image
        height={60}
        width={60}
        src='/assets/images/pdf.svg'
        alt='Document Icon'
      />
      <div className='mt-2 space-y-1'>
        <h3 className='font-bold text-black'>{title}</h3>
        <p className='text-xs text-grey-710'>{description}</p>
      </div>
    </section>
  );
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  description,
  isSelected,
  onSelect,
  documentId,
  draggable,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragOver,
  onDragEnd,
}) => {
  const handleClick = () => {
    onSelect?.(documentId!);
  };

  return (
    <section
      className={`flex cursor-pointer items-center gap-x-4 rounded-lg p-4 transition-all duration-500 ease-in-out hover:bg-grey-880 ${
        isSelected ? 'bg-grey-880' : ''
      }`}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <Image
        height={60}
        width={60}
        src='/assets/images/pdf.svg'
        alt='Document Icon'
      />
      <div className='space-y-2'>
        <h3 className='font-bold text-black'>{title}</h3>
        <p className='text-xs text-grey-710'>{description}</p>
        {isSelected && <span className='text-xs text-blue-500'>Selected</span>}
      </div>
    </section>
  );
};

export default DocumentCard;
