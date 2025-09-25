export interface IPropertyPreference {
  propertyType: string;
  spendAmount: {
    min: number;
    max: number;
  } | null;
  financialProcess: string;
  preApprovalAffiliates: boolean;
  workWithLender: boolean;
  rangeText?: string;
  onboardingCompleted: boolean;
  preferredPropertyAddress?: string;
  searchCount:number;
  tempUserId:string;
}
