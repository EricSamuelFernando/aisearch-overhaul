'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SendSnapLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any;
  onSend: (selectedUserIds: string[]) => void;
}

const SendSnapLinkModal: React.FC<SendSnapLinkModalProps> = ({
  isOpen,
  onClose,
  users,
  onSend,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) return;
    onSend(selectedUsers);
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-orange-600">
              Send Snap Link
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto">
            {users.map((user:any) => (
              <label
                key={user.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-800">{user.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSend}
              disabled={selectedUsers.length === 0}
              className="rounded-lg bg-orange-500 px-6 py-2 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              Send Link
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SendSnapLinkModal;
