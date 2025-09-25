'use client';

import React, { createContext, useContext, useState } from 'react';
import CollectionModal from '@/components/modals/collection-modal';

type CollectionModalContextType = {
  openCollectionModal: (propertyId?: string, propertyImage?: string) => void;
  closeCollectionModal: () => void;
};

const CollectionModalContext = createContext<CollectionModalContextType>({
  openCollectionModal: () => {},
  closeCollectionModal: () => {},
});

export const useCollectionModal = () => useContext(CollectionModalContext);

export const CollectionModalProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [propertyId, setPropertyId] = useState<string | undefined>();
  const [propertyImage, setPropertyImage] = useState<string | undefined>();

  const openCollectionModal = (id?: string, image?: string) => {
    setPropertyId(id);
    setPropertyImage(image);
    setIsOpen(true);
  };

  const closeCollectionModal = () => {
    setIsOpen(false);
  };

  return (
    <CollectionModalContext.Provider
      value={{
        openCollectionModal,
        closeCollectionModal,
      }}
    >
      {children}
      <CollectionModal
        isOpen={isOpen}
        onClose={closeCollectionModal}
        propertyId={propertyId}
        propertyImage={propertyImage}
      />
    </CollectionModalContext.Provider>
  );
};

export default CollectionModalProvider; 