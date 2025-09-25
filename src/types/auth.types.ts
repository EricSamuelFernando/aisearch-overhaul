export type OnboardingPayload = {
  mobile: {
    number_body: string;
    mobile_extension: string;
    raw_mobile: string;
  };
  region?: string;
  licence_number?: string;
  zipCode?:string;
  firstname: string;
  lastname: string;
  account_type?: string;
  password: string;
  avatar?: string;
};
