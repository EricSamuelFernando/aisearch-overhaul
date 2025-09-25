import { useState, ChangeEvent } from 'react';
import { Title, TextInput, Group, Button, Progress } from '@mantine/core';
import { FileInput as CustomFileInput } from '@components/ui/FileInput'; // adjust path


type Props = {
  formData: any;
  handleChange: any;
  handleFileChange:any;
  subSteps:any;
};



export default function EmployerContactInformation({ formData, handleChange, handleFileChange , subSteps }: Props) {
  const [activeSubStep, setActiveSubStep] = useState(0);

  const next = () => setActiveSubStep((curr) => Math.min(curr + 1, subSteps.length - 1));
  const prev = () => setActiveSubStep((curr) => Math.max(curr - 1, 0));

  return (
    <>
      <Title order={4} className="mb-4">{subSteps[activeSubStep]}</Title>

      <Progress
        value={((activeSubStep + 1) / subSteps.length) * 100}
        size={6}
        mb={24}
        color="ocOrange"
        radius={0}
      />

      {activeSubStep === 0 && (
        <>
          <TextInput
            label="Employer Name"
            placeholder="Enter Employer Name"
            value={formData.employerName}
            onChange={handleChange('employerName')}
            classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
          />
          <TextInput
            label="Employer Phone Number"
            placeholder="Enter Employer Phone Number"
            value={formData.employerPhone}
            onChange={handleChange('employerPhone')}
            classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
          />
          <CustomFileInput
            label="Employment Verification Letter"
            file={formData.employmentVerificationLetter}
            onFileChange={handleFileChange('employmentVerificationLetter')}
          />
        </>
      )}

      {activeSubStep === 1 && (
        <>
          <CustomFileInput
            label="Pay Stubs (Last 30–60 days)"
            file={formData.payStubs}
            onFileChange={handleFileChange('payStubs')}
          />
          <CustomFileInput
            label="W-2 Forms (Last 2 years)"
            file={formData.w2Forms}
            onFileChange={handleFileChange('w2Forms')}
          />
          <CustomFileInput
            label="Tax Returns (Full returns for last 2 years)"
            file={formData.taxReturns}
            onFileChange={handleFileChange('taxReturns')}
          />
          <CustomFileInput
            label="Profit and Loss Statements (Year-to-date and balance sheet)"
            file={formData.pAndLStatements}
            onFileChange={handleFileChange('pAndLStatements')}
          />
          <CustomFileInput
            label="Rental Income Documentation"
            file={formData.rentalIncomeDocs}
            onFileChange={handleFileChange('rentalIncomeDocs')}
          />
          <CustomFileInput
            label="Alimony/Child Support Proof"
            file={formData.alimonyProof}
            onFileChange={handleFileChange('alimonyProof')}
          />
        </>
      )}

      {activeSubStep === 2 && (
        <>
          <CustomFileInput
            label="Bank Statements (Last 2–3 months)"
            file={formData.bankStatements}
            onFileChange={handleFileChange('bankStatements')}
          />
          <CustomFileInput
            label="Investment Statements"
            file={formData.investmentStatements}
            onFileChange={handleFileChange('investmentStatements')}
          />
          <CustomFileInput
            label="Gift Letters"
            file={formData.giftLetters}
            onFileChange={handleFileChange('giftLetters')}
          />
          <CustomFileInput
            label="Proof of Sale of Assets"
            file={formData.proofSaleOfAssets}
            onFileChange={handleFileChange('proofSaleOfAssets')}
          />
        </>
      )}

      {activeSubStep === 3 && (
        <>
          <CustomFileInput
            label="Loan Statements"
            file={formData.loanStatements}
            onFileChange={handleFileChange('loanStatements')}
          />
          <CustomFileInput
            label="Credit Card Statements"
            file={formData.creditCardStatements}
            onFileChange={handleFileChange('creditCardStatements')}
          />
          <CustomFileInput
            label="Alimony/Child Support Payments Proof"
            file={formData.alimonyPaymentsProof}
            onFileChange={handleFileChange('alimonyPaymentsProof')}
          />
        </>
      )}

      {activeSubStep === 4 && (
        <>
          <CustomFileInput
            label="Purchase Agreement"
            file={formData.purchaseAgreement}
            onFileChange={handleFileChange('purchaseAgreement')}
          />
          <CustomFileInput
            label="Homeowners Insurance Quote"
            file={formData.homeownersInsuranceQuote}
            onFileChange={handleFileChange('homeownersInsuranceQuote')}
          />
          <CustomFileInput
            label="Appraisal Report"
            file={formData.appraisalReport}
            onFileChange={handleFileChange('appraisalReport')}
          />
          <CustomFileInput
            label="Title Information"
            file={formData.titleInformation}
            onFileChange={handleFileChange('titleInformation')}
          />
          <CustomFileInput
            label="HOA Information"
            file={formData.hoaInformation}
            onFileChange={handleFileChange('hoaInformation')}
          />
        </>
      )}

      {activeSubStep === 5 && (
        <>
          <CustomFileInput
            label="Bankruptcy or Foreclosure Documentation"
            file={formData.bankruptcyDocs}
            onFileChange={handleFileChange('bankruptcyDocs')}
          />
          <CustomFileInput
            label="Divorce Decree"
            file={formData.divorceDecree}
            onFileChange={handleFileChange('divorceDecree')}
          />
          <CustomFileInput
            label="Explanation Letters"
            file={formData.explanationLetters}
            onFileChange={handleFileChange('explanationLetters')}
          />
          <CustomFileInput
            label="Gift Fund Documentation"
            file={formData.giftFundDocs}
            onFileChange={handleFileChange('giftFundDocs')}
          />
        </>
      )}

      {activeSubStep === 6 && (
        <>
          <CustomFileInput
            label="Business Tax Returns (Last 2 years)"
            file={formData.businessTaxReturns}
            onFileChange={handleFileChange('businessTaxReturns')}
          />
          <CustomFileInput
            label="Year-to-Date P&L Statements"
            file={formData.yearToDatePLStatements}
            onFileChange={handleFileChange('yearToDatePLStatements')}
          />
          <CustomFileInput
            label="Business License"
            file={formData.businessLicense}
            onFileChange={handleFileChange('businessLicense')}
          />
          <CustomFileInput
            label="CPA Letter"
            file={formData.cpaLetter}
            onFileChange={handleFileChange('cpaLetter')}
          />
        </>
      )}

      <Group mt="xl" >
        <Button
          variant="default"
          disabled={activeSubStep === 0}
          onClick={() => setActiveSubStep((s) => Math.max(s - 1, 0))}
          className="px-6 rounded-full"
        >
          Back
        </Button>
        <Button
          onClick={() => setActiveSubStep((s) => Math.min(s + 1, subSteps.length - 1))}
          className="px-6 rounded-full"
        >
          {activeSubStep === subSteps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Group>
    </>
  );
}
