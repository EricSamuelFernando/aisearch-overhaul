'use client';

import React from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Delete, Info, Plus, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, useMemo, useState } from 'react';
import { FormProvider, useFieldArray } from 'react-hook-form';

import CustomModal from '@/components/custom-modal';
import CustomInput from '@/components/customs/input';
import FontAwesomePicker from '@/components/font-awesome-picker';
import { removeNonNumericCharacters } from '@/lib/helpers';
import { useEditPropertyFormContext } from '../../../providers/edit-property-context';
import CustomTooltip from '../../customs/tooltip';
import useFileUpload from '@/hooks/api/UseFileUpload';
import { CustomFileInput } from '../user/CustomFileInput';
import { EditTextInput } from '../user/edit-text-input';
import CheckBox from '../user/CheckBox';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';

type Props = {};

interface ForwardRefProp extends React.HTMLAttributes<HTMLDivElement> { }

const EditPropertyContent = forwardRef<Props, ForwardRefProp>((props, ref) => {
  const { methods } = useEditPropertyFormContext();
  const values = methods.getValues();

  const { control, register } = methods;
  const {
    fields: features,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'features',
  });

  const handleIconChange = (index: number, selectedIcon: string) => {
    methods.setValue(`features.${index}.icon`, selectedIcon);
  };
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_SEARCH_ENDPOINT || "https://ai.snaphomz.com";
  const [uploadedFileKeys, setUploadedFileKeys] = React.useState<string[]>([]);
  const propertyData = useSelector((state: any) => state?.property?.claimProperty);
  const propertyDetails = useMemo(() => {
    return methods.getValues();
  }, [methods.watch(), methods]);

  const [opened, { open, close }] = useDisclosure(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [videos, setVideos] = useState<File[] | null>([]);
  const [images, setImages] = useState<File[] | null>([]);
  const [uploadingImages, setUploadingImages] = useState<File[]>([]);
  const [uploadingVideos, setUploadingVideos] = useState<File[]>([]);

  const {
    files,
    uploadProgress,
    uploadResults,
    isUploading,
    setFiles,
    handleUpload,
    fileKeys,
  } = useFileUpload();

  React.useEffect(() => {
    if (Object.keys(files).length > 0) {
      handleUpload();
    }
  }, [files]);
  React.useEffect(() => {
    if (propertyData) {
      const { mls_data, property, owner } = propertyData;
      console.log()
      // Set default values for the form
      methods.setValue('propertyName', propertyData?.mls_data?.listingid || 'Property Name');
      methods.setValue('numBedroom', propertyData?.mls_data?.data?.property?.bedroomsTotal || 0);
      methods.setValue('numBathroom', propertyData?.mls_data?.data?.property?.bathroomTotal || '');
      methods.setValue('price.amount', propertyData?.mls_data?.listPrice || '');
      methods.setValue('price.currency', 'USD');
      methods.setValue('propertyType', propertyData?.mls_data?.propertyType || '');
      methods.setValue('lotSizeUnit', propertyData?.mls_data?.property?.lotSizeSquareFeet || '');
      methods.setValue('lotSizeValue', propertyData?.mls_data?.data?.property?.livingArea || '');
      methods.setValue('year', propertyData?.mls_data?.property?.yearBuilt || '');
      methods.setValue('propertyDescription', propertyData?.mls_data?.publicRemarks || '');
      // methods.setValue('contactEmail', owner?.email || ''); // Contact email

      // You can also set other specific fields as needed
    }
  }, [propertyData, methods]);

  React.useEffect(() => {
    if (uploadedFileKeys.length > 0) {
      const photos = uploadedFileKeys.map((key) => ({
        url: key,
        thumbNail: key,
      }));

      methods.setValue('images', [...methods.getValues('images'), ...photos]);

    }
  }, [uploadedFileKeys]);

  // React.useEffect(() => {
  //   if (fileKeys.length > 0) {
  //     const photos = fileKeys.map((item) => ({
  //       url: item,
  //       thumbNail: item,
  //     }))
  //     methods.setValue('images', [...methods.getValues('images'), ...photos])
  //   }
  // }, [fileKeys])

  const handleFileChange = async (files: File[] | null) => {
    if (!files) {
      console.error('No files selected.');
      // const formData = new FormData();
      // formData.append('file', file);
      // const result = await axios.post(`${AI_SEARCH_ENDPOINT}/api/upload`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      return;
    }
  };

  const handleVideoFileChange = async (files: File[] | null) => {
    if (!files) {
      console.error('No files selected.');
      return;
    }

    setUploadingVideos(files);

    try {
      const fileList = files as unknown as FileList;
      setFiles('videos', fileList);
      await handleUpload();
      setVideos((prevVideos) => [...(prevVideos || []), ...files]);
    } catch (error) {
      console.error('Failed to upload videos:', error);
    }
  };

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <section>
      <section
        className=' left-0 right-0 top-0 flex cursor-pointer items-center gap-5 bg-white'
        style={{ paddingTop: '0', marginTop: '0', marginBottom: '0' }}
        onClick={handleBack}
      >
        <Image
          src='/assets/images/arrow-back.svg'
          alt='Back'
          height={19}
          width={18}
        />
        <p className='text-md font-medium'>Back</p>
      </section>
      <h2 className='mb-20 mt-4 text-xl font-bold'>
        Editing <span className='text-gray-400'>{values.propertyName}</span>
      </h2>

      <FormProvider {...methods}>
        <div>
          <section className='grid gap-x-10 gap-y-10 md:grid-cols-2'>
            <CustomInput
              {...register('mls_data.data.property.bedroomsTotal')}
              type='text'
              name='numBedroom'
              defaultValue={propertyData?.mls_data?.data?.property?.bedroomsTotal}
              label='Bedrooms'
              placeholder={values?.numBedroom ?? 'Bedroom'}
              onChange={(e) => {
                methods.setValue(
                  'mls_data.data.property.bedroomsTotal',
                  removeNonNumericCharacters(e.currentTarget.value),
                );
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700 mb-2'
            />

            <div className='flex items-end gap-x-4'>
              <CustomInput
                {...register('price.amount', {
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = e.target.value;
                    if (value !== undefined && value !== '') {
                      methods.setValue('price.amount', parseFloat(value));
                    }
                  },
                })}
                type='text'
                name='price.amount'
                defaultValue={propertyData?.property_detail?.data?.estimatedValue}
                label='Price'
                placeholder={values?.price?.amount?.toFixed() ?? 'Price'}
                prefix='$'
                className='mt-2 h-10'
                labelClass='text-sm font-medium text-gray-700 mb-2'
              />

              <CustomTooltip
                label={<span>Agent Contact</span>}
                opened={openTooltip}
                closeDelay={500}
                openDelay={500}
              >
                <h3
                  onClick={() => setOpenTooltip((o) => !o)}
                  className='mb-6 flex cursor-pointer items-center gap-x-1 whitespace-nowrap text-sm'
                >
                  <Info className='h-4 w-4 flex-shrink-0 text-ocOrange' />
                  <span>Talk To Agent</span>
                </h3>
              </CustomTooltip>
            </div>

            <CustomInput
              {...register('mls_data.data.property.bathroomsTotal')}
              type='text'
              name='numBathroom'
              defaultValue={propertyData?.mls_data?.data?.property?.bathroomsTotal}
              label='Bathrooms'
              placeholder={values.numBathroom ?? 'Bathroom'}
              onChange={(e) => {
                methods.setValue(
                  'mls_data.data.property.bathroomsTotal',
                  removeNonNumericCharacters(e.currentTarget.value),
                );
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700 mb-2'
            />

            {/* <CustomNativeSelect
              {...register('lotSizeUnit')}
              label='Lot Size Unit'
              type='text'
              size='md'
              handleChange={(val: string) => {
                methods.setValue('lotSizeUnit', val)
              }}
              defaultValue={values?.lotSizeUnit}
              placeholder='Lot Size...'
              withAsterisk
            /> */}

            <CustomInput
              {...register('mls_data.data.property.livingArea')}
              type='text'
              name='Lot Size'
              defaultValue={propertyData?.mls_data?.data?.property?.livingArea}
              label='Sqft'
              placeholder={values.lotSizeUnit ?? 'lotSizeUnit'}
              onChange={(e) => {
                methods.setValue('mls_data.data.property.livingArea', e.currentTarget.value);
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700 mb-2'
            />

            <CustomInput
              {...register('mls_data.data.property.lotSizeSquareFeet')}
              type='text'
              name='lotSizeValue'
              defaultValue={propertyData?.mls_data?.data?.property?.lotSizeSquareFeet}
              label='Property Size'
              onChange={(e) => {
                methods.setValue(
                  'mls_data.data.property.lotSizeSquareFeet',
                  removeNonNumericCharacters(e.currentTarget.value),
                );
              }}
              className='mt-2 h-10'
              placeholder='Property Size'
              labelClass='text-sm font-medium text-gray-700 mb-2'
            />

            {/* <CustomInput
              // {...register('lotSizeValue')}
              type='text'
              name='lotSizeValue'
              // defaultValue={values?.lotSizeValue}
              label='Lot Size'
              onChange={(e) => {
                methods.setValue(
                  'lotSizeValue',
                  removeNonNumericCharacters(e.currentTarget.value),
                );
              }}
              className='mt-2 h-10'
              placeholder='lot size'
              labelClass='text-sm font-medium text-gray-700 mb-2'
            /> */}

            <CustomInput
              {...register('mls_data.data.property.hoa')}
              type='text'
              name='HOA Dues'
              defaultValue={propertyData?.mls_data?.data?.property?.hoa}
              label='Hoa dues'
              placeholder={'Hoa Dues'}
              onChange={(e) => {
                methods.setValue('mls_data.data.property.hoa', e.currentTarget.value)
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700'
            />

            <CustomInput
              {...register('propertyType')}
              type='text'
              name='numBathroom'
              defaultValue={propertyData?.mls_data?.data?.property?.propertyType}
              label='Property Type'
              placeholder={values.propertyType ?? 'Property Type'}
              onChange={(e) => {
                methods.setValue('propertyType', e.currentTarget.value);
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700'
            />

            <CustomInput
              {...register('yearBuild')}
              type='text'
              name='year'
              defaultValue={values?.yearBuild}
              label='Year Built'
              placeholder={values.year ?? 'year'}
              onChange={(e) => {
                methods.setValue('yearBuild', e.currentTarget.value);
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700'
            />

            <CustomInput
              {...register('year')}
              type='text'
              name='year'
              defaultValue={values?.year}
              label='Structural remodel year'
              placeholder={'structural remodel year'}
              onChange={(e) => {
                methods.setValue('year', e.currentTarget.value);
              }}
              className='mt-2 h-10'
              labelClass='text-sm font-medium text-gray-700'
            />
          </section>

          <section className='text-area my-6'>
            <div className='mb-4 w-full'>
              <label className='mb-2 block text-sm font-medium text-gray-700'>
                Property Description
              </label>
              <textarea
                {...register('mls_data.data.publicRemarks')}
                defaultValue={propertyData?.mls_data?.data?.publicRemarks}
                placeholder={
                  values.propertyDescription ?? 'Property Description'
                }
                onChange={(e) => {
                  methods.setValue(
                    'mls_data.data.publicRemarks',
                    e.currentTarget.value,
                  );
                }}
                rows={5}
                className='h-max w-full resize-none items-center rounded-md border border-solid border-[#F5F6F9] bg-[#F5F6F9] px-10 py-20 text-gray-700 placeholder:text-[#acacac] focus:border-black focus:outline-none'
              />
            </div>
          </section>

          <div className='section'>
            <h3 className='pb-4 text-2xl'>Features</h3>

            <section>
              {features.map((field, index) => (
                <div key={field.id}>
                  <section
                    className={
                      'section mb-4 flex items-center justify-between gap-x-4'
                    }
                    key={field.id}
                  >
                    <div className='icon-picker  w-32 text-center'>
                      <FontAwesomePicker
                        value={methods.getValues(`features.${index}.icon`)}
                        onChange={(iconName) => {
                          handleIconChange(index, iconName);
                        }}
                      />
                    </div>
                    <CustomInput
                      {...register(`features.${index}.feature`)}
                      value={values.features[index].feature}
                      placeholder='Title'
                      className='flex-auto'
                      name={`features.${index}.feature`}
                      onChange={(e) => {
                        methods.setValue(
                          `features.${index}.feature`,
                          e.currentTarget.value,
                        );
                      }}
                    />
                    <CustomInput
                      {...register(`features.${index}.description`)}
                      value={values.features[index].description}
                      className='flex-auto'
                      placeholder='Description'
                      name={`features.${index}.description`}
                      onChange={(e) => {
                        methods.setValue(
                          `features.${index}.description`,
                          e.currentTarget.value,
                        );
                      }}
                    />

                    {features.length > 1 ? (
                      <button type='button' onClick={() => remove(index)}>
                        <Delete />
                      </button>
                    ) : null}
                  </section>
                </div>
              ))}

              <div className='flex items-center justify-center py-4 text-center'>
                <Plus
                  className='cursor-pointer text-ocOrange'
                  onClick={() =>
                    append({
                      feature: '',
                      description: '',
                      icon: 'edit',
                    })
                  }
                />
              </div>

              {/* {propertyDetails?.features != null &&
                propertyDetails?.features.length > 0 &&
                propertyDetails?.features?.map((features, index) => {
                  return (
                    <EditableSection
                      key={features._id}
                      title={features.feature}
                      description={features.description}
                    />
                  )
                })} */}
              <h2 className='mt-20 text-xl font-bold'>Contact Information</h2>
              <p className='mb-8 mt-2  w-4/5 text-md text-[#848484]'>
                Potential buyers will contact you through the email address
                registered on OC-Snaphomz or through your listed agent.
              </p>
              <EditTextInput
                className='w-3/5'
                type='email'
                defaultValue={propertyData?.coowners[0]?.email}
                disabled
              />
              <section className='my-8 flex items-center gap-x-4'>
                <CheckBox
                  label={
                    <p className='text-md text-[#848484]'>
                      I agree to the terms
                    </p>
                  }
                  checked={true}
                  onChange={() => { }}
                />
              </section>
            </section>
          </div>

          {/* <div className='section'>
            <h3 className='mb-2 text-2xl'>Contact Information</h3>
            <p className='mb-8 text-grey-670 font-normal text-base'>
              Potential buyers will contact you through the email address
              registered on OC-Snaphomz or through your listed agent.
            </p>

            <section>
              <CustomInput
                value={values.features[index].feature}
                placeholder='Alice.downey@ocreal.com'
                className='flex-auto'
                name={`features.${index}.feature`}
                onChange={(e) => {
                  methods.setValue(
                    `features.${index}.feature`,
                    e.currentTarget.value
                  )
                }}
              />
            </section>
          </div> */}

          <section className='images'>
            <h3 className='mb-2 text-sm text-grey-100'>Add Photos</h3>

            <div className='my-4 flex gap-x-4'>
              <section className='mr-10 h-24 w-36'>
                <CustomFileInput handleFile={handleFileChange} />
              </section>

              {propertyData?.mls_data?.data?.media?.photosList?.slice(0, 3).map((image: any, index: any) => {
                return (
                  <div key={index}>
                    <img
                      className='h-24 w-full max-w-full rounded-lg object-cover object-center'
                      src={image.midRes}
                      alt='gallery-photo'
                    />
                    {/* {image.url} */}
                  </div>
                );
              })}

              {propertyDetails?.images?.length > 3 && (
                <p className='text-sm font-bold'>{`+${propertyDetails?.images?.length - 3
                  } more`}</p>
              )}

              {images?.map((image, index) => {
                return (
                  <div key={index}>
                    <img
                      className='h-24 w-full max-w-full rounded-lg object-cover object-center'
                      src={URL.createObjectURL(image)}
                      alt='gallery-photo'
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className='videos'>
            <h3 className='mb-2 text-sm text-grey-100'>Add Videos</h3>

            <section className='my-4 flex gap-x-4'>
              <section className='mr-10 h-24 w-36'>
                <CustomFileInput handleFile={handleVideoFileChange} />
              </section>

              {propertyDetails?.videos?.slice(0, 3).map((video, index) => {
                return (
                  <div key={index}>
                    <video
                      className='h-24 w-full max-w-full rounded-lg object-cover object-center'
                      src={video.url}
                    />
                  </div>
                );
              })}

              {propertyDetails?.videos?.length > 3 && (
                <p className='text-sm font-bold'>{`+${propertyDetails?.videos?.length - 3
                  } more`}</p>
              )}

              {videos?.map((video, index) => {
                return (
                  <div key={index}>
                    <video
                      className='h-24 w-full max-w-full rounded-lg object-cover object-center'
                      src={URL.createObjectURL(video)}
                    />
                  </div>
                );
              })}
            </section>
          </section>
        </div>
      </FormProvider>

      <CustomModal isOpen={opened} onClose={close}>
        <div className='grid grid-cols-1 gap-4 gap-x-6 sm:grid-cols-2 md:grid-cols-3'>
          {propertyData?.mls_data?.data?.media?.photosList.map((item: any, idx: any) => (
            <div
              key={item?.midRes || item.url}
              className='relative h-40  w-full'
            >
              <Image
                className='max-w-full rounded-lg object-cover object-center'
                src={item?.midRes || item.url}
                fill
                alt={`Gallery-photo-${idx + 1}`}
              />
            </div>
          ))}
        </div>
      </CustomModal>
    </section>
  );
});

EditPropertyContent.displayName = 'Edit Property Content';

export default EditPropertyContent;
