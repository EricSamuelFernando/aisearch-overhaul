

import { Title, TextInput, Select } from '@mantine/core';
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { FileInput } from '@components/ui/FileInput';

type Props = {
  formData: any;
  onChange: (
    section: string,
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement> | string | boolean) => void;
  onFileChange: (
    section: string,
    field: string,
    multiple?: boolean
  ) => (files: FileList | File | null) => void;
};

export default function Improvements({
  formData,
  onChange,
  onFileChange,
}: Props) {
  const imp = formData.nonPermittedImprovements;
  return (
    <>
      <Title className="mb-4">Non-Permitted Improvements</Title>
      <Select
        label="Made any improvements without permit?"
        data={['Yes', 'No']}
        value={imp.madeImprovements ? 'Yes' : 'No'}
        onChange={(v) =>
          onChange('nonPermittedImprovements', 'madeImprovements')(
            v === 'Yes'
          )
        }
        classNames={{ input: 'bg-slate-100 p-4' }}
      />

      {imp.madeImprovements && (
        <>
          <TextInput
            label="Type of improvement"
            value={imp.improvementType}
            onChange={onChange('nonPermittedImprovements', 'improvementType')}
            classNames={{ input: 'bg-slate-100 p-4 mt-4' }}
          />
          <TextInput
            label="Description"
            value={imp.description}
            onChange={onChange('nonPermittedImprovements', 'description')}
            classNames={{ input: 'bg-slate-100 p-4 mt-4' }}
          />
          <ReactDatePicker
           // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
            label="Approximate date"
            selected={imp.approximateDate ? new Date(imp.approximateDate) : null}
            onChange={(d) =>
              onChange('nonPermittedImprovements', 'approximateDate')(
                (d as Date).toISOString().split('T')[0]
              )
            }
            className="bg-slate-100 p-4 w-full mt-4"
          />
          <Select
            label="Licensed contractor?"
            data={['Yes', 'No']}
            value={imp.licensedContractor ? 'Yes' : 'No'}
            onChange={(v) =>
              onChange('nonPermittedImprovements', 'licensedContractor')(
                v === 'Yes'
              )
            }
            classNames={{ input: 'bg-slate-100 p-4 mt-4' }}
          />
          <Select
            label="Inspected?"
            data={['Yes', 'No']}
            value={imp.inspected ? 'Yes' : 'No'}
            onChange={(v) =>
              onChange('nonPermittedImprovements', 'inspected')(v === 'Yes')
            }
            classNames={{ input: 'bg-slate-100 p-4 mt-4' }}
          />
          <FileInput
            label="Upload docs"
             // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
            multiple
             // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
            onChange={(files) =>
              onFileChange('nonPermittedImprovements', 'documentsBase64', true)(
                files
              )
            }
            className="mt-4"
          />
        </>
      )}
    </>
  );
}
