'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (!email) return;
    onSend(email);
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-orange-600">
              Invite a User
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:ring-orange-500"
              placeholder="example@email.com"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSend}
              disabled={!email}
              className="rounded-lg bg-orange-500 px-6 py-2 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              Send Invite
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default InviteUserModal;
