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

interface Image {
  url: string;
  thumbNail: string;
  _id: string;
}

interface Video {
  url: string;
  thumbNail: string;
  _id: string;
}

interface PropertyDocument {
  name: string;
  url: string;
  _id: string;
}

interface Broker {
  agent: string;
  role: string;
  _id: string;
}

interface Feature {
  feature: string;
  icon: string;
  description: string;
  _id: string;
}

interface PropertyTax {
  amount: number;
  currency: string;
  dateSeen: string[];
  _id: string;
}

interface Status {
  status: string;
  eventTime: string;
  _id: string;
}

interface Price {
  amount: number;
  currency: string;
}

interface PropertyOwnershipDetails {
  nameOnProperty: string;
  email: string;
  actionTime: string;
  _id: string;
}

interface Property {
  _id: string;
  propertyAddressDetails: AddressDetails;
  images: Image[];
  videos: Video[];
  listed: boolean;
  propertyName: string;
  currentStatus: string;
  seller: string;
  sellerAgentAcceptance: boolean;
  buyerAgentAcceptance: boolean;
  propertyDocument: PropertyDocument[];
  brokers: Broker[];
  features: Feature[];
  propertyTaxes: PropertyTax[];
  status: Status[];
  createdAt: string;
  updatedAt: string;
  lotSizeUnit: string;
  lotSizeValue: string;
  numBathroom: string;
  numBedroom: string;
  price: Price;
  propertyType: string;
  sellerAgent: string;
  buyerAgent: string;
  propertyDescription: string;
  propertyOwnershipDetails: PropertyOwnershipDetails;
}

interface Mobile {
  number_body: string;
  mobile_extension: string;
  raw_mobile: string;
  _id: string;
}

interface User {
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
  preApprovalDocument: {
    url: string;
    expiryDate: string;
  };
}

interface EventDate {
  eventDate: string;
  tourTime: string;
  _id: string;
}

export interface ITour {
  id: string | null;
  _id: string;
  property: Property;
  buyer: User;
  seller: User;
  sellerAgent: string;
  fullName: string;
  eventDate: EventDate[];
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
