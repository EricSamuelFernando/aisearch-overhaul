'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateSnapModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}

const CreateSnapModal: React.FC<CreateSnapModalProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [name, setName] = useState("");

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name.trim());
            setName("");
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl p-6">
                <DialogHeader className="flex justify-between items-center">
                    <DialogTitle>Create New Snapz</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter snapz name"
                        className="w-full"
                        autoFocus
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
                            onClick={handleCreate}
                            disabled={!name.trim()}
                            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSnapModal;
