'use client';
import { useState } from 'react';

import HorizontalDropzone from '@/components/file-dropzone';
import {
  useAddPreApprovals,
  usePreapprovalActions,
} from '@/shared/hooks/useAddPreapproval';

import Heading from '@/components/heading';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { UploadAction } from '@/hooks/utils/useCreateFilename';
import ReactDatePicker from 'react-datepicker';
import { FilePreviewCard } from './file-preview-card';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';

export function PreApprovalUpload() {
  const { setDate, setUploadedFile, setFileUrl } = usePreapprovalActions();
  const { date, uploadedFiles, fileUrl } = useAddPreApprovals();
  const [value, setValue] = useState<Date | null>(null);

  const { updateUserProfileMutation } = useUserAuthApi();

  const previews = uploadedFiles?.map((file) => {
    return (
      <FilePreviewCard
        key={file.name}
        file={file}
        uploadType={UploadAction.PROPERTY_DOCUMENT}
        setUrl={setFileUrl}
      />
    );
  });

  const handleSubmit = async () => {
    const payload = {
      preApproval: true,
      preApprovalDocument: {
        url: fileUrl,
        expiryDate: date?.toISOString(),
      },
    };

    await updateUserProfileMutation.mutate(payload);
  };

  return (
    <section className='mx-auto my-10 px-[3.219rem]'>
      <div className='grid place-content-center'>
        <Heading
          title='Upload Pre-approval Document'
          className='py-10 text-2xl'
        />

        <HorizontalDropzone
          setFiles={(files) => {
            setFileUrl('');
            setUploadedFile(files);
          }}
        />

        {previews && previews?.length > 0 && (
          <div className='my-4'>{previews}</div>
        )}

        <div className='my-10 items-center justify-between gap-x-6 md:flex'>
          <ReactDatePicker
            selected={value}
            onChange={(val) => {
              setDate(val as Date);
              setValue(val);
            }}
            className='w-full flex-auto rounded-lg !border-[1px]  border-gray-400 px-2 py-2'
            placeholderText='DD / MM / YYYY'
          />

          {/* <CustomButton
            loading={updateUserProfileMutation.isPending}
            onClick={handleSubmit}
            className={cn(
              'bg-black text-white rounded-full px-16 mt-4 md:mt-0 w-max',
              !fileUrl || !date
                ? 'bg-black/40 cursor-not-allowed pointer-events-none'
                : ''
            )}
            label="Save"
          /> */}

          <Button
            onClick={handleSubmit}
            roundness='full'
            disabled={updateUserProfileMutation.isPending || !fileUrl || !date}
            className='mt-4 w-max px-16 md:mt-0'
          >
            {updateUserProfileMutation.isPending ? <ButtonLoader /> : null}
            Save
          </Button>
        </div>
      </div>

      <div className='text-center'>
        <span className='text-grey-290 '>3/4</span>
      </div>
    </section>
  );
}
