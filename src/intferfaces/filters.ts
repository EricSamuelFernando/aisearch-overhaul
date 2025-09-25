export interface onBoardingQuery {
  mobile_extension: string;
  mobile: string;
  number_body: string;
  firstname: string;
  lastname: string;
  account_type: string;
  password: string;
  email: string;
}

export type FilterType<T> = {
  field: keyof T;
  value: string | number;
};
