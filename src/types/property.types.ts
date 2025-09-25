import { ImageInterface } from '@/interfaces/property.interface';

export type PropertyView = 'map' | 'grid';

export type PropertyAddressDetails = {
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
};

// export type PropertyDetails = {
//   propertyAddressDetails: Partial<PropertyAddressDetails>
//   latitude: string
//   longitude: string
//   placeId: string
//   streetNumber: string
//   streetName: string
//   city: string
//   province: string
//   state: string
//   postalCode: string
//   country: string
//   lotSize?: number
//   images?: Partial<ImageInterface>[]
// }
export type PropertyDetails = {
  propertyAddressDetails: {
    formattedAddress: any;
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

    //TODO added these types just so the build passes, need to rewrite
    propertyDocument?: any;
    videos?: any;
    brokers?: any;
    features?: any;
    price?: any;
    propertyTaxes?: any;
    propertyType?: any;
    propertyDescription?: string;
  };
  _id: string;
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
  lotSizeValue?: number | string;
  lotSizeUnit?: number | string;
  numBathroom?: number;
  numBedroom?: number;
  images?: {
    url: string;
    thumbNail: string;
  }[];
};

// {
//     "propertyAddressDetails": {
//         "formattedAddress": "711 Kent Ave",
//         "latitude": "39.284462",
//         "longitude": "-76.734069",
//         "placeId": "ChIJ__8v5VwCyIkRTgVx3TbjHN4",
//         "streetNumber": "711",
//         "streetName": "Kent Ave",
//         "city": "Catonsville",
//         "province": "Maryland",
//         "state": "MD",
//         "postalCode": "21228",
//         "country": "United States"
//     },
//   "images": [
//         {
//             "url": "image1.jpg",
//             "thumbNail": "urls.com"
//         }
//     ],
//     "videos": [
//           {
//             "url": "image1.jpg",
//             "thumbNail": "urls.com"
//         }
//     ],
//     "propertyDocument": [
//         {
//             "name": "Document1",
//             "url": "https://example.com/document1"
//         },
//         {
//             "name": "Document2",
//             "url": "https://example.com/document2"
//         }
//     ],
//     "brokers": [
//         {
//             "agent": "65b335cbf5ed5bf50790a6c8",
//             "role": "Listing Agent"
//         },
//         {
//             "agent": "65b335cbf5ed5bf50790a6c8",
//             "role": "Co-Agent"
//         }
//     ],
//     "features": [
//         {
//             "feature": "Feature1",
//             "icon": "icon",
//             "description": ""
//         }
//     ],
//     "lotSizeValue": "0.16",
//     "lotSizeUnit": "Acres",
//     "numBathroom": "2",
//     "numBedroom": "4",
//    "price": {
//         "amount": 199900,
//         "currency": "USD"
//     },
//     "propertyTaxes": [
//         {
//             "amount": 3195,
//             "currency": "USD",
//             "dateSeen": [
//                 "2024-02-13T21:24:57.593Z"
//             ]
//         },
//         {
//             "amount": 4509,
//             "currency": "USD",
//             "dateSeen": [
//                 "2024-01-13T21:24:57.593Z"
//             ]
//         }
//     ],
//     "propertyType": "Single Family Dwelling"
// }

export type PropertyDetailsPayload = {
  propertyAddressDetails: PropertyAddressDetails;
};

export type GeolocationResultType = {
  address_components: [
    {
      long_name: string;
      short_name: string;
      types: string[];
    },
    {
      long_name: string;
      short_name: string;
      types: string[];
    },
    {
      long_name: string;
      short_name: string;
      types: string[];
    },
  ];
  formatted_address: string;
  geometry: {
    bounds: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
    location: {
      lat: string;
      lng: string;
    };
    location_type: string;
    viewport: {
      south: number;
      west: number;
      north: number;
      east: number;
    };
  };
  place_id: string;
  types: string[];
};

export type PropertyOfferType = {
  property: string;
  financeType: string;
  apprasalContingency: boolean;
  financeContingency: {
    amount: string;
    unit: string;
  };
  appraisalContigency: {
    amount: string;
    unit: string;
  };
  coverLetter: string;
  documents: {
    name: string;
    url: string;
  }[];
  inspectionContingency: {
    amount: string;
    unit: string;
  };
  closeEscrow: boolean;
  offerPrice: {
    amount: number;
    currency: string;
  };
  downPayment: {
    amount: number;
    currency: string;
  };
  loanAmount: {
    amount: number;
    currency: string;
  };
  buyerAgent: string;
  submitWithOutAgentApproval: boolean;
};

interface Contingency {
  amount: number;
  unit: 'loan' | 'cash' | 'contingent' | 'non-contingent' | 'FHA-VA loan' | 'days' | 'wavied' ;
}

interface CurrencyAmount {
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
}

export type OfferRequest = {
  property: string;
  financeType: 'loan' | 'cash';
  apprasalContingency: Contingency;
  financeContingency: Contingency;
  coverLetter: string;
  inspectionContingency: Contingency;
  closeEscrow: Contingency;
  offerPrice: CurrencyAmount;
  downPayment: CurrencyAmount;
  loanAmount: CurrencyAmount;
  buyerAgent: string;
  submitWithOutAgentApproval: boolean;
  specialTerms: string;
  documents: string[] | Document[];
};

export type PropertySearchQuery = {
  page?: number;
  limit?: number;
  search?: string | null;
  priceMin?: number;
  priceMax?: number;
  sqTfMin?: number;
  sqTfMax?: number;
  bedRooms?: number;
  bathRooms?: number;
  features?: string;
};

export enum BuyerPurchaseProcessSteps {
  FINANCIAL = 'financial-process',
  PRE_APPROVAL_AFFILIATES = 'options',
  PRE_APPROVAL_UPLOAD = 'pre-approved',
  UPLOAD_POF = 'cash',
  PRE_APPROVAL_LENDER = 'loan',
  ADD_AGENT = 'add-agent',
  GUIDED_TRANSACTION = 'guided-transactions',
}

export type SellerAnalytics = {
  message: string;
  data: {
    totalValue: number;
    totalCount: number;
    averageOfferGrowth: {
      percentageChange: number;
      currentTotal: number;
      previousTotal: number;
    };
  };
};
