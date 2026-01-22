'use client';

import React, { createContext, useContext, useState } from 'react';
import CollectionModal from '@/components/modals/collection-modal';

type CollectionModalContextType = {
  openCollectionModal: (propertyId?: string, propertyImage?: string, onSuccess?: () => void) => void;
  closeCollectionModal: () => void;
};

const CollectionModalContext = createContext<CollectionModalContextType>({
  openCollectionModal: () => { },
  closeCollectionModal: () => { },
});

export const useCollectionModal = () => useContext(CollectionModalContext);

export const CollectionModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [propertyId, setPropertyId] = useState<string | undefined>();
  const [propertyImage, setPropertyImage] = useState<string | undefined>();
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | undefined>();

  const openCollectionModal = (id?: string, image?: string, onSuccess?: () => void) => {
    setPropertyId(id);
    setPropertyImage(image);
    setOnSuccessCallback(() => onSuccess);
    setIsOpen(true);
  };

  const closeCollectionModal = () => {
    setIsOpen(false);
    setOnSuccessCallback(undefined);
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
        onSuccess={onSuccessCallback}
      />
    </CollectionModalContext.Provider>
  );
};

export default CollectionModalProvider; 