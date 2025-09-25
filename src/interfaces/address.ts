import {
  IPropertyAddressDetails,
  ImageInterface,
  PropertyDocument,
} from '@/interfaces/property.interface';

export interface AddressProperty {
  propertyAddressDetails: Partial<IPropertyAddressDetails>;
  images: Partial<ImageInterface>[]; // Assuming these are URLs
  propertyDocument: Partial<PropertyDocument>[];
  propertyName: string;
  longitude: number;
  latitude: number;
  numBathroom: number;
  numBedroom: number;
  price: {
    amount: number;
    currency: string;
  };
  yearBuild: string;
  propertyType: string;
  propertyDescription: string;
}
