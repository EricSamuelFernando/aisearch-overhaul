import { atomWithStorage } from 'jotai/utils'

export interface AgentState {
  last_updated: number;
  is_authenticated: boolean;
  user: Agent | undefined;
  agentType?: string;
  contextId?:string;
}

export type Agent = {
  id: string
  firstName: string
  lastName: string
  fullname?: string
  profile?: string
  region?: string
  zipCode?: string
  address?: string
  phoneNumber?:string
  licenseNumber?:string
  bio?:string
  email?:string
  agentType: 'seller_agent' | 'buyer_agent'
  licence_number: string
}

export const initialState: AgentState = {
  last_updated: Date.now(),
  is_authenticated: false,
  user: undefined // Provide a default value, e.g., 'buyer_agent' or 'seller_agent'
}

export const agentAtom = atomWithStorage<AgentState>('AgentDetails', {
  ...initialState
})

import { atom } from 'jotai'

// Read-write atom for AgentState
export const agentReadWriteAtom = atom(
  (get) => get(agentAtom), // Read function
  (get, set, update: Partial<AgentState>) => {
    const currentState = get(agentAtom)
    const newState = {
      ...currentState,
      ...update,
      last_updated: Date.now()
    }
    set(agentAtom, newState)
  }
)
