import useS3Upload, { IAwsFile } from '@/hooks/api/useAwsUpload';
import useCreateFilename, {
  UploadAction,
} from '@/hooks/utils/useCreateFilename';
import { FileWithPath } from '@/interfaces/file.interface';
import { truncateText } from '@/lib/utils';
import { CheckCheck, Loader, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ButtonLoader } from '../../loader';

type FilePrevieProp = {
  file: FileWithPath;
  uploadType: UploadAction;
  setUrl: (url: string) => void;
};
export const FilePreviewCard = ({
  file,
  uploadType,
  setUrl,
}: FilePrevieProp) => {
  const imageUrl = URL.createObjectURL(file);
  const { modifyFileName } = useCreateFilename();
  const { uploadFile } = useS3Upload();
  const [loading, setLoading] = useState(false);
  const [imageLink, setImageLink] = useState('');

  const handleFileUpload = async () => {
    setLoading(true);
    try {
      const modifiedFile = new File(
        [file],
        modifyFileName(file.name, uploadType),
        {
          type: file.type,
        },
      );
      const data: IAwsFile | undefined = await uploadFile(modifiedFile);
      setUrl(data?.Location!);
      setImageLink(data?.Location!);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-between gap-x-4'>
      <div className='flex items-center gap-x-4'>
        <div className='relative h-20 w-20'>
          {file.type === 'application/pdf' ? (
            <Image
              fill
              src='/assets/images/pdf.svg'
              alt='Pdf Logo'
              className='relative h-full w-full'
            />
          ) : (
            <Image
              fill
              src={imageUrl}
              alt='image'
              onLoad={() => URL.revokeObjectURL(imageUrl)}
              className='relative h-full w-full'
            />
          )}
        </div>
        <span>{truncateText(file.name, 10)}</span>
      </div>

      <div className='span'>
        {loading ? (
          <ButtonLoader />
        ) : (
          <section>
            {!loading && imageLink ? (
              <CheckCheck color='green' />
            ) : (
              <UploadCloud
                className='cursor-pointer'
                onClick={handleFileUpload}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
};
