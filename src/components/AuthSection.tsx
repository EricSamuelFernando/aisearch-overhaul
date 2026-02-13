'use client';

import React, { createContext, useContext } from 'react';
import Image from 'next/image';
import { useAppDispatch } from '@/lib/hook';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { InputField } from '@/components/ui/propertyInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FileUpload } from './file-upload';
import { Icons } from './icons';
import useFileUpload from '@/hooks/api/UseFileUpload';

import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';

import useTimer from './timer';
import { Button } from './ui/button';
import SellerAddAgent from './sell/seller-add-agent';
import { error } from '@/components/alert/notify';
import { useSellerPropertiesContext } from '@/providers/seller-property-context';
import { useAgentList } from '@/shared/hooks/useAgentList';
import { useAtom } from 'jotai';
import { claimPropertyAtom } from '@/hooks/claim-property-atom';

type CustomFile = {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
};

const AuthSection: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // const { isVerified, startTime } = useSelector(
  //   (state: RootState) => state.verification
  // )
  const { startTimer, stopTimer, timeLeft } = useTimer({
    initialTimeLeft: 2 * 60 * 1000,
  });

  const [currentProperty] = useAtom(claimPropertyAtom);

  console.log('currentProperty', currentProperty);

  const { verifyOwnership, addAgentToProperty } = useHandleAgent();
  const [step, setStep] = React.useState(1);
  const [nameOnProperty, setNameOnProperty] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [showFileInput, setShowFileInput] = React.useState(true);
  const [verificationMessage, setVerificationMessage] = React.useState('');
  const [agentEmail, setAgentEmail] = React.useState('');
  const { agentInvited, setAgentIsInvited } = useAgentList();

  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const {
    files,
    uploadProgress,
    uploadResults,
    isUploading,
    setFiles,
    handleUpload,
    fileKeys,
  } = useFileUpload();

  const handleAddAnotherFile = () => {
    setShowFileInput(true);
  };

  const handleLaterButtonClick = () => {
    window.location.href = '/dashboard?tab=listings';
  };

  const handleContinueVerification = async () => {
    try {
      const propertyOwnershipDetails = {
        nameOnProperty,
        email,
      };
      await handleUpload();

      const proofOfOwnership =
        Object.values(files).flatMap((fileArray: File[] | null) => {
          if (!fileArray) return [];

          const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ];

          return fileArray
            .filter((file) => {
              if (!allowedTypes.includes(file.type)) {
                error({
                  message:
                  'The file you uploaded is not supported. Please upload a document in one of the following formats: .pdf, .doc, .docx, or .txt. If you believe this is an error, please try again or contact support.',
                });
                return false;
              }
              return true;
            })
            .map((file: File) => ({
              name: file.name,
              url: URL.createObjectURL(file),
              thumbNail: '',
              documentType: file.type,
            }));
        }) || [];

      const propertyId = id || '';

      await verifyOwnership.mutateAsync({
        propertyOwnershipDetails,
        proofOfOwnership,
        propertyId,
      });

      startTimer();
      setStep(3);
    } catch (error) {
      console.error('Error while initiating verification:', error);
    }
  };

  const handleNextStep = () => {
    setStep(4);
  };

  const handleSaveAndContinue = () => {
    if (step === 4 && agentInvited) {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  return (
    <section className='h-[calc(90vh)] overflow-hidden bg-[#F7F2EB] pb-5'>
      <section className='flex h-full flex-col overflow-hidden rounded-tl-[3.125rem] rounded-tr-[3.125rem] px-10 pt-8'>
        <section
          className={`grid flex-grow py-10 ${step <= 3 ? 'grid-cols-3 gap-30' : ''}`}
        >
          {step <= 3 && <Card className='col-span-1 h-full w-full' />}
          <section
            className={`${
              step <= 3 ? 'col-span-2' : 'col-span-1'
            } flex flex-col justify-center px-10`}
          >
            {step === 1 && (
              <section className='pl-20 text-left'>
                <div className='inline-block text-left'>
                  <SectionHeader title='Verify Ownership' />
                  <p className='text-xl font-medium'>
                    Proceed to have full control of this property here
                  </p>
                </div>
              </section>
            )}

            {step === 2 && (
              <>
                <SectionHeader title='Enter Owner’s Details' />
                <section>
                  <section className='flex w-full items-center justify-between'>
                    <InputField
                      label='Name on property'
                      name='Name on property'
                      placeholder='Enter name on property'
                      value={nameOnProperty}
                      onChange={(e) => setNameOnProperty(e.target.value)}
                    />
                    <InputField
                      type='email'
                      label='Email'
                      name='email'
                      placeholder='Enter email'
                      value={email}
                      className='mr-0'
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </section>
                  <span className='mt-6 block' />
                  <FileUpload
                    setFile={(file: FileList) => {
                      setFiles('Proof of Ownership', file);
                    }}
                    label={
                      <label className='flex items-center gap-x-1'>
                        <span>Proof of Ownership</span>{' '}
                        <Icons.Warning className='h-4 w-4' />
                      </label>
                    }
                  />
                </section>
                <section
                  className='flex items-center'
                  onClick={handleAddAnotherFile}
                >
                  <Image
                    src='/assets/images/add.svg'
                    alt='add new image'
                    objectFit='contain'
                    height={24}
                    width={24}
                  />
                  <p className='ml-3 text-[1rem] font-bold text-black'>
                    Add another file
                  </p>
                </section>
              </>
            )}
            {step === 3 && (
              <section className='text-left'>
                <div className='inline-block text-left'>
                  <SectionHeader title='Verification Pending' />
                  <p className='text-xl font-medium'>
                    Your property is undergoing verification
                  </p>
                  {verificationMessage && (
                    <p className='mt-4 text-xl font-medium text-green-500'>
                      {verificationMessage}
                    </p>
                  )}
                </div>
              </section>
            )}
            {step === 4 && (
              <SellerAddAgent
                onBack={() => setStep(3)}
                onSaveAndContinue={handleSaveAndContinue}
                setAgentInvited={setAgentIsInvited}
                agentInvited={agentInvited}
              />
            )}
          </section>
        </section>
        <section className=' mt-auto flex items-center justify-between py-6'>
          {step !== 3 && step !== 4 && (
            <Button
              roundness='full'
              variant='outline'
              className='border-[1px] border-black px-10 py-1 font-bold text-black'
              onClick={() => router.push('/dashboard/seller/listing/new')}
            >
              <span>Cancel</span>
            </Button>
          )}
          {step === 3 && (
            <Button
              roundness='full'
              variant='outline'
              className='border-[1px] border-black px-10 py-1 font-bold text-black'
              onClick={() => {
                setStep(2);
                setAgentIsInvited(false);
              }}
            >
              <span>Back</span>
            </Button>
          )}

          <section className='flex items-center'>
            {step === 1 && (
              <>
                <p
                  className='mr-8 cursor-pointer text-lg font-bold text-black'
                  onClick={handleLaterButtonClick}
                >
                  Later
                </p>
                <Button
                  roundness='full'
                  variant='default'
                  className='border-[1px] px-12 py-1 font-bold text-white'
                  onClick={() => setStep(2)}
                >
                  <span>Start</span>
                </Button>
              </>
            )}
            {step === 2 && (
              <section className='flex items-center'>
                <p
                  className='cursor-pointer text-lg font-bold text-black'
                  onClick={handleLaterButtonClick}
                >
                  Later
                </p>

                <div className='ml-4'>
                  <Button
                    roundness='full'
                    variant='default'
                    className='border-[1px] px-12 py-1 font-bold text-white'
                    onClick={handleContinueVerification}
                  >
                    <span>Start</span>
                  </Button>
                </div>
              </section>
            )}
            {step === 3 && (
              <section className='flex items-center'>
                <div className='ml-4'>
                  <Button
                    roundness='full'
                    variant='default'
                    className='border-[1px] px-10 py-1 font-bold text-white'
                    onClick={handleNextStep}
                  >
                    <span>{agentInvited ? 'Save & Continue' : 'Continue'}</span>
                  </Button>
                </div>
              </section>
            )}
          </section>
        </section>
      </section>
    </section>
  );
};

export default AuthSection;
