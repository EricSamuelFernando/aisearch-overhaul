'use client';

import { Button } from '@/components/ui/button';
import HorizontalDropzone from '@/components/file-dropzone';
import { UploadAction } from '@/hooks/utils/useCreateFilename';
import { FileWithPath } from '@/interfaces/file.interface';
import { IProperty } from '@/interfaces/property.interface';
import {
  useGetSingleProperty,
  usePropertyApi,
} from '@/hooks/api/property/usePropertyApi';
import { storeCookie } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/shared/constants/env';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useClaimsFormContext } from '../../../providers/claim-context';
import { FilePreviewCard } from '../../buy/onboard/file-preview-card';
import SummarySection from './summary';

const Editor = dynamic(() => import('@/components/custom-editor'), {
  ssr: true,
});

export default function MakeOfferContent() {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();

  const { getSingleProperty } = useGetSingleProperty(id!);
  const property = getSingleProperty?.data?.data?.data?.property as IProperty;
  const loading = getSingleProperty.isFetching || getSingleProperty.isLoading;

  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [fileUrl, setFileUrl] = useState<string>('');
  const { form } = useClaimsFormContext();
  const { createOfferMutation } = usePropertyApi();

  const [coverLetterContent, setCoverLetterContent] = useState(
    form.values.coverLetter,
  );
  const [specialTermsContent, setSpecialTermsContent] = useState(
    form.values.specialTerms,
  );

  useEffect(() => {
    setCoverLetterContent(form.values.coverLetter);
    setSpecialTermsContent(form.values.specialTerms);
  }, [form.values.coverLetter, form.values.specialTerms]);

  const handleSubmit = async () => {
    storeCookie({ key: USER_ROLE, value: 'buyer' });
    const payload = {
      ...form.values,
      property: id as string,
      buyerAgent: property?.buyerAgent._id,
    };
    await createOfferMutation.mutate(payload);
  };

  const previews = files?.map((file) => {
    return (
      <FilePreviewCard
        key={file.name}
        file={file}
        uploadType={UploadAction.OFFER_DOCUMENT}
        setUrl={setFileUrl}
      />
    );
  });

  return (
    <section>
      {loading ? null : (
        <div className='my-8 grid gap-x-10 md:grid-cols-3'>
          <div className='col-span-2'>
            <div>
              <h2 className='text-2xl font-bold'>
                Drafting Offer :{' '}
                {property?.propertyAddressDetails?.formattedAddress}{' '}
                <span className='text-grey-100'>
                  ${property?.price?.amount?.toString()}
                </span>
              </h2>
              <div className='my-8'>
                <p className='py-4'>Cover Letter</p>
                <Editor
                  value={coverLetterContent}
                  onChange={(val) => {
                    form.setFieldValue('coverLetter', val);
                    setCoverLetterContent(val);
                  }}
                />
              </div>
            </div>

            <SummarySection />

            <div className='my-8'>
              <p className='py-4'>Special Terms</p>
              <Editor
                value={specialTermsContent}
                onChange={(val) => {
                  form.setFieldValue('specialTerms', val);
                  setSpecialTermsContent(val);
                }}
              />
            </div>

            <section className='my-10'>
              <div className='py-8 text-black'>
                <h2>Upload Document</h2>
                <p className='text-sm text-grey-970'>
                  Optional ( As your agent will be required to upload before
                  final submission )
                </p>
              </div>
              <HorizontalDropzone
                files={files}
                setFiles={(files) => {
                  setFiles(files);
                }}
              />

              {previews && previews?.length > 0 && (
                <div className='my-4 w-1/3'>{previews}</div>
              )}
            </section>
          </div>
          <div className='col-span-1'>
            <h3 className='font-bold'>Presented by</h3>
            <div className='item-start mt-8 flex gap-x-6'>
              <div className='rounnded-full relative h-[70px] w-[70px]'>
                <Image
                  src='/assets/images/agent-demo.png'
                  objectFit='cover'
                  fill
                  alt='Agent'
                />
              </div>
              <div className='space-y-1'>
                <p className='text-xl font-[600]'>Daniel Smith??</p>
                <p className='text-base font-[400]'>Daniel.smith@ocreal.com</p>
                <p className='text-sm font-light'>616 -2342-3245</p>
                <p className='text-sm text-grey-990'>Licence# 2312324</p>
              </div>
            </div>
            <div className='mt-10'>
              <div className='my-4 flex items-center gap-x-4'>
                <Button
                  roundness='full'
                  className='w-full bg-[#ccc] font-semibold text-white'
                >
                  Cancel
                </Button>

                <Button
                  roundness='full'
                  onClick={handleSubmit}
                  disabled={createOfferMutation.isPending}
                  className={cn('w-full cursor-pointer font-semibold')}
                >
                  Save
                </Button>
              </div>

              <div>
                <Button variant='outline' roundness='full' className='w-full'>
                  Preview Offer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
