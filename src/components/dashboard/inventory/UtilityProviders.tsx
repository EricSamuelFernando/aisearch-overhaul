

import { Title, TextInput } from '@mantine/core';
import React from 'react';

type Props = {
  formData: any;
  onChange: (
    section: string,
    field: string
  ) => (
    e: React.ChangeEvent<HTMLInputElement> | string | boolean
  ) => void;
};

export default function UtilityProviders({
  formData,
  onChange,
}: Props) {
  const u = formData.optionalUtilityProviders;
  return (
    <>
      <Title className="mb-4">Utility Providers</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Electricity"
          placeholder="Utility Electric"
          value={u.electricityProvider}
          onChange={onChange('optionalUtilityProviders', 'electricityProvider')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Gas"
          placeholder="Utility Gas"
          value={u.gasProvider}
          onChange={onChange('optionalUtilityProviders', 'gasProvider')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="Water"
          placeholder="Utility Water"
          value={u.waterProvider}
          onChange={onChange('optionalUtilityProviders', 'waterProvider')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Trash Service"
          placeholder="Trash Services Inc"
          value={u.trashServiceProvider}
          onChange={onChange(
            'optionalUtilityProviders',
            'trashServiceProvider'
          )}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TextInput
          label="HOA Name"
          value={u.hoaName}
          onChange={onChange('optionalUtilityProviders', 'hoaName')}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
        <TextInput
          label="Monthly dues ($)"
          type="number"
          value={u.hoaMonthlyDues}
          onChange={onChange(
            'optionalUtilityProviders',
            'hoaMonthlyDues'
          )}
          classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
        />
      </div>

      <TextInput
        label="HOA Contact"
        className="mt-4"
        value={u.hoaContactInfo}
        onChange={onChange('optionalUtilityProviders', 'hoaContactInfo')}
        classNames={{ input: 'bg-slate-100 p-4 focus:ring-0' }}
      />
    </>
  );
}
