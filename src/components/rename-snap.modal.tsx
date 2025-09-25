'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface RenameCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
}

const RenameCollectionModal: React.FC<RenameCollectionModalProps> = ({
  isOpen,
  onClose,
  onRename,
  currentName,
}) => {
  console.log("Curent Name: ", currentName);
  
  const [newName, setNewName] = useState(currentName);  
  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Rename Collection</DialogTitle>
          {/* <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X size={20} />
          </button> */}
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <Input
            value={newName||currentName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new collection name"
            className="w-full"
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
            >
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RenameCollectionModal;
