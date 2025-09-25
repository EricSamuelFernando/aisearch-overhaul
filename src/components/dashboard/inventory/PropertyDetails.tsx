

"use client";

import React from 'react';
import {
  Title,
  Text,
  TextInput,
  SimpleGrid,
  Image,
  Badge,
  ActionIcon,
  Group,
} from '@mantine/core';
import { MdPhotoAlbum } from 'react-icons/md';
import { IconX } from '@tabler/icons-react';

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
  removePhoto: (index: number) => void;
  setMainPhoto: (index: number) => void;
  maxPhotos: number;
};

export default function PropertyDetails({
  formData,
  onChange,
  onFileChange,
  removePhoto,
  setMainPhoto,
  maxPhotos,
}: Props) {
  const count = formData.propertyPhotos.length;

  return (
    <>
      {/* Address section */}
      <Title className="mb-4">Address</Title>
      <div className="space-y-6 mb-6">
        <div className="w-full md:w-3/5">
          <TextInput
            placeholder="Enter Your Home Address"
            value={formData.address}
            onChange={onChange('address', '')}
            classNames={{
              root: 'w-full',
              input: 'bg-slate-100 rounded-lg border-0 focus:ring-0 p-6',
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-3/5">
          {['city', 'state', 'zipCode'].map((key, idx) => (
            <TextInput
              key={key}
              placeholder={['City', 'State', 'Zip Code'][idx]}
              value={(formData as any)[key]}
              onChange={onChange(key, '')}
              classNames={{
                input: 'bg-slate-100 rounded-lg border-0 focus:ring-0 p-6',
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 md:w-3/5">
          <TextInput
            placeholder="+1"
            value={formData.countryCode}
            onChange={onChange('countryCode', '')}
            classNames={{
              root: 'sm:col-span-1',
              input:
                'bg-slate-100 rounded-lg border-0 focus:ring-0 p-6 text-center',
            }}
          />
          <TextInput
            placeholder="000 000 0000"
            value={formData.phoneNumber}
            onChange={onChange('phoneNumber', '')}
            classNames={{
              root: 'sm:col-span-5',
              input: 'bg-slate-100 rounded-lg border-0 focus:ring-0 p-6',
            }}
          />
        </div>
      </div>

      {/* Photo section */}
      <Title order={4} className="mb-2">
        Property photos
      </Title>
      <Group className="mb-4">
        <Text size="sm" color="dimmed">
          You need 2 photos to start. You can add more later.
        </Text>
        <Text size="sm" color="dimmed">
          {count}/{maxPhotos}
        </Text>
      </Group>

      <SimpleGrid cols={5} spacing="sm">
        {/* Existing photos */}
        {formData.propertyPhotos.map((src: string, idx: number) => (
          <div key={idx} style={{ position: 'relative' }}>
            <Image
              src={src}
              height={100}
              radius="md"
              style={{ cursor: 'pointer' }}
              onClick={() => setMainPhoto(idx)}
            />

            {/* Remove button */}
            <ActionIcon
              size="xs"
              variant="filled"
              style={{ position: 'absolute', top: 4, right: 4 }}
              onClick={() => removePhoto(idx)}
            >
              <IconX size={14} />
            </ActionIcon>

            {/* “Main” badge */}
            {idx === 0 && (
              <Badge
                variant="light"
                color="orange"
                size="xs"
                style={{ position: 'absolute', top: 4, left: 4 }}
              >
                Main
              </Badge>
            )}
          </div>
        ))}

        {/* Add‐photo tile */}
        {count < maxPhotos && (
          <label className="border-2 border-dashed border-gray-300 rounded-lg w-full h-24 flex flex-col items-center justify-center cursor-pointer">
            <MdPhotoAlbum className="w-6 h-6 text-gray-400" />
            <Text size="xs" color="gray">
              Add photo
            </Text>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={e =>
                onFileChange('propertyPhotos', '', true)(e.target.files)
              }
            />
          </label>
        )}
      </SimpleGrid>
    </>
  );
}
