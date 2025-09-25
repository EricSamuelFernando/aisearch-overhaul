
import { Title, TextInput, Select } from '@mantine/core';
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { FileInput } from '@components/ui/FileInput';

type Props = {
  formData: any;
  onChange: (
    section: string,
    field: string
  ) => (
    e: React.ChangeEvent<HTMLInputElement> | string | boolean
  ) => void;
  onFileChange: (
    section: string,
    field: string,
    multiple?: boolean
  ) => (files: FileList | File | null) => void;
};

export default function MortgageInformation({
  formData,
  onChange,
  onFileChange,
}: Props) {
  const m = formData.mortgageInformation;
  return (
    <>
      <Title className="mb-4">Mortgage Information</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Lender"
          value={m.lender}
          onChange={onChange('mortgageInformation', 'lender')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Original loan amount"
          type="number"
          value={m.originalLoanAmount}
          onChange={onChange('mortgageInformation', 'originalLoanAmount')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="Monthly payment"
          type="number"
          value={m.monthlyPayment}
          onChange={onChange('mortgageInformation', 'monthlyPayment')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <Select
          label="Loan type"
          data={['Fixed', 'Adjustable']}
          value={m.loanType}
        // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
          onChange={onChange('mortgageInformation', 'loanType')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ReactDatePicker
          selected={m.startDate ? new Date(m.startDate) : null}
          onChange={(d) =>
            onChange('mortgageInformation', 'startDate')(
              (d as Date).toISOString().split('T')[0]
            )
          }
          placeholderText="YYYY-MM-DD"
          className="bg-slate-100 p-4 w-full"
        />
        <ReactDatePicker
          selected={m.maturityDate ? new Date(m.maturityDate) : null}
          onChange={(d) =>
            onChange('mortgageInformation', 'maturityDate')(
              (d as Date).toISOString().split('T')[0]
            )
          }
          placeholderText="YYYY-MM-DD"
          className="bg-slate-100 p-4 w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select
          label="Escrowed"
          data={['Yes', 'No']}
          value={m.escrowed ? 'Yes' : 'No'}
          onChange={(v) =>
            onChange('mortgageInformation', 'escrowed')(v === 'Yes')
          }
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Interest rate (%)"
          type="number"
          value={m.interestRate}
          onChange={onChange('mortgageInformation', 'interestRate')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="Remaining balance"
          type="number"
          value={m.remainingBalance}
          onChange={onChange('mortgageInformation', 'remainingBalance')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <FileInput
          label="Upload statement (PDF)"
           // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
          onChange={(file) =>
            onFileChange('mortgageInformation', 'statementBase64')(file)
          }
        />
      </div>
    </>
  );
}
