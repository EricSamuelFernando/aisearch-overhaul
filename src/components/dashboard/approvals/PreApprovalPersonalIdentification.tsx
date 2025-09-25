import { useState, ChangeEvent } from 'react';
import { Title, TextInput, Group, Button, Progress } from '@mantine/core';
import { FileInput as CustomFileInput } from '@components/ui/FileInput'; // Adjust the import path as needed

type Props = {
  formData: any;
  handleChange: any;
  handleFileChange:any;
  subSteps:any
};



export default function PreApprovalPersonalIdentification({ formData, handleChange, handleFileChange , subSteps }: Props) {
  const [activeSubStep, setActiveSubStep] = useState(0);

  const next = () => setActiveSubStep((curr) => Math.min(curr + 1, subSteps.length - 1));
  const prev = () => setActiveSubStep((curr) => Math.max(curr - 1, 0));

  return (
    < >
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
            label="Type of Government-Issued ID"
            placeholder="Driver's License / Passport"
            value={formData.idType}
            onChange={handleChange('idType')}
            classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
          />
          <TextInput
            label="Social Security Number"
            placeholder="XXX-XX-XXXX"
            value={formData.ssn}
            onChange={handleChange('ssn')}
            classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
          />
        </>
      )}

      {activeSubStep === 1 && (
        <>
          <CustomFileInput
            label="Pay Stubs (Last 30 days)"
            file={formData.payStubs}
            onFileChange={handleFileChange('payStubs')}
            
          />
          <CustomFileInput
            label="W-2 Forms (Last 2 years)"
            file={formData.w2Forms}
            onFileChange={handleFileChange('w2Forms')}
          />
          <CustomFileInput
            label="Tax Returns (Last 2 years)"
            file={formData.taxReturns}
            onFileChange={handleFileChange('taxReturns')}
          />
          <CustomFileInput
            label="Profit and Loss Statements (If self-employed)"
            file={formData.pAndL}
            onFileChange={handleFileChange('pAndL')}
          />
        </>
      )}

      {activeSubStep === 2 && (
        <>
          <CustomFileInput
            label="Rental Income Documentation (If applicable)"
            file={formData.rentalIncome}
            onFileChange={handleFileChange('rentalIncome')}
          />
          <CustomFileInput
            label="Bank Statements (Last 2-3 months)"
            file={formData.bankStatements}
            onFileChange={handleFileChange('bankStatements')}
          />
          <CustomFileInput
            label="Investment Statements"
            file={formData.investmentStatements}
            onFileChange={handleFileChange('investmentStatements')}
          />
          <CustomFileInput
            label="Gift Letter (If applicable)"
            file={formData.giftLetter}
            onFileChange={handleFileChange('giftLetter')}
          />
        </>
      )}

      {activeSubStep === 3 && (
        <>
          <CustomFileInput
            label="Loan Statements (Any outstanding loans)"
            file={formData.loanStatements}
            onFileChange={handleFileChange('loanStatements')}
          />
          <CustomFileInput
            label="Credit Card Statements (Recent)"
            file={formData.creditCardStatements}
            onFileChange={handleFileChange('creditCardStatements')}
          />
        </>
      )}

      {activeSubStep === 4 && (
        <>
          <CustomFileInput
            label="Purchase Agreement (If applicable)"
            file={formData.purchaseAgreement}
            onFileChange={handleFileChange('purchaseAgreement')}
          />
          <TextInput
            label="Estimated Property Taxes and Insurance"
            placeholder="Enter Property Taxes and Insurance"

            value={formData.propertyTaxes}
            onChange={handleChange('propertyTaxes')}
            classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
          />
        </>
      )}

      {activeSubStep === 5 && (
        <>
          <CustomFileInput
            label="Divorce Decree (If applicable)"
            file={formData.divorceDecree}
            onFileChange={handleFileChange('divorceDecree')}
          />
          <CustomFileInput
            label="Bankruptcy or Foreclosure Documentation"
            file={formData.bankruptcyDocs}
            onFileChange={handleFileChange('bankruptcyDocs')}
          />
          <CustomFileInput
            label="Proof of Additional Income"
            file={formData.additionalIncome}
            onFileChange={handleFileChange('additionalIncome')}
          />
        </>
      )}

      <Group mt="xl">
        <button disabled={activeSubStep === 0} className="px-4 rounded-full" onClick={prev}>
          Back
        </button>
        <button className='px-10 py-2  border bg-white border-black rounded-full text-black'  disabled={activeSubStep === subSteps.length - 1} onClick={next}>
          Next
        </button>
      </Group>
    </>
  );
}
