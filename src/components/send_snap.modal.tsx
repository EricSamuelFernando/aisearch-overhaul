'use client';

import { useMemo, useState } from 'react';
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
  loading?: boolean;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
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
  loading,
  onSearch,
  isSearching
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

  const pageNumbers = useMemo(() => {
    if (!totalPages) return [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-lg sm:p-6">
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

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
            />
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto min-h-[200px]">
            {isSearching ? (
              <p className="text-center text-gray-500 py-8">Searching...</p>
            ) : users.length === 0 ? (
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
          {totalPages > 1 && onPageChange && !isSearching && (
            <>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm sm:hidden">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-orange-600 disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="min-w-0 text-center text-sm font-medium text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-orange-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div className="mt-4 hidden items-center justify-center gap-2 text-sm sm:flex">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-gray-500 hover:text-orange-600 disabled:opacity-50"
              >
                Prev
              </button>

              {pageNumbers.map((p, idx) => (
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
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSend}
              disabled={selectedUsers.length === 0}
              className="w-full rounded-lg bg-orange-500 px-6 py-2 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50 sm:w-auto"
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
