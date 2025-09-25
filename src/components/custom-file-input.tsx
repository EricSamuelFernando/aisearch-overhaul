import React from 'react';

const CustomFileInputBuyer = ({ handleFile }: { handleFile: any }) => {
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  return (
    <div className='flex h-48 w-full cursor-pointer items-center justify-center border border-dashed border-[#707070] bg-[#F5F8FA] py-10'>
      <div className='flex h-44 w-full items-center justify-center'>
        <label className='flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-5'>
          <input type='file' hidden onChange={handleFileChange} />
          <p className='text-sm text-[#707070]'>
            Drag and drop Pdf, JPEG or PNG files here
          </p>

          <button
            className='mt-10 w-fit rounded-[10px] border border-solid border-black bg-black px-8 py-3 font-medium text-white'
            onClick={(e) => {
              e.preventDefault();
              const inputElement = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              if (inputElement) {
                inputElement.click();
              }
            }}
          >
            Upload from computer
          </button>
        </label>
      </div>
    </div>
  );
};

export { CustomFileInputBuyer };
