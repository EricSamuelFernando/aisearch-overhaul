/**
 * Email Notification Service
 * Handles sending email notifications for agent invitations and transaction updates
 */

interface AgentInvitationEmailPayload {
  agentEmail: string;
  agentName?: string;
  buyerName: string;
  buyerEmail: string;
  propertyAddress: string;
  propertyImage?: string;
  invitationStatus: 'NEGOTIATION_PENDING' | 'OFFER_SENT' | 'ACTIVE';
  participantId?: string;
  socket?: any;
}

interface NotificationEmailPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  templateType: 'agent_invitation' | 'negotiation_update' | 'tier_selected';
  templateData: Record<string, any>;
  socket?: any;
}

/**
 * Send agent invitation email notification
 */
export const sendAgentInvitationEmail = async (
  payload: AgentInvitationEmailPayload
): Promise<boolean> => {
  try {
    const { socket, agentEmail, buyerName, buyerEmail, propertyAddress, propertyImage, invitationStatus, agentName } = payload;

    // Prepare email data
    const emailData = {
      agentEmail,
      agentName: agentName || 'Agent',
      buyerName,
      buyerEmail,
      propertyAddress,
      propertyImage,
      invitationStatus,
      timestamp: new Date().toISOString(),
      acceptInvitationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/dashboard/invitations`,
    };

    // Option 1: Send via socket event (real-time, if backend supports)
    if (socket && socket.connected) {
      socket.emit('send_agent_invitation_email', emailData, (response: any) => {
        if (response?.success) {
          console.log('[Email Notification] Agent invitation email sent successfully');
        } else {
          console.warn('[Email Notification] Socket email delivery failed:', response?.message);
        }
      });
      return true;
    }

    // Option 2: Send via REST API endpoint (fallback)
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateType: 'agent_invitation',
        recipientEmail: agentEmail,
        templateData: emailData,
      }),
    });

    if (!response.ok) {
      console.warn('[Email Notification] REST API email delivery failed:', response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('[Email Notification] Agent invitation email sent via API:', data);
    return data.success || false;
  } catch (error) {
    console.error('[Email Notification] Error sending agent invitation email:', error);
    return false;
  }
};

/**
 * Send negotiation update email notification
 */
export const sendNegotiationUpdateEmail = async (
  agentEmail: string,
  buyerName: string,
  propertyAddress: string,
  tierName: string,
  commission: number,
  socket?: any
): Promise<boolean> => {
  try {
    const emailData = {
      agentEmail,
      buyerName,
      propertyAddress,
      tierName,
      commission,
      updateType: 'tier_selected',
      timestamp: new Date().toISOString(),
      respondUrl: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/dashboard/negotiations`,
    };

    // Send via socket
    if (socket && socket.connected) {
      socket.emit('send_negotiation_update_email', emailData, (response: any) => {
        if (response?.success) {
          console.log('[Email Notification] Negotiation update email sent successfully');
        }
      });
      return true;
    }

    // Fallback to REST API
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'negotiation_update',
        recipientEmail: agentEmail,
        templateData: emailData,
      }),
    });

    return (await response.json()).success || false;
  } catch (error) {
    console.error('[Email Notification] Error sending negotiation update email:', error);
    return false;
  }
};

/**
 * Send buyer notification email
 */
export const sendBuyerNotificationEmail = async (
  buyerEmail: string,
  buyerName: string,
  agentName: string,
  propertyAddress: string,
  notificationType: 'invitation_sent' | 'tier_selected' | 'negotiation_started',
  socket?: any
): Promise<boolean> => {
  try {
    const emailData = {
      buyerEmail,
      buyerName,
      agentName,
      propertyAddress,
      notificationType,
      timestamp: new Date().toISOString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/dashboard/chat`,
    };

    // Send via socket
    if (socket && socket.connected) {
      socket.emit('send_buyer_notification_email', emailData);
      return true;
    }

    // Fallback to REST API
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'buyer_notification',
        recipientEmail: buyerEmail,
        templateData: emailData,
      }),
    });

    return (await response.json()).success || false;
  } catch (error) {
    console.error('[Email Notification] Error sending buyer notification email:', error);
    return false;
  }
};

export default {
  sendAgentInvitationEmail,
  sendNegotiationUpdateEmail,
  sendBuyerNotificationEmail,
};
