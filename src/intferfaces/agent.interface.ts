export interface Agent {
  profile_image_url?: string;
  connectedUsers: {
    default: any[];
  };
  completedOnboarding: boolean;
  _id: string;
  email: string;
  verification_code: string;
  token_expiry_time: Date | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  firstname: string;
  fullname: string;
  lastname: string;
  licence_number: string;
  mobile: {
    number_body: string;
    mobile_extension: string;
    raw_mobile: string;
    _id: string;
  };
  region: string;
}

export interface IAgentResponse {
  result: Agent[];
  total: number;
  page: number;
  limit: number;
}
