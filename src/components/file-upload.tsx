import * as React from 'react';
import { cn } from '../lib/utils';
export interface FileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  setFile: (file: FileList) => void;
  initialFile?: FileList;
  inputClassName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  setFile,
  className,
  initialFile,
  inputClassName,
  type = 'file',
  ...props
}) => {
  const [file, setLocalFile] = React.useState<FileList | null>(null);

  React.useEffect(() => {
    if (initialFile) {
      setLocalFile(initialFile);
    }
  }, [initialFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      setFile(event.target.files);
    }
  };

  return (
    <div className={cn('mb-4 w-full', className)}>
      {label ? (
        <label className='block pb-2 text-sm font-medium text-gray-700'>
          {label}
        </label>
      ) : null}

      <div className='mt-1'>
        <input
          type={type}
          onChange={handleFileChange}
          className={cn(
            `block w-full cursor-pointer rounded-md border-[.5px] border-[#707070] text-sm text-gray-500
                     file:mr-4
                     file:cursor-pointer file:rounded-l-md file:border-0
                     file:bg-black file:px-4
                     file:py-4 file:text-sm
                     file:font-semibold  file:text-white
                     hover:file:bg-black/90`,
            inputClassName,
          )}
          {...props}
        />
      </div>
    </div>
  );
};
