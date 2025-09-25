export interface AddressType {
    streetAddress1: string;
    streetAddress2: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
export interface FormData {
    maximumValue: string;
    minimumValue: string;
    propertyType: string;
    ownerType: string;
    currentAddress: AddressType;
    sellCurrentHome: string;
  }