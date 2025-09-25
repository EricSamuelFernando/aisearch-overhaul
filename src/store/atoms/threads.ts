import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type Message = {
  threadId: string
  isRead: boolean
  message: string
}

export type Participant = {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
}

export type BuyerAgent = {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface MessageThread {
  id: string
  threadName: string
  propertyId: string
  roomId: string
  propertyName: string
  listingId: string
  propertyAddress: string
  messages: Message[]
  unreadCount: number
  participants: Participant[]
  user: User
  parentMessage: string
  buyerAgent: BuyerAgent
}

export interface ThreadState {
  messageThread: MessageThread[] | undefined
  conversationThreads: MessageThread[] | undefined
}

export const initialState: ThreadState = {
  messageThread: undefined,
  conversationThreads: undefined,
}

export const threadAtom = atomWithStorage<ThreadState>('ThreadDetails', {
  ...initialState,
})

export const threadReadWriteAtom = atom(
  (get) => get(threadAtom),
  (get, set, update: Partial<ThreadState>) => {
    const currentState = get(threadAtom)
    const newState = {
      ...currentState,
      ...update,
    }
    set(threadAtom, newState)
  }
)
