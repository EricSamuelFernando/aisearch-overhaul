import React, { useContext, useEffect, useMemo, useState } from 'react';
import { TextInput, Text } from '@mantine/core';
import CustomModal from '../shared/custom-modal';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '../ui/button';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';
import { error, info, success, warning } from '../alert/notify';
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { SocketContext } from '@/providers/socket.context';
import { showLogger } from '@/shared/constants/env';

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
  const effectiveInviteRole: InviteRole = inviteRole;
  const shouldLogInviteDeliveryDebug =
    showLogger || process.env.NEXT_PUBLIC_INVITE_DELIVERY_DEBUG === 'true';

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
      role: effectiveInviteRole,
      invitedByUserId: actor?.id,
      engagementId: engagementId || undefined,
    });
  };

  const extractErrorMessage = (err: any): string => {
    const graphQLError = err?.response?.data?.errors?.[0] || {};
    const extensionCode = graphQLError?.extensions?.code || graphQLError?.code;
    const correlationId =
      graphQLError?.extensions?.correlationId ||
      graphQLError?.correlationId;
    if (extensionCode === 'EMAIL_SEND_FAILED') {
      return correlationId
        ? `Email delivery failed (ref: ${correlationId}).`
        : 'Email delivery failed.';
    }

    const fallbackMessage = (
      graphQLError?.message ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to send invitation.'
    );

    const normalizedFallbackMessage = String(fallbackMessage).toLowerCase();
    if (
      normalizedFallbackMessage.includes('column user.passwordset does not exist') ||
      normalizedFallbackMessage.includes('passwordset does not exist')
    ) {
      return 'Invitation failed due to a server configuration issue. Please try again later.';
    }
    if (
      normalizedFallbackMessage.includes('status raw not found') ||
      normalizedFallbackMessage.includes('statusraw not found')
    ) {
      return 'Invitation created, but delivery status was not provided by server.';
    }

    return fallbackMessage;
  };

  const mapInviteServerMessage = (message: string): string => {
    const normalizedMessage = String(message || '').toLowerCase();
    if (
      normalizedMessage.includes('column user.passwordset does not exist') ||
      normalizedMessage.includes('passwordset does not exist')
    ) {
      return 'Invitation failed due to a server configuration issue. Please try again later.';
    }
    if (
      normalizedMessage.includes('status raw not found') ||
      normalizedMessage.includes('statusraw not found')
    ) {
      return 'Invitation created, but delivery status was not provided by server.';
    }
    return message;
  };

  const logInviteDeliveryDebug = (payload: {
    path: 'createExternalParticipant' | 'add_participant_to_thread'
    targetEmail: string
    role: InviteRole
    statusRaw?: string
    statusNormalized?: 'sent' | 'queued' | 'failed' | 'unknown'
    emailFailureReason?: string
    response: any
  }) => {
    if (!shouldLogInviteDeliveryDebug) return;
    console.info('[InviteUserModal][DeliveryDebug]', {
      timestamp: new Date().toISOString(),
      threadId,
      ...payload,
    });
  };

  const normalizeDeliveryStatus = (inviteResponse: any): {
    statusRaw: string
    statusNormalized: 'sent' | 'queued' | 'failed' | 'unknown'
  } => {
    const rawStatus = String(
      inviteResponse?.emailDeliveryStatus ??
      inviteResponse?.email_delivery_status ??
      inviteResponse?.deliveryStatus ??
      inviteResponse?.delivery_status ??
      inviteResponse?.invite?.emailDeliveryStatus ??
      inviteResponse?.invite?.email_delivery_status ??
      inviteResponse?.invite?.deliveryStatus ??
      inviteResponse?.invite?.delivery_status ??
      inviteResponse?.data?.emailDeliveryStatus ??
      inviteResponse?.data?.email_delivery_status ??
      inviteResponse?.data?.invite?.emailDeliveryStatus ??
      inviteResponse?.data?.invite?.email_delivery_status ??
      '',
    )
      .trim()
      .toLowerCase();

    if (rawStatus === 'sent' || rawStatus === 'queued' || rawStatus === 'failed') {
      return {
        statusRaw: rawStatus,
        statusNormalized: rawStatus,
      };
    }
    return {
      statusRaw: rawStatus,
      statusNormalized: 'unknown',
    };
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
      let inviteResponse: any = null;
      let graphQLErrors: any[] = [];
      if (effectiveInviteRole === 'buyer_agent') {
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

        try {
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
          inviteResponse = response;
          logInviteDeliveryDebug({
            path: 'createExternalParticipant',
            targetEmail: email.trim(),
            role: effectiveInviteRole,
            response: inviteResponse,
          });

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
        } catch (externalInviteErr: any) {
          console.error('[InviteUserModal][DeliveryDebug][Error]', {
            path: 'createExternalParticipant',
            threadId,
            targetEmail: email.trim(),
            role: effectiveInviteRole,
            error: externalInviteErr?.response?.data || externalInviteErr,
          });
          throw externalInviteErr;
        }
      } else {
        const threadInviteResult: any = await sendThreadInviteByEmail(email.trim());
        if (shouldLogInviteDeliveryDebug) {
          console.info('[InviteUserModal][RuntimeProof][HookResult]', JSON.stringify(threadInviteResult ?? {}, null, 2));
          console.info('[InviteUserModal][RuntimeProof][DataNode]', threadInviteResult?.data ?? null);
          console.info('[InviteUserModal][RuntimeProof][MutationBody]', threadInviteResult?.mutationBody ?? '');
        }
        inviteResponse = threadInviteResult?.data ?? threadInviteResult;
        graphQLErrors = Array.isArray(threadInviteResult?.graphQLErrors)
          ? threadInviteResult.graphQLErrors
          : [];
        logInviteDeliveryDebug({
          path: 'add_participant_to_thread',
          targetEmail: email.trim(),
          role: effectiveInviteRole,
          response: inviteResponse,
        });
      }

      const { statusRaw, statusNormalized } = normalizeDeliveryStatus(inviteResponse);
      const deliveryFailureReason =
        inviteResponse?.emailFailureReason ??
        inviteResponse?.email_failure_reason ??
        inviteResponse?.invite?.emailFailureReason ??
        inviteResponse?.invite?.email_failure_reason;
      logInviteDeliveryDebug({
        path: effectiveInviteRole === 'buyer_agent' ? 'createExternalParticipant' : 'add_participant_to_thread',
        targetEmail: email.trim(),
        role: effectiveInviteRole,
        statusRaw,
        statusNormalized,
        emailFailureReason: deliveryFailureReason,
        response: inviteResponse,
      });

      if (graphQLErrors.length > 0 && statusNormalized !== 'sent' && statusNormalized !== 'queued') {
        const graphQLErrorMessage = mapInviteServerMessage(
          graphQLErrors?.[0]?.message || 'Invitation created, but server returned errors.',
        );
        if (graphQLErrorMessage === 'Invitation created, but delivery status was not provided by server.') {
          info({ message: graphQLErrorMessage });
        } else {
          error({ message: graphQLErrorMessage });
        }
        return;
      }

      if (statusNormalized === 'sent') {
        onInviteSuccess?.(email.trim(), effectiveInviteRole);
        onParticipantsRefresh?.();
        success({ message: 'Invitation sent successfully.' });
      } else if (statusNormalized === 'queued') {
        onInviteSuccess?.(email.trim(), effectiveInviteRole);
        onParticipantsRefresh?.();
        warning({ message: 'Invitation created. Email delivery is queued and will be retried by server.' });
      } else if (statusNormalized === 'failed') {
        error({ message: deliveryFailureReason || 'Invitation created, but email delivery failed.' });
      } else {
        info({ message: 'Invitation created, but delivery status was not provided by server.' });
      }

      setTimeout(() => {
        setEmail('');
        setInviteRole('buyer_agent');
        setIsEmailValid(true);
        close();
      }, 120);
    } catch (err: any) {
      console.error('[InviteUserModal][DeliveryDebug][Error]', {
        path: effectiveInviteRole === 'buyer_agent' ? 'createExternalParticipant' : 'add_participant_to_thread',
        threadId,
        targetEmail: email.trim(),
        role: effectiveInviteRole,
        error: err?.response?.data || err,
      });
      const extractedMessage = extractErrorMessage(err);
      const normalizedMessage = extractedMessage.toLowerCase();
      if (
        normalizedMessage.includes('duplicate') ||
        normalizedMessage.includes('already invited') ||
        normalizedMessage.includes('already exists')
      ) {
        error({ message: 'This user is already invited to this chat.' });
      } else if (normalizedMessage.includes('expired')) {
        error({ message: 'This invite has expired. Please send a new invite.' });
      } else {
        error({ message: extractedMessage });
      }
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
