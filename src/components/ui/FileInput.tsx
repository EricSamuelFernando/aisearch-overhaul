import React from 'react';

type CustomFile = {
  name: string;
  url: string;
  thumbNail: string;
  documentType: string;
};

type FileInputProps = {
  label: string;
  file: File | CustomFile | null;
  onFileChange: (file: File) => void;
};

export const FileInput: React.FC<FileInputProps> = ({
  label,
  file,
  onFileChange,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileChange(event.target.files[0]);
    }
  };

  return (
    <label className='mb-8 block '>
      <span className='mb-3 block text-sm font-medium text-[#020202]'>
        {label}
      </span>
      <section className='flex h-[3.25rem] cursor-pointer items-center overflow-hidden rounded-xl overflow-hidden'>
        <input type='file' hidden onChange={handleFileChange} />
        <input
          value={(file as File)?.name || ''}
          disabled={!file}
          type='text'
          name='file-name'
          className=' flex h-[3.25rem]  w-[20%] items-center justify-center border border-[#707070] bg-black px-3 py-2 text-center text-sm placeholder-white focus:border-[#707070] focus:outline-none focus:ring-[#707070]'
          placeholder='Choose file'
        />
        <div className='flex h-full w-full items-center rounded-r-xl border border-grey-850 bg-white pl-20'>
          <p className='text-md text-[#B8B8B8]'>
            {file
              ? (file as File)?.name || (file as CustomFile)?.name
              : 'no file selected'}
          </p>
        </div>
      </section>
    </label>
  );
};
