import React, { useEffect, useMemo, useState } from 'react';
import {  TextInput, Text, } from '@mantine/core';
import CustomModal from '../shared/custom-modal';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '../ui/button';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';
import { error } from '../alert/notify';

interface InviteUserModalProps {
  threadId: string
  onInviteSuccess?: (email: string, role: 'buyer_agent' | 'co_buyer' | 'family_friends') => void
  disableInvite?: boolean
  disableInviteMessage?: string
  blockedEmails?: string[]
  currentUserEmail?: string
}

const InviteUserModal = ({
  threadId,
  onInviteSuccess,
  disableInvite = false,
  disableInviteMessage,
  blockedEmails = [],
  currentUserEmail,
}: InviteUserModalProps) => {
  type InviteRole = 'buyer_agent' | 'co_buyer' | 'family_friends';
  // State to control modal visibility
  const [opened, { open, close }] = useDisclosure(false);

  const { addParticipantsToThread } = useUserAgentMessageApi()

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('buyer_agent');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalizedBlockedEmailSet = useMemo(
    () => new Set(blockedEmails.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)),
    [blockedEmails],
  );

  // Function to handle email input change
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (!isEmailValid) {
      setIsEmailValid(true);
    }
  };

  // Function to validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  console.log(threadId)

  useEffect(() => {
    if (disableInvite && opened) {
      close();
    }
  }, [close, disableInvite, opened]);

  // Function to handle form submission
  const handleInviteSubmit = () => {
    if (disableInvite) {
      error({ message: disableInviteMessage || 'Maximum invite limit reached. New invites are disabled.' });
      return;
    }
    if (!threadId) {
      error({ message: 'Thread is not selected. Please open a chat and try again.' });
      return;
    }
    if (isSubmitting) {
      return;
    }
    if (validateEmail(email)) {
      setIsEmailValid(true);
      setIsSubmitting(true);
      console.log('Invitation sent to:', email, 'Role:', inviteRole);
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCurrentUserEmail = String(currentUserEmail || '').trim().toLowerCase();

      if (normalizedCurrentUserEmail && normalizedEmail === normalizedCurrentUserEmail) {
        error({ message: 'You cannot send an invite to yourself.' });
        setIsSubmitting(false);
        return;
      }

      if (normalizedBlockedEmailSet.has(normalizedEmail)) {
        error({ message: 'This user is already in the chat or already invited.' });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        threadId,
        email
      }
      addParticipantsToThread.mutate(payload, {
        onSuccess: (data:any) => {
         console.log("Participant added successfully" , data)
         onInviteSuccess?.(email.trim(), inviteRole);
         setTimeout(() => {
           setEmail(''); // Clear input field after successful submission
           setInviteRole('buyer_agent');
           setIsEmailValid(true);
           setIsSubmitting(false);
           close(); // Close the modal after success toast cycle starts
         }, 200);
        },
        onError: (error:any) => {
            console.log(error?.message)
            setIsSubmitting(false);
        },
      });
    } else {
      setIsEmailValid(false);
    }
  };

  return (
    <div>
      {/* Button to open the modal */}
      <div className="relative group">
        <button
          className={`w-full text-left px-4 py-2 ${disableInvite ? "text-gray-400 cursor-not-allowed bg-gray-50" : "hover:bg-gray-100"}`}
          onClick={() => {
            if (disableInvite) return;
            open();
          }}
          title={disableInvite ? (disableInviteMessage || 'Invites are blocked because this chat already has 5 participants.') : undefined}
        >
          Invite User
        </button>
        {disableInvite && (
          <div className="hidden group-hover:block absolute left-2 right-2 top-full mt-1 z-10 rounded-md bg-black text-white text-[11px] px-2 py-1">
            {disableInviteMessage || 'Invites are blocked because this chat already has 5 participants.'}
          </div>
        )}
      </div>

      <CustomModal
         isOpen={opened}
         onClose={close}
         className='backdrop-blur-sm'
         disableEscapeClose={false}
         closeDisabled={false}
         backdropBlur='pointer-event-none'// Optional custom classes for the modal content
      >
           <div className='flex min-w-[25rem]  max-w-2xl flex-col gap-4 overflow-x-hidden p-10 md:min-w-[32rem]'>
        
        <p className='font-bold text-md'>Enter the email address of the person you want to invite:</p>
        {disableInvite && (
          <Text size="sm" c="red">
            {disableInviteMessage || 'Maximum invite limit reached. You cannot send new invites.'}
          </Text>
        )}
        
        {/* Email input field */}
        <TextInput
          value={email}
          onChange={handleEmailChange}
          placeholder="user@example.com"
          label="Email"
          required
          disabled={disableInvite || isSubmitting}
          error={!isEmailValid && 'Please enter a valid email address'}
        />

        <div className="flex flex-col gap-2">
          <Text size="sm" fw={500}>Invite as</Text>
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as InviteRole)}
            disabled={disableInvite || isSubmitting}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-500"
          >
            <option value="buyer_agent">Buyer Agent</option>
            <option value="co_buyer">Co-buyer</option>
            <option value="family_friends">Family/Friends</option>
          </select>
          {inviteRole === 'family_friends' && (
            <Text size="sm" c="orange">
              Family/Friends invitees will have view-only (read-only) access.
            </Text>
          )}
        </div>
      
      <div className='flex gap-4 '>


      <Button
        className='rounded-xl w-fit '
        onClick={() => {
          if (isSubmitting) return;
          setEmail('');
          setInviteRole('buyer_agent');
          setIsEmailValid(true);
          close();
        }}
        style={{ marginTop: '20px' }}
      >
          Cancel
        </Button>
          {/* Submit button */}
          <Button className='rounded-xl w-fit bg-orange-500' onClick={handleInviteSubmit} style={{ marginTop: '20px' }} disabled={isSubmitting || disableInvite}>
          {isSubmitting ? 'Sending...' : 'Send Invitation'}
        </Button>
      </div>
        
      
        </div>
      </CustomModal>


    </div>
  );
};

export default InviteUserModal;
