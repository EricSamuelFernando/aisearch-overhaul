import * as yup from 'yup';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { atomWithMutation } from 'jotai-tanstack-query';
import { useForm, Control } from 'react-hook-form';

import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { urlAtom, useGetPresignedUrl } from './useGetPresignedUrl';
import { success, error } from '@/components/alert/notify';

interface CoOwner {
  name?: string;
  email?: string;
}

interface ProofDocument {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
}

type IApiFormat = {
  propertyOwnershipDetails: {
    nameOnProperty: string;
    email: string;
    coOwners: CoOwner[];
  };
  proofOfOwnership: ProofDocument[];
  additionalDocuments: ProofDocument[];
  propertyId: string;
};

// Define the form values type
type IOwnershipDetailsProps = {
  name_on_property: string;
  email: string;
  coOwners?: CoOwner[];
};

// Define return type for useVerifyOwnership
type UseVerifyOwnershipReturn = {
  handleSubmit: () => Promise<void>;
  control: Control<IOwnershipDetailsProps>;
  errors: any; // Adjust to be more specific if needed
  isValid: boolean;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
  files: File[] | null;
  presignedUrls: any; // Adjust based on actual return type from `useGetPresignedUrl`
  isLoading: boolean;
  presignedUrlStatus: any; // Adjust if needed
  uploadUrlStatus: any; // Adjust if needed
  uploadedUrls: any; // Adjust if needed
  getURLs: () => void;
  fileNames: string[];
  seturlAtom: (value: string[]) => void;
};

const verifyOwnership = atomWithMutation(() => ({
  mutationKey: ['verify-ownership'],
  mutationFn: async (value: IApiFormat) => {
    console.log(value);

    return await client
      .post(`property/verify/property/ownership/${value.propertyId}`, value)
      .then(pickResult, pickErrorMessage);
  },
}));

// Validation schema
const coOwnerSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'The name is too short.')
    .max(55, 'The name is too long.')
    .matches(/^[a-zA-Z\s-]+$/, 'The name contains special characters.')
    .optional(),
  email: yup
    .string()
    .email('The email must be a valid email address.')
    .optional(),
});
const schema = yup.object().shape({
  name_on_property: yup
    .string()
    .min(3, 'The name is too short.')
    .max(55, 'The name is too long.')
    .matches(/^[a-zA-Z\s-]+$/, 'The name contains special characters.')
    .required('The name is required.'),
  email: yup
    .string()
    .email('The email must be a valid email address.')
    .required('The email is required.'),
  coOwners: yup.array().of(coOwnerSchema),
});

export const useVerifyOwnership = (id: string): UseVerifyOwnershipReturn => {
  const router = useRouter();
  const [_, seturlAtom] = useAtom(urlAtom);
  const [{ mutateAsync, data, isPending }] = useAtom(verifyOwnership);
  const {
    presignedUrls,
    loading,
    presignedUrlStatus,
    uploadUrlStatus,
    uploadedUrls,
    getURLs,
    uploadToPresignedUrl,
  } = useGetPresignedUrl();
  const [files, setFiles] = useState<File[] | null>([]);
  const [keys, setKeys] = useState<string[] | null>([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<IOwnershipDetailsProps>({
    defaultValues: {
      name_on_property: '',
      email: '',
      coOwners: [{ name: '', email: '' }],
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const fileNames = files ? files.map((file) => file.name) : [];

  const onSubmit = async (data: IOwnershipDetailsProps) => {
    // if (files) {
    //   seturlAtom(fileNames)
    //   await getURLs()
    // }
  };

  const verify = async () => {
    if (presignedUrls && files && files.length > 0) {
      for (const file of files) {
        const presignedFile = presignedUrls.successfullFiles.find(
          (f: any) => f.filename === file.name,
        );
        if (presignedFile && presignedFile.uploadUrl) {
          await uploadToPresignedUrl({
            file,
            presignedUrl: presignedFile.uploadUrl,
          });
          setKeys((prev) =>
            prev ? [...prev, presignedFile.key] : [presignedFile.key],
          );
        }
      }

      const proofOfOwnership: ProofDocument[] =
        files.map((file: File) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          thumbNail: '',
          documentType: file.type,
        })) || [];

      const additionalDocuments: ProofDocument[] =
        files.map((file: File) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          thumbNail: '',
          documentType: file.type,
        })) || [];

      await mutateAsync({
        propertyOwnershipDetails: {
          nameOnProperty: getValues('name_on_property'),
          email: getValues('email'),
          coOwners: getValues('coOwners') || [],
        },
        proofOfOwnership,
        additionalDocuments,
        propertyId: id,
      });
    }
  };

  useEffect(() => {
    verify();
  }, [presignedUrls]);

  useEffect(() => {
    if (data) {
      if (!toast.isActive('useverify-ownership-toast')) {
        success({ message: 'Property verification process has been successfully started.' });
      }

      router.push('/dashboard/seller/listing/pending-verification');
      reset();
    }
  }, [data]);

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    errors,
    isValid:
      getValues('name_on_property').length > 1 && getValues('email').length > 5,
    setFiles,
    files,
    presignedUrls,
    isLoading: loading || isPending,
    presignedUrlStatus,
    uploadUrlStatus,
    uploadedUrls,
    getURLs,
    fileNames,
    seturlAtom,
  };
};
