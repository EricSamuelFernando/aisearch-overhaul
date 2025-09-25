import React from 'react';

interface CustomFileInputProps {
  handleFile: (files: File[]) => void;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({ handleFile }) => {
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    console.log(file);
    handleFile([file]);
  };

  return (
    <div className='border-black grid h-full w-full cursor-pointer gap-3 rounded-lg border border-black bg-white'>
      <div className='flex items-center justify-center'>
        <label className='flex h-full p-2 w-full items-center justify-center'>
          <input type='file' hidden onChange={handleFileChange} />
          <p className='uppercase'>Change</p>
        </label>
      </div>
    </div>
  );
};

export { CustomFileInput };
