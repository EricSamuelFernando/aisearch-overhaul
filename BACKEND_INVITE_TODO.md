# Backend TODO - Chat Invite/Participants

This is the backend checklist for the frontend invite + invited-users features currently implemented.

## 1) Save role selected in "Invite as"
- Update invite mutation to accept role:
  - `buyer_agent`
  - `co_buyer`
  - `family_friends`
- Persist role with invite record.
- Return role in invite mutation response.

## 2) Return invited users per thread (authoritative list)
- Add/extend query to return all invitees for a thread, not only accepted participants.
- Each invitee entry should include:
  - `id`
  - `threadId`
  - `email`
  - `firstName`
  - `lastName`
  - `role`
  - `status` (`pending`, `accepted`, `declined`, `expired`)
  - `invitedAt` / `createdAt`
  - `acceptedAt` (optional)
  - `declinedAt` (optional)
- Include this in `getUserThreadById` (or provide a dedicated query).

## 3) Invitation status lifecycle
- Define and enforce canonical status transitions:
  - `pending -> accepted`
  - `pending -> declined`
  - `pending -> expired` (after 10 days)
- Ensure expired is computed server-side (cron/job or query-time computation).

## 4) Max participant limit enforcement (5 accepted users)
- Enforce on backend (not just frontend):
  - If accepted participants for thread is `>= 5`, reject new invite creation.
- Return clear error message so frontend can display:
  - "Maximum people allowed in this chat is 5."
- Optional: prevent accepting pending invites once limit is reached.

## 5) Family/Friends permission model
- If role is `family_friends`, enforce read-only access on backend:
  - no send message
  - no upload/modify operations 
- Expose permission flags in participant/invite payload so UI can display access type.

## 6) Historical invite retention
- Ensure old invites (sent before frontend changes) are queryable.
- Backfill/migration if prior records are missing role/status timestamps.

## 7) WebSocket/event updates (optional but recommended)
- Emit real-time events on invite create/update/accept/decline/expire.
- Payload should include threadId + updated invitee object so frontend can update without polling.

## 8) API contract update
- Document GraphQL schema changes for:
  - invite mutation input/output
  - thread detail query fields
  - status enum values
- Version or rollout safely to avoid breaking existing clients.

## Suggested GraphQL shape (example)
- Mutation:
  - `add_participant_to_thread(threadId: String!, email: String!, role: InviteRole!)`
- Query field under thread:
  - `invites { id email firstName lastName role status invitedAt acceptedAt declinedAt }`
