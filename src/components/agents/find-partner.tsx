'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { X } from 'lucide-react';
import classNames from 'classnames';
import { useUserSnapAPIs } from '../../hooks/api/auth/snaps.API';

const FindPartner = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubItem, setSelectedSubItem] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { sendPartnerInvitation } = useUserSnapAPIs();

  const handleInvite = async () => {
    try {
      await sendPartnerInvitation.mutateAsync({
        email: "paromita@onebillionideas.io",
        partnerEmail: inviteEmail,
      });

      alert('Invitation sent successfully!');
      setShowModal(false);
      setInviteEmail('');
      setSelectedCategory('');
      setSelectedSubItem('');
    } catch (err: any) {
      console.error('Invitation failed:', err);
    }
  };

  return (
    <section className="bg-[#FAF0E6] px-4 py-20 flex flex-col items-center relative">
      <div className="relative max-w-md w-full border border-[#E0D8C7] rounded-2xl p-8">
        <div className="text-center text-sm text-gray-700 mt-6">
          Can’t find your partner?
          <br />
          <button
            className="underline text-black hover:text-gray-800 mt-1"
            onClick={() => setShowModal(true)}
          >
            Invite as a partner
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Invite a Partner</h3>

            <Input
              placeholder="Enter your email"
              className="mb-4"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />

            <div className="mb-4">
              <label className="block mb-1 font-medium">Select Category</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubItem('');
                }}
              >
                <option value="">-- Choose Category --</option>
                <option value="Mandatory">Mandatory</option>
                <option value="Conditional">Conditional</option>
                <option value="Value-Add / Concierge">Value-Add / Concierge</option>
              </select>
            </div>

            {selectedCategory && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Select Sub-Category</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedSubItem}
                  onChange={(e) => setSelectedSubItem(e.target.value)}
                >
                  <option value="">-- Choose Sub-Category --</option>
                  {selectedCategory === 'Mandatory' && (
                    <>
                      <option value="title@escrow.com">Title/Escrow</option>
                      <option value="lender@finance.com">Mortgage lender</option>
                    </>
                  )}
                  {selectedCategory === 'Conditional' && (
                    <>
                      <option value="inspector@homes.com">Home inspector</option>
                      <option value="attorney@legal.com">Attorney</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <button
              className={classNames(
                'w-full mt-2 py-2 px-4 bg-black text-white rounded hover:bg-gray-800',
                {
                  'opacity-50 cursor-not-allowed':
                    !inviteEmail || !selectedCategory || !selectedSubItem,
                }
              )}
              disabled={
                !inviteEmail ||
                !selectedCategory ||
                !selectedSubItem 
                // sendPartnerInvitation.isLoading
              }
              onClick={handleInvite}
            >
              {/* {sendPartnerInvitation.isLoading ? 'Sending...' : 'Send Invite'} */}
              Send Invite
            </button>

            {sendPartnerInvitation.isError && (
              <div className="text-red-500 mt-2">
                Error: {sendPartnerInvitation.error?.message || 'Failed to send'}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FindPartner;
