'use client';

import { Icons } from '@/components/icons';
import { Button, ButtonProps } from '@/components/ui/button';
import { FileWithPath } from '@/interfaces/file.interface';
import { Dropzone } from '@mantine/dropzone';
import { useRef } from 'react';
import { cn } from '../lib/utils';

export interface Accept {
  [key: string]: string[];
}
type Props = {
  setFiles: (files: FileWithPath[]) => void;
  files?: FileWithPath[];
  multiple?: boolean;
  accept?: string[] | Accept;
  loading?: boolean;
  className?: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
  dropdownText?: React.ReactNode;
};

function HorizontalDropzone({
  setFiles,
  multiple = false,
  loading = false,
  accept,
  className,
  buttonProps = { className: '' },
  dropdownText = 'Drag and drop JPEG or PNG images here',
  buttonText = 'Upload from Computer',
}: Props) {
  const openRef = useRef<() => void>(null);
  const { className: btnClass = '', ...rest } = buttonProps!;
  return (
    <Dropzone
      openRef={openRef}
      onDrop={setFiles}
      activateOnClick={true}
      multiple={multiple}
      classNames={{
        root: cn(
          'border-dashed relative border-[1px] border-black flex flex-col justify-between py-4  rounded-lg text-center bg-grey-880 p-4',
          className,
        ),
      }}
      accept={accept}
    >
      <p className='my-4 flex-1 text-sm text-grey-850'>{dropdownText}</p>
      <Button
        onClick={() => openRef.current?.()}
        className={cn('mb-6 w-max px-4 text-xs', btnClass)}
        {...rest}
      >
        {buttonText}
      </Button>

      {loading ? (
        <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/70'>
          <Icons.Loader />
        </div>
      ) : null}
    </Dropzone>
  );
}

const FileIcon = () => (
  <svg
    width='56'
    height='53'
    viewBox='0 0 56 53'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <rect x='23.5' y='24.5' width='32' height='28' stroke='#6F6F6F' />
    <path
      d='M1.008 0V0.918728H0V3.79875H1.44V1.44001H3.88801V0H1.008ZM5.32801 0V1.44001H8.20802V0H5.32801ZM9.64802 0V1.44001H12.528V0H9.64802ZM13.968 0V1.44001H16.848V0H13.968ZM18.288 0V1.44001H21.168V0H18.288ZM22.608 0V1.44001H25.4881V0H22.608ZM26.9281 0V1.44001H29.8081V0H26.9281ZM31.2481 0V1.44001H32.1121V2.01602H33.5521V0H31.2481ZM32.1121 3.45603V6.33606H33.5521V3.45603H32.1121ZM0 5.23829V8.11831H1.44V5.23829H0ZM32.1121 7.77607V10.6561H33.5521V7.77607H32.1121ZM0 9.55881V12.4388H1.44V9.55881H0ZM32.1121 12.0961V14.9761H33.5521V12.0961H32.1121ZM0 13.8788V16.7589H1.44V13.8788H0ZM32.1121 16.4161V19.2962H33.5521V16.4161H32.1121ZM0 18.1989V21.0789H1.44V18.1989H0ZM32.1121 20.7362V23.6162H33.5521V20.7362H32.1121ZM0 22.5189V25.3989H1.44V22.5189H0ZM32.1121 25.0562V27.9363H33.5521V25.0562H32.1121ZM0 26.839V29.3307H1.82832V27.8906H1.44V26.8394L0 26.839ZM3.26833 27.8906V29.3307H6.14833V27.8906H3.26833ZM7.58834 27.8906V29.3307H10.4683V27.8906H7.58834ZM11.9083 27.8906V29.3307H14.7884V27.8906H11.9083ZM16.2284 27.8906V29.3307H19.1084V27.8906H16.2284ZM20.5484 27.8906V29.3307H23.4284V27.8906H20.5484ZM24.8684 27.8906V29.3307H27.7484V27.8906H24.8684ZM29.1884 27.8906V29.3307H32.0684V27.8906H29.1884ZM33.8194 28.8022C33.6734 28.7931 33.5272 28.8162 33.3911 28.87C33.255 28.9238 33.1325 29.0068 33.0321 29.1133C32.9318 29.2198 32.8561 29.3471 32.8105 29.4861C32.7649 29.6251 32.7505 29.7725 32.7682 29.9177L34.274 46.0823C34.37 46.8671 35.2988 47.2339 35.9046 46.7255L39.0836 44.1474L40.5087 46.6156C41.3281 48.0355 42.6289 48.384 44.0487 47.5646C45.4681 46.7447 45.8171 45.4444 44.9972 44.0246L43.5769 41.5645L47.3439 40.1207C48.087 39.85 48.2343 38.8631 47.6027 38.3874L34.3566 28.9999C34.2007 28.8828 34.014 28.8141 33.8194 28.8022Z'
      fill='#6F6F6F'
    />
  </svg>
);

export function VerticalDropzone({
  setFiles,
  multiple = false,
  loading = false,
  accept,
}: Props) {
  const openRef = useRef<() => void>(null);

  return (
    <Dropzone
      openRef={openRef}
      onDrop={setFiles}
      multiple={multiple}
      accept={accept}
      activateOnClick={false}
    >
      <div className='flex h-[18.375rem] w-[14.313rem] cursor-pointer flex-col justify-between divide-dashed rounded-md border border-dashed border-[#707070] bg-transparent'>
        <div className='flex flex-auto items-center justify-center p-12'>
          <FileIcon />
        </div>

        <div className='flex flex-col items-center justify-center space-y-2 py-4 text-center'>
          <p className='px-8 text-lg'>Drop your documents here</p>
          <Button
            onClick={() => openRef.current?.()}
            className='w-max px-6 text-white'
            roundness='full'
          >
            Browse Files
          </Button>
        </div>
      </div>
    </Dropzone>
  );
}

export default HorizontalDropzone;
