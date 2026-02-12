'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType?: string; // Added accountType
}

interface SendSnapLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any;
  onSend: (selectedUsers: User[]) => void;
  // Pagination Props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  total?: number;
  loading?: boolean
}

{/* Modified here by Abhradip Paul loading is not defined in the props*/ }

const SendSnapLinkModal: React.FC<SendSnapLinkModalProps> = ({
  isOpen,
  onClose,
  users,
  onSend,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  total,
  loading
}) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const toggleUserSelection = (userToToggle: User) => {
    /* ... existing toggle logic ... */
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === userToToggle.id);
      if (exists) {
        return prev.filter((u) => u.id !== userToToggle.id);
      }
      return [...prev, userToToggle];
    });
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) return;
    onSend(selectedUsers);
    setSelectedUsers([]);
    onClose();
  };

  // Generate page numbers to display (simple version)
  const getPageNumbers = () => {
    const pages = [];
    // Always show first, last, current, and neighbors.
    // Simplifying to show current -1, current, current + 1 for now, or just all if small.
    // Given the screenshot shows "Prev 1 2 ... 2832 Next", we need logic.
    if (!totalPages) return [];

    // Simple logic:
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...', totalPages);
      }
    }
    return pages;
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

          <div className="space-y-4 max-h-60 overflow-y-auto min-h-[200px]">
            {users.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users found.</p>
            ) : (
              users.map((user: any) => {
                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                const displayName = name.length > 0 ? name : "No Name";

                const isSelected = selectedUsers.some(u => u.id === user.id);

                return (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUserSelection({
                          id: user.id,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                          accountType: user.accountType
                        })}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 rounded border-gray-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && onPageChange && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-gray-500 hover:text-orange-600 disabled:opacity-50"
              >
                Prev
              </button>

              {getPageNumbers().map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof p === 'number' ? onPageChange(p) : null}
                  disabled={p === '...'}
                  className={`px-3 py-1 rounded-md ${p === currentPage
                    ? 'bg-orange-500 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                    } ${p === '...' ? 'cursor-default hover:bg-transparent' : ''}`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-gray-500 hover:text-orange-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

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
