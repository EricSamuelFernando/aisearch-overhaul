import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TextInput, Text } from '@mantine/core';
import CustomModal from '../shared/custom-modal';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '../ui/button';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';
import { error, success } from '../alert/notify';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { SocketContext } from '@/providers/socket.context';

interface InviteUserModalProps {
  threadId: string
  onInviteSuccess?: (email: string, role: 'buyer_agent' | 'co_buyer' | 'family_friends') => void
  onParticipantsRefresh?: () => void
  disableInvite?: boolean
  disableInviteMessage?: string
  blockedEmails?: string[]
  currentUserEmail?: string
  currentUserData?: any
  propertyId?: string | number
  listingId?: string | number
  propertyName?: string
  propertyAddress?: string
  propertyImage?: string
}

const InviteUserModal = ({
  threadId,
  onInviteSuccess,
  onParticipantsRefresh,
  disableInvite = false,
  disableInviteMessage,
  blockedEmails = [],
  currentUserEmail,
  currentUserData,
  propertyId,
  listingId,
  propertyName,
  propertyAddress,
  propertyImage,
}: InviteUserModalProps) => {
  type InviteRole = 'buyer_agent' | 'co_buyer' | 'family_friends';
  const [opened, { open, close }] = useDisclosure(false);

  const { socket } = useContext(SocketContext);
  const { addParticipantsToThread } = useUserAgentMessageApi();
  const { propertyEngagementMutation } = usePropertyAPI();
  const { externalAgentIvitationMutation } = useUserAuthApi();
  const { getEngagedPropertyByPropertyId } = useAgentConversationApi();

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('buyer_agent');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [engagementId, setEngagementId] = useState<string | null>(null);

  const actor = currentUserData || {};
  const normalizedPropertyId = String(propertyId || '').trim();
  const normalizedListingId = String(listingId || '').trim();
  const safePropertyName = propertyName || 'Property';
  const safePropertyAddress = propertyAddress || 'Property address unavailable';
  const safePropertyImage = propertyImage || '/assets/images/property-placeholder.jpg';

  const normalizedBlockedEmailSet = useMemo(
    () => new Set(blockedEmails.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)),
    [blockedEmails],
  );

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (!isEmailValid) {
      setIsEmailValid(true);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (disableInvite && opened) {
      close();
    }
  }, [close, disableInvite, opened]);

  const validateInviteInput = (): boolean => {
    if (disableInvite) {
      error({ message: disableInviteMessage || 'Maximum invite limit reached. New invites are disabled.' });
      return false;
    }
    if (!threadId) {
      error({ message: 'Thread is not selected. Please open a chat and try again.' });
      return false;
    }
    return true;
  };

  const ensureEngagement = async () => {
    if (engagementId) return engagementId;
    if (!normalizedPropertyId) {
      error({ message: 'Property context is missing for invitation.' });
      return null;
    }

    try {
      const existingResponse: any = await getEngagedPropertyByPropertyId.mutateAsync(normalizedPropertyId);
      const existingEngagementId = existingResponse?.data?.data?.getUserEngagementsByPropertyId?.id;
      if (existingEngagementId) {
        setEngagementId(existingEngagementId);
        return existingEngagementId;
      }
    } catch (_) {
      // If lookup fails, attempt create engagement below.
    }

    try {
      const createdResponse: any = await propertyEngagementMutation.mutateAsync({
        propertyName: safePropertyName,
        price: 0,
        listingId: Number(normalizedListingId) || 0,
        propertyId: normalizedPropertyId,
        city: 'Los angeles',
        zipCode: '',
        propertyAddress: safePropertyAddress,
        propertyImage: safePropertyImage,
        userId: actor?.id,
        answers: undefined,
        propertyProgress: 10,
        fullAddress: safePropertyAddress,
      });
      const newEngagementId = createdResponse?.data?.createEngagement?.id;
      if (!newEngagementId) {
        throw new Error('Failed to create engagement');
      }
      setEngagementId(newEngagementId);
      return newEngagementId;
    } catch (err: any) {
      error({ message: err?.message || 'Unable to prepare engagement for invitation.' });
      return null;
    }
  };

  const sendThreadInviteByEmail = async (targetEmail: string) => {
    return addParticipantsToThread.mutateAsync({
      threadId,
      email: targetEmail,
      role: inviteRole,
    });
  };

  const handleInviteSubmit = async () => {
    if (!validateInviteInput()) return;
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCurrentUserEmail = String(currentUserEmail || '').trim().toLowerCase();

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      return;
    }

    if (normalizedCurrentUserEmail && normalizedEmail === normalizedCurrentUserEmail) {
      error({ message: 'You cannot send an invite to yourself.' });
      return;
    }

    if (normalizedBlockedEmailSet.has(normalizedEmail)) {
      error({ message: 'This user is already in the chat or already invited.' });
      return;
    }

    setIsEmailValid(true);
    setIsSubmitting(true);

    try {
      if (inviteRole === 'buyer_agent') {
        if (!actor?.id) {
          error({ message: 'Please login to send invitation.' });
          setIsSubmitting(false);
          return;
        }
        const safeEngagementId = await ensureEngagement();
        if (!safeEngagementId) {
          setIsSubmitting(false);
          return;
        }

        const response: any = await externalAgentIvitationMutation.mutateAsync({
          agentType: actor?.account_type,
          userId: actor?.id,
          email: email.trim(),
          is_accepted: 'pending',
          engagementId: safeEngagementId,
          threadId,
        });

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to send invitation');
        }

      if (statusNormalized === 'sent') {
        onInviteSuccess?.(email.trim(), effectiveInviteRole);
        onParticipantsRefresh?.();
        success({ message: 'Invitation sent successfully.' });
      } else if (statusNormalized === 'queued') {
        onInviteSuccess?.(email.trim(), effectiveInviteRole);
        onParticipantsRefresh?.();
        success({ message: 'Invitation sent successfully.' });
      } else if (statusNormalized === 'failed') {
        error({ message: deliveryFailureReason || 'Invitation created, but email delivery failed.' });
      } else {
        // Server didn't return a delivery status (e.g. add_participant_to_thread path on production).
        // The participant was created successfully — treat as success.
        onInviteSuccess?.(email.trim(), effectiveInviteRole);
        onParticipantsRefresh?.();
        success({ message: 'Invitation sent successfully.' });
      }

      onInviteSuccess?.(email.trim(), inviteRole);
      onParticipantsRefresh?.();
      success({ message: 'Invitation sent successfully.' });
      setTimeout(() => {
        setEmail('');
        setInviteRole('buyer_agent');
        setIsEmailValid(true);
        close();
      }, 120);
    } catch (err: any) {
      error({ message: err?.message || 'Failed to send invitation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
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
        backdropBlur='pointer-event-none'
      >
        <div className='flex min-w-[25rem]  max-w-2xl flex-col gap-4 overflow-x-hidden p-10 md:min-w-[32rem]'>
          <p className='font-bold text-md'>Enter the email address of the person you want to invite:</p>

          {disableInvite && (
            <Text size="sm" c="red">
              {disableInviteMessage || 'Maximum invite limit reached. You cannot send new invites.'}
            </Text>
          )}

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
            <Button
              className='rounded-xl w-fit bg-orange-500'
              onClick={handleInviteSubmit}
              style={{ marginTop: '20px' }}
              disabled={isSubmitting || disableInvite}
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default InviteUserModal;
