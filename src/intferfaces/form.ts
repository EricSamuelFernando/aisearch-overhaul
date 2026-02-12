export interface SignInFormValues {
  email: string;
  password: string;
  isBack?: boolean;
  isHome?: boolean;
  isFirstLogin?: boolean;
}

export interface SignUpFormValues {
  email: string;
}

export interface SendVerificationCode {
  email: string;
  account_type: string;
}

export interface VerifyEmail {
  email: string;
}
export interface UpdatePassword {
  password: string;
}
export interface VerifyCode {
  code: string;
  email?: string;
}


export interface CreateAnswerInput {
  id?: number; // Optional field
  processId: number;
  stepId: number;
  questionId: number;
  userId: string;
  response: Record<string, any>; // A flexible key-value pair object for the response
}
