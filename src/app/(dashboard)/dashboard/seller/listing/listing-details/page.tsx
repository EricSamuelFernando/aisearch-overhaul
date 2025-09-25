'use client';

import Link from 'next/link';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import Modal from 'components/common/Modal'
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import PlusIcon from '@public/assets/icons/plusIcon.svg';
import Delete from '@public/assets/icons/delete.svg';
import PropertyInfoDetails from '@/components/dashboard/main/property-snippet-details';
import { urlAtom } from '@/hooks/api/property/useGetPresignedUrl';
import { claimPropertyAtom } from '@/hooks/claim-property-atom';
import { PropertySnippet } from '@/components/dashboard/main/property-snippet';
import PropertySnippetDetails from '@/components/dashboard/main/property-snippet-details';
import { useVerifyOwnership } from '@/hooks/api/property/useVerifyOwnership';
import { FileUpload } from '@/components/RoundedFileInput';
import { BorderedTextInput } from '@/components/BorderedTextInput';
import { TransRoundedButton } from '@/components/dashboard/main/TransRoundedButton';
import { FavouriteModal } from '@/components/dashboard/main/favourites-modal';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { error, success } from '@/components/alert/notify';
import axios from 'axios';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';

interface CoownerInterface {
  name: string;
  email: string;
}
type OwnerData = {
  owner: {
    firstname: string;
    lastname: string;
    email: string;
    owner_id: string;
    doc_urls: string[];  // Corrected type to string[]
  };
  file: null | File;
  status: string;
  listingId: string;
  propertyId: string;
  coowners: string[];
};

const ListingDetailsPage = () => {
  const [_, seturlAtom] = useAtom(urlAtom);
  const router = useRouter();
  const user = useSelector(userData);
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_SEARCH_ENDPOINT || "https://demo-ai.snaphomz.com";
  const currentProperty = useSelector((state: any) => state.property.claimProperty);
  const [coOwners, setCoOwners] = useState<CoownerInterface[]>([]);
  const [showCoOwners, setShowCoOwners] = useState(false);
  const { uploadNewFile } = usePropertyServiceAPI()
  const { createRepoWithUploadedFile }= useRepoManagementApi()
  // console.log("Current Property : ", currentProperty);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      coOwners: [{ name: '', email: '' }]
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'coOwners'
  });
  
  const addCoOwner = () => {
    if (!showCoOwners) {
      setShowCoOwners(true);
    } else {
      append({ name: '', email: '' });
    }
  };
  

  const [additionalFiles, setAdditionalFiles] = useState(false);
  const {
    // control,
    // errors,
    // isValid,
    // handleSubmit,
    setFiles,
    files,
    isLoading,
    fileNames,
    getURLs,
  } = useVerifyOwnership(currentProperty._id);
  const handleFileChange = (files: File[] | null) => {
    // @ts-ignore
    console.log("Files:", files);
  
    setFiles((prevFiles) => [...prevFiles!, ...files!]);
  };
  

  const handleFileUpload = async (file: File) => {
    try {
      const { key } = await uploadNewFile(file, user.id, currentProperty?.id);
      const payload = {
        uploadedFile: {
          fileName: file?.name,
          fileSize: file?.size,
          fileUrl: key,
          fileType: file?.type
        },
        createRepoManagementInput: {
          name: 'proof-document',
          url: '/proof-document',
          propertyId: currentProperty?.id?.toString(),
          createdBy: user.id,
          parentFolderName: 'proof-document',
          isArchived: false
        }
      };
      createRepoWithUploadedFile?.mutate(payload, {
        onSuccess: (data) => { 
          console.log(data)
        },
        onError: (err) => {
          error({ message: err?.message || 'Upload failed' });
        },
      });
      return key;
    } catch (err: any) {
      console.error("File upload failed:", err);
      throw new Error('File upload failed');
    }
  };
  
  const onSubmit = async (data: any) => {
    try {
      const uploadedFiles: string[] = [];
      const { firstName, lastName, coOwners } = data; // Destructure for easier readability
      
      const ownerData:OwnerData = {
        owner: {
          firstname: firstName,
          lastname: lastName,
          email: user?.email,
          owner_id: user?.id,
          doc_urls: []
        },
        file: null,
        status: 'pending',
        listingId: currentProperty?.listingId,
        propertyId: currentProperty?.id,
        coowners: coOwners,
      };
  
      // Check if files exist
      if (!files?.[0]) {
        throw new Error("No file selected for upload.");
      }
  
      // Handle file uploads in parallel
      const uploadPromises = files.map((file) => handleFileUpload(file));
      const fileUrls = await Promise.all(uploadPromises);
      uploadedFiles.push(...fileUrls);
      
      // Update the doc_urls in ownerData with uploaded file URLs
      ownerData.owner.doc_urls = uploadedFiles;
  
      // Submit the ownership data
      const response = await axios.post(`${AI_SEARCH_ENDPOINT}/api/v2/ownership`, ownerData);
      console.log('Response:', response.data);
  
      success({ message: response?.data?.message });
      router.push("/dashboard/seller/listing/pending-verification");
    } catch (err: any) {
      console.error('Error:', err);
      error({ message: err?.message || 'Submission failed' });
    }
  };
  
  return (
    <section className='flex min-h-full flex-col justify-center rounded-t-lg bg-[#F7F2EB] px-14 py-10'>
      <section className='grid grid-cols-3 gap-x-24'>
        <FavouriteModal property={{
          name:"",
          image:currentProperty?.media?.primaryListingImageUrl,
          price:currentProperty?.listPrice,
          address:currentProperty?.listing?.address?.unparsedAddress
          }}>
          <PropertyInfoDetails
                noOfBeds={currentProperty.property?.bedroomsTotal}
                noOfBaths={currentProperty.property?.bathroomsTotal}
            lotSizeUnit={""}
            lotSizeValue={currentProperty?.property?.livingArea}
          />
        </FavouriteModal>
        <section className='col-span-2'>
          <h1 className='mb-8 text-4xl font-medium'>Enter Owner’s Details</h1>
          <section className='grid grid-cols-2 gap-6'>
            <section className='relative'>
              <Controller
                render={({ field: { onChange, value } }) => (
                  <BorderedTextInput
                    type='text'
                    label='First Name'
                    value={value}
                    onChange={onChange}
                    error={errors?.firstName?.message}
                  />
                )}
                name='firstName'
                control={control}
              />
            </section>
            <section className='relative'>
              <Controller
                render={({ field: { onChange, value } }) => (
                  <BorderedTextInput
                    type='text'
                    label='Last Name'
                    value={value}
                    onChange={onChange}
                    error={errors?.lastName?.message}
                  />
                )}
                name='lastName'
                control={control}
              />
            </section>
          </section>

          {showCoOwners &&
            fields.map((field, index) => (
              <section key={field.id} className='mt-10 grid grid-cols-2 gap-6'>
                <section className='relative'>
                  <Controller
                    name={`coOwners.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <BorderedTextInput
                        type='text'
                        label={`Co-owner Name ${index + 1}`}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors?.coOwners?.[index]?.name?.message}
                      />
                    )}
                  />
                </section>
                <section className='relative'>
                  <Controller
                    name={`coOwners.${index}.email`}
                    control={control}
                    render={({ field }) => (
                      <BorderedTextInput
                        type='email'
                        label={`Email ${index + 1}`}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors?.coOwners?.[index]?.email?.message}
                      />
                    )}
                  />
                </section>
              </section>
            ))}

          <section className='mb-6 mt-12 flex items-center'>
            <Image
              src={PlusIcon}
              alt='add new image'
              objectFit='contain'
              className='cursor-pointer'
              height={27}
              width={27}
              onClick={addCoOwner}
            />
            <p className='ml-6 text-base font-bold text-black'>Add co-owner</p>
          </section>
          <section className='relative mt-16'>
            <FileUpload
              label={
                <label className='mb-2 block text-sm text-[#848484]'>
                  Proof of Ownership
                </label>
              }
              setFiles={handleFileChange}
            />
          </section>

          <section className='mt-10 flex items-center'>
            <Image
              src={PlusIcon}
              alt='add new image'
              objectFit='contain'
              className='cursor-pointer'
              height={27}
              width={27}
              onClick={() => setAdditionalFiles(!additionalFiles)}
            />
            <p className='ml-6 text-base font-bold text-black'>
              Add another file
            </p>
          </section>
          {additionalFiles && (
            <FileUpload
              className='mt-4'
              label={
                <label className='mb-2 block text-sm text-[#848484]'>
                  Additional Files
                </label>
              }
              setFiles={handleFileChange}
            />
          )}

          {files && files.length > 0 ? (
            <>
              {files.map((file) => (
                <section
                  key={file.name}
                  className='mt-2 flex w-1/2 items-center justify-between'
                >
                  <p className='mb-4 text-sm font-bold text-black'>
                    {file.name}
                  </p>
                  <Image
                    onClick={() =>
                      setFiles(files.filter((item) => item.name !== file.name))
                    }
                    src={Delete}
                    alt='Property name'
                    className='cursor-pointer object-contain'
                    height={12}
                    width={12}
                  />
                </section>
              ))}
            </>
          ) : null}
        </section>
      </section>
      <section className='mt-20 flex items-center justify-between'>
        <section>
          <Link
            href={'/dashboard?tab=listings'}
            className='rounded-full border border-solid border-black bg-transparent px-14 py-2 text-black'
          >
            Cancel
          </Link>
        </section>
        <section className='flex items-center gap-x-4'>
          <Link
            href={'/dashboard?tab=listings'}
            className='rounded-full border-0 bg-transparent px-14 py-2 text-black'
          >
            Later
          </Link>

          <TransRoundedButton
            disabled={isLoading}
            label='Continue'
            onClick={handleSubmit(onSubmit)}
  
            loading={isLoading}
            variant='primary'
            className='border border-solid border-black bg-black px-14 py-2 text-white'
          />
        </section>
      </section>
     
    </section>
  );
};

export default ListingDetailsPage;
