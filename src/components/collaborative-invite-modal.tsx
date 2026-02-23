'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface CollaborateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (email: string, type: 'agent' | 'co-buyer' | 'other') => void;
}

const CollaborateModal: React.FC<CollaborateModalProps> = ({
    isOpen,
    onClose,
    onSend,
}) => {
    const [email, setEmail] = useState('');
    const [inviteType, setInviteType] = useState<'co-buyer' | 'agent' | 'other'>('co-buyer');

    const handleSend = () => {
        if (!email) return;
        onSend(email, inviteType);
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
                            Invite to Collaborate
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Invite Type
                            </label>
                            <select
                                value={inviteType}
                                onChange={(e) => setInviteType(e.target.value as 'agent' | 'co-buyer' | 'other')}
                                className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:ring-orange-500 bg-white"
                            >
                                <option value="co-buyer">Invite Co-buyer</option>
                                <option value="agent">Invite Agent</option>
                                <option value="other">Invite Family/Friends</option>

                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {inviteType === 'co-buyer' ? 'Co-buyer Email' : inviteType === 'agent' ? 'Agent Email' : 'Email'}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:ring-orange-500"
                                placeholder="example@email.com"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={handleSend}
                            disabled={!email}
                            className="rounded-lg bg-orange-500 px-6 py-2 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            Send Invite
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default CollaborateModal;
