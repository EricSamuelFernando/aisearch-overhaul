import { atom } from 'jotai';

import { atomWithStorage } from 'jotai/utils';

const propertyDetailsAtom = atomWithStorage('selectedProperty', null);
const agentType = atom('');
const agentEmailAtom = atom('');
const loginAtom = atom({});

type PropertyFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  status?: 'forSale' | 'forRent' | 'sold';
  amenities?: string[];
  sortBy?: 'priceAsc' | 'priceDesc' | 'newest';
};

type Message = {
  id:string;
  isRead?: boolean;
  fileType?: string;
  messageType?: string;
  senderId?: string;
  receiverId?: string;
  threadId: string;
  message: string;
  createdAt: string;
};

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type MessageThread = {
  id: string;
  threadName: string;
  propertyId: string;
  roomId: string;
  propertyName: string;
  listingId: string;
  propertyAddress: string;
  messages: Message[];
  unreadCount: number;
  participants: Participant[];
  user: Participant;
  parentMessage: string;
  buyerAgent: Participant;
};

const filterAtom = atomWithStorage<PropertyFilters>('propertyFilters', {});
const messageThreadsAtom = atomWithStorage<MessageThread[]>('messageThreads', []);

export { 
    agentType, 
    agentEmailAtom, 
    propertyDetailsAtom, 
    loginAtom,
    filterAtom,
    messageThreadsAtom
};
