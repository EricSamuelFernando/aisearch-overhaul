'use client';

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface DeleteCollectionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  collectionName?: string;
}

const DeleteCollectionConfirmationModal: React.FC<DeleteCollectionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  collectionName,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold text-orange-400">
              Delete Snapz
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to permanently delete
              {collectionName ? (
                <span className="font-semibold text-orange-500"> {collectionName}</span>
              ) : (
                ' this collection'
              )}
              ?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="rounded-lg bg-orange-500 px-5 py-2 text-white hover:bg-orange-600 transition"
            >
              Delete
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DeleteCollectionConfirmationModal;
