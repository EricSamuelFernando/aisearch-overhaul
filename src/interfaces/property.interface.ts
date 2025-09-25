import { PropertyDetails } from '@/types/property.types';
import { MlsPropertyListing } from './mls-data.interface';

export interface IPropertyAddressDetails {
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
  year?: string;
  price?: number;
  bedroom?: number;
  bathroom?: number;
  propertyDescription?: string;
  propertyName?: string;
  ownerDetails?: string;
  propertyDocument?: any;
  videos?: any;
  brokers?: any;
}

export interface IPropertyListing {
  propertyAddressDetails?: Partial<IPropertyAddressDetails>;
  seller?: string;
}

export interface ImageInterface {
  url: string;
  thumbNail: string;
  _id?: string;
}

interface Video {
  url: string;
  thumbNail: string;
  _id?: string;
}

export interface IPropertyAgent {
  _id: string;
  firstname: string;
  lastname: string;
}

export interface PropertyDocument {
  name: string;
  url: string;
  _id?: string;
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
  _id?: string;
}

interface PropertyTax {
  amount: number;
  currency: string;
  dateSeen: string[];
  _id: string;
}

interface Price {
  amount: number;
  currency: string;
}

interface Status {
  status: string;
  eventTime: string;
  _id: string;
}

export interface ISeller {
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
  mobile: {
    number_body: string;
    mobile_extension: string;
    raw_mobile: string;
    _id: string;
  };
  token_expiry_time: string;
  verification_code: string;
  stripe_customer_id: string;
  preApproval: true;
  preApprovalDocument: {
    url: string;
    expiryDate: string;
  };
}

export interface IProperty {
  _id: string;
  propertyAddressDetails: IPropertyAddressDetails;
  images: ImageInterface[];
  videos: Video[];
  listed: boolean;
  listingid:string;
  listingId:string;
  mls_data:{
    data:{
      property:{
        bathroomsTotal:number|string,
        bedroomsTotal: number|string,
        livingArea: number | string,
        lotSizeSquareFeet : number | string,
        hoa: string,
        
      },
      publicRemarks:string
    }
  };
  propertyName: string;
  currentStatus: string;
  seller: ISeller;
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
  year?: string;
  longitude: string;
  latitude: string;
  price: Price;
  yearBuild: number | string;
  propertyType: string;
  propertyDescription: string;
  propertyStatus: string;
  buyerAgent: IPropertyAgent;
  sellerAgent: IPropertyAgent;
  percentageCompleted?: number;
  public:any;
}

export interface ITours extends IProperty {
  tourDate: string;
}

export interface ApiResponse<T> {
  result: T[];
  total: number;
  page: string;
  limit: string;
  tours?: T[];
}

export interface ApiNewResponse<T> {
  result: { result: T[] };
  total: number;
  page: string;
  limit: string;
  tours?: T[];
}
export interface IPropertiesResponse {
  result: IProperty[];
  total: number;
  page: string;
  limit: string;
}

export interface InvitePayload {
  inviteId: string;
  response: string;
}

export interface ISingleProperty {
  property: IProperty;
  message?: string;
  data?: PropertyDetails;
}

export interface AgentInvitesResponse {
  _id: string;
  currentStatus: string; // cast to accurate status
  email: string;
  inviteAccountType: string;
  invitedBy: {
    _id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    account_type: string; // TODO: cast correct types
    firstname: string;
    fullname: string;
    lastname: string;
    mobile: {
      number_body: string;
      mobile_extension: string;
      raw_mobile: string;
      _id: string;
    };
    token_expiry_time: string;
    verification_code: string;
    stripe_customer_id: string;
    preApproval: boolean;
    preApprovalDocument: {
      url: string;
      expiryDate: string;
    };
  };
  property: {
    _id: string;
    propertyAddressDetails: IPropertyAddressDetails;
    listed: boolean;
    propertyName: string;
    currentStatus: string;
    seller: string;
    sellerAgentAcceptance: boolean;
    buyerAgentAcceptance: boolean;
    images: [];
    videos: [];
    propertyDocument: [];
    brokers: [];
    features: [];
    propertyTaxes: [];
    status: [];
    createdAt: string;
    updatedAt: string;
  };
  agent: string;
  status: [];
  createdAt: string;
  updatedAt: string;
}

interface PropertyAddressDetails {
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
  _id?: string;
}

interface Video {
  url: string;
  thumbNail: string;
  _id?: string;
}

interface Document {
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
  _id?: string;
}

interface PropertyTax {
  amount: number;
  currency: string;
  dateSeen: string[];
  _id: string;
}

interface Property {
  _id: string;
  propertyAddressDetails: PropertyAddressDetails;
  images: Image[];
  videos: Video[];
  listed: boolean;
  propertyName: string;
  currentStatus: string;
  seller: string;
  sellerAgentAcceptance: boolean;
  buyerAgentAcceptance: boolean;
  propertyDocument: Document[];
  brokers: Broker[];
  features: Feature[];
  propertyTaxes: PropertyTax[];
  status: any[];
  createdAt: string;
  updatedAt: string;
  lotSizeUnit: string;
  lotSizeValue: string;
  numBathroom: string;
  numBedroom: string;
  price: {
    amount: number;
    currency: string;
  };
  propertyType: string;
  sellerAgent: string;
  buyerAgent: string;
}

interface Mobile {
  number_body: string;
  mobile_extension: string;
  raw_mobile: string;
  _id: string;
}

interface PreApprovalDocument {
  url: string;
  expiryDate: string;
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
  preApprovalDocument: PreApprovalDocument;
}

interface Seller extends Buyer {}

interface Agent {
  image: string | undefined;
  connectedUsers: {
    default: any[];
  };
  completedOnboarding: boolean;
  _id: string;
  email: string;
  verification_code: string;
  token_expiry_time: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  firstname: string;
  fullname: string;
  lastname: string;
  licence_number: string;
  mobile: Mobile;
  region: string;
}

interface FinanceContingency {
  amount: string;
  unit: string;
}

interface InspectionContingency extends FinanceContingency {}

interface OfferPrice {
  amount: number;
  currency: string;
}

interface Money {
  amount: number;
  currency: string;
}

export interface AgentOfferResponse {
  agentApproval: boolean;
  agentApprovalDate: string | null;
  _id: string;
  currentStatus: string;
  financeType: string;
  offerCreator: string;
  apprasalContingency: boolean;
  financeContingency: FinanceContingency;
  inspectionContingency: InspectionContingency;
  closeEscrow: boolean;
  offerPrice: OfferPrice;
  downPayment: Money;
  loanAmount: Money;
  submitWithOutAgentApproval: boolean;
  property: Property;
  buyer: Buyer;
  seller: Seller;
  sellerAgent: Agent;
  buyerAgent: Agent;
  status: any[];
  createdAt: string;
  updatedAt: string;
  documents: any[];
  offerCommentCount: number;
}

export interface DocumentSummaryRequest {
  key: string;
  summary_version: string;
  summary_type: string;
}

export interface DocumentSummaryResponse {
  text: string;
  message: string;
  status: boolean;
}

export interface DocumentResponse {
  _id: string;
  userOrAgent: string;
  userOrAgentModel: string;
  property: string;
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  downloadUrl?: string;
  key?: string;
}

export interface SellerAgent {
  _id: string;
  email: string;
  connectedUsers: string[];
  verification_code: string;
  token_expiry_time: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  firstname: string;
  fullname: string;
  lastname: string;
  licence_number: string;
  mobile: {
    number_body: string;
    mobile_extension: string;
    raw_mobile: string;
  };
  region: string;
  completedOnboarding: boolean;
}

export interface SellerSide {
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
  mobile: {
    number_body: string;
    mobile_extension: string;
    raw_mobile: string;
    _id: string;
  };
  token_expiry_time: string;
  verification_code: string;
  stripe_customer_id: string;
  preApproval: boolean;
  preApprovalDocument: {
    url: string;
    expiryDate: string;
  };
  propertyPreference: {
    propertyType: string;
    onboardingCompleted: boolean;
    financialProcess: string;
    preApprovalAffiliates: boolean;
    workWithLender: boolean;
  };
}

export interface DocumentShareItem {
  _id: string;
  role: string;
  name: string;
  email: string;
  message: string;
  property: IProperty;
  seller: Seller;
  sellerAgent: SellerAgent;
  createdAt: string;
  updatedAt: string;
  __v: number;
  images: [];
}

export interface PropertyListResponse {
  documentsShareList: DocumentShareItem[];
}
export interface UnifiedLandingPropertiesType<T> {
  data: T;
  type: T extends IProperty ? 'property' : 'mls';
}

export type LandingPropertyListings = (
  | UnifiedLandingPropertiesType<IProperty>
  | UnifiedLandingPropertiesType<MlsPropertyListing>
)[];

export type LandingPropertyListingShuffledSet =
  | UnifiedLandingPropertiesType<IProperty>
  | UnifiedLandingPropertiesType<MlsPropertyListing>;
