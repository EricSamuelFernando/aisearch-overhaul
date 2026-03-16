interface AddressDetails {
  formattedAddress: string;
  latitude: string;
  longitude: string;
  placeId: string;
  streetNumber: string;
  streetName: string;
  city: string;
  province: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Status {
  status: string;
  eventTime: string;
  _id: string;
}

interface Image {
  url: string;
  _id: string;
}

interface Video {
  url: string;
  _id: string;
}

interface Feature {
  feature: string;
  icon: string;
  description: string;
  _id: string;
}

interface Property {
  _id: string;
  propertyAddressDetails: AddressDetails;
  listed: boolean;
  propertyName: string;
  currentStatus: string;
  seller: string;
  sellerAgentAcceptance: boolean;
  buyerAgentAcceptance: boolean;
  images: Image[];
  videos: Video[];
  propertyDocument: any[];
  brokers: any[];
  features: Feature[];
  propertyTaxes: any[];
  status: Status[];
  createdAt: string;
  updatedAt: string;
  sellerAgent: string;
  buyerAgent: string;
  viewsCounter: number;
}

interface Agent {
  _id: string;
  profile_image_url?: string;
  profile?:string;
  firstname: string;
  fullname: string;
  lastname: string;
  licence_number: string;
  email: string;
}

interface Chat {
  _id: string;
  propertyCount: number;
  properties: Property[];
  agent: Agent;
}

interface ChatsData {
  chats: Chat[];
}

interface Message {
  _id: string;
  content?: string;
  message?:string
  sender?:string;
  threadId?: string;
  documents: string[];
  user?:{
    userName?:string;

  }
  property?:{
    propertyName?:string;
    
  }
  senderType: string;
  timestamp: string;
  createdAt?:string | number | Date;
}

interface MessagesResponse {
  message: string;

  chats: Message[];
}
