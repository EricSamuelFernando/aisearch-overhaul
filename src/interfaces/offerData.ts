interface IOfferData {
  _id: string;
  currentStatus: string;
  coverLetter: string;
  specialTerms: string;
  financeType: 'loan' | 'cash';
  offerCreator: string;
  apprasalContingency: Contingency;
  financeContingency: Contingency;
  inspectionContingency: Contingency;
  closeEscrow: Contingency;
  offerPrice: Amount;
  downPayment: Amount;
  loanAmount: Amount;
  documents: Document[] | any;
  submitWithOutAgentApproval: boolean;
  agentApproval: boolean;
  offerType: string;
  agentApprovalDate: string | null;
  property: Property;
  buyer: Buyer;
  counterOffer: any | null;
  seller: string;
  sellerAgent: Agent;
  buyerAgent: Agent;
  buyerAgentAcceptance: string;
  status: Status[];
  coBuyers: any[];
  createdAt: string;
  updatedAt: string;
}

interface PropertyOfferResponse {
  message: string;
  data: IOfferData;
}

interface Contingency {
  amount: number;
  unit:'loan' | 'cash' | 'contingent' | 'non-contingent' | 'FHA-VA loan' | 'days' | 'wavied'
}

interface Amount {
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
}

interface Property {
  _id: string;
  propertyAddressDetails: AddressDetails;
  isDeleted: boolean;
  images: Image[]; // Define specific type if needed
  videos: Video[]; // Define specific type if needed
  latitude: string;
  listed: boolean;
  propertyName: string;
  propertyDescription: string;
  currentStatus: string;
  longitude: string;
  lotSizeValue: string;
  lotSizeUnit: string;
  numBathroom: string;
  numBedroom: string;
  price: Amount;
  propertyTaxes: any[]; // Define specific type if needed
  propertyType: string;
  seller: string; // Define specific type if needed
  sellerAgentAcceptance: boolean;
  buyerAgentAcceptance: boolean;
  viewsCounter: number;
  shareCounter: number;
  brokers: any[]; // Define specific type if needed
  features: Feature[]; // Define specific type if needed
  status: Status[];
  createdAt: string;
  updatedAt: string;
  propertyOwnershipDetails: OwnershipDetails;
  sellerAgent: string; // Define specific type if needed
  buyerAgent: string;
}

interface AddressDetails {
  formattedAddress: string;
  placeId: string;
  streetNumber: string;
  streetName: string;
  city: string;
  province: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OwnershipDetails {
  nameOnProperty: string;
  email: string;
  actionTime: string;
  _id: string;
}

interface Status {
  status: string;
  eventTime: string;
  _id: string;
}

interface Buyer {
  _id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  account_type: string;
  firstname: string;
  fullname: string;
  lastname: string;
  mobile: Mobile;
  token_expiry_time: string;
  verification_code: string;
  stripe_customer_id: string;
  preApproval: boolean;
  preApprovalDocument: Document;
  propertyPreference: PropertyPreference;
}

interface Mobile {
  number_body: string | number;
  mobile_extension: string;
  raw_mobile: string;
  _id?: string;
}

interface Document {
  url: string;
  expiryDate: string;
}

interface PropertyPreference {
  propertyType: string;
  onboardingCompleted: boolean;
  spendAmount: SpendAmount;
  financialProcess: string;
  preApprovalAffiliates: boolean;
  workWithLender: any | null; // Define specific type if needed
}

interface SpendAmount {
  max: number;
  min: number;
}

interface Agent {
  id: string;
  profile_image_url?: string;
  email: string;
  connectedUsers: any[]; // Define specific type if needed
  verification_code: string;
  token_expiry_time: string | null;
  completedOnboarding: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  firstName: string;
  fullName: string;
  phone?:string;
  lastName: string;
  licence_number: string;
  mobile: Mobile;
  region: string;
}
