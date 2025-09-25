

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

export default function HomeInsuranceInfo({
  formData,
  onChange,
  onFileChange,
}: Props) {
  const hi = formData.homeInsuranceInfo;
  return (
    <>
      <Title className="mb-4">Home Insurance</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Provider"
          value={hi.provider}
          onChange={onChange('homeInsuranceInfo', 'provider')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Premium ($)"
          type="number"
          value={hi.premium}
          onChange={onChange('homeInsuranceInfo', 'premium')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="Policy number"
          value={hi.policyNumber}
          onChange={onChange('homeInsuranceInfo', 'policyNumber')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Deductible ($)"
          type="number"
          value={hi.deductible}
          onChange={onChange('homeInsuranceInfo', 'deductible')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <ReactDatePicker
          selected={hi.coverageStartDate ? new Date(hi.coverageStartDate) : null}
          onChange={(d) =>
            onChange('homeInsuranceInfo', 'coverageStartDate')(
              (d as Date).toISOString().split('T')[0]
            )
          }
          placeholderText="YYYY-MM-DD"
          className="bg-slate-100 p-4 w-full"
        />
        <ReactDatePicker
          selected={
            hi.coverageExpirationDate
              ? new Date(hi.coverageExpirationDate)
              : null
          }
          onChange={(d) =>
            onChange('homeInsuranceInfo', 'coverageExpirationDate')(
              (d as Date).toISOString().split('T')[0]
            )
          }
          placeholderText="YYYY-MM-DD"
          className="bg-slate-100 p-4 w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select
          label="Bundled policy?"
          data={['Yes', 'No']}
          value={hi.bundledPolicy ? 'Yes' : 'No'}
          onChange={(v) =>
            onChange('homeInsuranceInfo', 'bundledPolicy')(v === 'Yes')
          }
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <FileInput
          label="Upload policy doc"
           // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
          onChange={(file) =>
            onFileChange('homeInsuranceInfo', 'policyDocumentBase64')(file)
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select
          label="Claims in last 5 yrs?"
          data={['Yes', 'No']}
          value={hi.claimsInLast5Years ? 'Yes' : 'No'}
          onChange={(v) =>
            onChange('homeInsuranceInfo', 'claimsInLast5Years')(v === 'Yes')
          }
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Claims description"
          value={hi.claimsDescription}
          onChange={onChange('homeInsuranceInfo', 'claimsDescription')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>
    </>
  );
}
