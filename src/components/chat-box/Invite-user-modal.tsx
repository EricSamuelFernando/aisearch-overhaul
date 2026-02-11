import React, { useState } from 'react';
import {  TextInput, Text, } from '@mantine/core';
import CustomModal from '../shared/custom-modal';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '../ui/button';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';

const InviteUserModal = ({threadId}:any) => {
  type InviteRole = 'buyer_agent' | 'co_buyer' | 'family_friends';
  // State to control modal visibility
  const [opened, { open, close }] = useDisclosure(false);

  const { addParticipantsToThread } = useUserAgentMessageApi()

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('buyer_agent');
  const [isEmailValid, setIsEmailValid] = useState(true);

  // Function to handle email input change
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  // Function to validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  console.log(threadId)

  // Function to handle form submission
  const handleInviteSubmit = () => {
    if (validateEmail(email)) {
      setIsEmailValid(true);
      console.log('Invitation sent to:', email, 'Role:', inviteRole);

      const payload = {
        threadId,
        email
      }
      addParticipantsToThread.mutate(payload, {
        onSuccess: (data:any) => {
         console.log("Participant added successfully" , data)
        },
        onError: (error:any) => {
            console.log(error?.message)
        },
      });
      
      setEmail(''); // Clear input field after submission
      setInviteRole('buyer_agent');
      close() // Close the modal
    } else {
      setIsEmailValid(false);
    }
  };

  return (
    <div>
      {/* Button to open the modal */}
      <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={open}>Invite User</button>

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
        
        {/* Email input field */}
        <TextInput
          value={email}
          onChange={handleEmailChange}
          placeholder="user@example.com"
          label="Email"
          required
          error={!isEmailValid && 'Please enter a valid email address'}
        />

        <div className="flex flex-col gap-2">
          <Text size="sm" fw={500}>Invite as</Text>
          <select
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value as InviteRole)}
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
          <Button className='rounded-xl w-fit bg-orange-500' onClick={handleInviteSubmit} style={{ marginTop: '20px' }}>
          Send Invitation
        </Button>
      </div>
        
      
        </div>
      </CustomModal>


    </div>
  );
};

export default InviteUserModal;
