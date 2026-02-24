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
import { useRouter } from 'next/navigation';
import { sendAgentInvitationEmail } from '@/utils/email-notification';

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
  engagementId?: string
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
  engagementId: initialEngagementId,
  propertyName,
  propertyAddress,
  propertyImage,
}: InviteUserModalProps) => {
  type InviteRole = 'buyer_agent' | 'co_buyer' | 'family_friends';
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const { socket } = useContext(SocketContext);
  const { addParticipantsToThread } = useUserAgentMessageApi();
  const { propertyEngagementMutation } = usePropertyAPI();
  const { externalAgentIvitationMutation } = useUserAuthApi();
  const { getEngagedPropertyByPropertyId } = useAgentConversationApi();

  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>('buyer_agent');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [engagementId, setEngagementId] = useState<string | null>(initialEngagementId || null);

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
    if (engagementId) {
      console.log('[Invite-user-modal] Using existing engagementId:', engagementId);
      return engagementId;
    }
    if (!normalizedPropertyId) {
      error({ message: 'Property context is missing for invitation.' });
      return null;
    }

    try {
      console.log('[Invite-user-modal] Looking for existing engagement for propertyId:', normalizedPropertyId);
      const existingResponse: any = await getEngagedPropertyByPropertyId.mutateAsync(normalizedPropertyId);
      const existingEngagementId = existingResponse?.data?.data?.getUserEngagementsByPropertyId?.id;
      if (existingEngagementId) {
        console.log('[Invite-user-modal] Found existing engagement:', existingEngagementId);
        setEngagementId(existingEngagementId);
        return existingEngagementId;
      }
    } catch (lookupErr: any) {
      // If lookup fails, attempt create engagement below.
      console.log('[Invite-user-modal] Lookup for existing engagement failed, will attempt to create:', lookupErr?.message);
    }

    try {
      console.log('[Invite-user-modal] Creating new engagement for property:', normalizedPropertyId);
      const createdResponse: any = await propertyEngagementMutation.mutateAsync({
        propertyName: safePropertyName,
        price: 0,
        listingId: Number(normalizedListingId) || 0,
        propertyId: Number(normalizedPropertyId) || normalizedPropertyId,
        city: 'Los angeles',
        zipCode: '',
        propertyAddress: safePropertyAddress,
        propertyImage: safePropertyImage,
        userId: actor?.id,
        answers: undefined,
        propertyProgress: 10,
        fullAddress: safePropertyAddress,
      });
      
      console.log('[Invite-user-modal] Engagement creation response:', createdResponse);
      const newEngagementId = createdResponse?.data?.createEngagement?.id;
      
      if (!newEngagementId) {
        console.error('[Invite-user-modal] No engagement ID in response:', createdResponse);
        throw new Error('Failed to create engagement - no ID returned from server');
      }
      
      // Validate that we got a reasonable engagement ID (UUID-like string)
      if (typeof newEngagementId !== 'string' || newEngagementId.trim().length === 0) {
        console.error('[Invite-user-modal] Invalid engagement ID format:', newEngagementId);
        throw new Error('Invalid engagement ID format received from server');
      }
      
      console.log('[Invite-user-modal] Successfully created engagement:', newEngagementId);
      setEngagementId(newEngagementId);
      
      // Small delay to allow DB transaction to commit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return newEngagementId;
    } catch (err: any) {
      console.error('[Invite-user-modal] Error ensuring engagement:', err);
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
        console.log('[Invite-user-modal] Ensuring engagement for buyer_agent invitation...');
        const safeEngagementId = await ensureEngagement();
        if (!safeEngagementId) {
          console.error('[Invite-user-modal] Failed to get/create engagement');
          setIsSubmitting(false);
          return;
        }

        console.log('[Invite-user-modal] Sending external agent invitation with:', {
          agentType: actor?.account_type,
          userId: actor?.id,
          email: email.trim(),
          is_accepted: 'pending',
          engagementId: safeEngagementId,
          threadId,
        });

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

        if (socket && response?.agentId && response?.participantId) {
          socket.emit('send_property_invitation', {
            reciepent: response.agentId,
            userName: `${actor?.firstname || ''} ${actor?.lastname || ''}`.trim(),
            userEmail: actor?.email,
            propertyImage: safePropertyImage,
            propertyAddress: safePropertyAddress,
            id: response.participantId,
          });
        }

        // Send email notification to the agent
        const buyerName = `${actor?.firstname || ''} ${actor?.lastname || ''}`.trim();
        const emailSuccess = await sendAgentInvitationEmail({
          agentEmail: email.trim(),
          buyerName,
          buyerEmail: actor?.email,
          propertyAddress: safePropertyAddress,
          propertyImage: safePropertyImage,
          invitationStatus: 'NEGOTIATION_PENDING',
          participantId: response?.participantId,
          socket,
        });

        if (emailSuccess) {
          console.log('[Invite-user-modal] Agent invitation email sent successfully');
        } else {
          console.warn('[Invite-user-modal] Email notification may not have been delivered');
        }

        // Redirect to messages with agent email as query parameter
        // This will auto-open the negotiation flow
        success({ message: 'Invitation sent successfully. Opening messages...' });
        setTimeout(() => {
          router.push(`/dashboard/chat?agentEmail=${encodeURIComponent(email.trim())}&focusLatest=1&showNegotiationCard=1`);
          setEmail('');
          setInviteRole('buyer_agent');
          setIsEmailValid(true);
          close();
        }, 500);
        return;
      } else {
        await sendThreadInviteByEmail(email.trim());
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
