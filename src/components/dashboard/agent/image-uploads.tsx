'use client';

import HorizontalDropzone from '@/components/file-dropzone';
import useS3Upload, { IAwsFile } from '@/hooks/api/useAwsUpload';
import useCreateFilename, {
  UploadAction,
} from '@/hooks/utils/useCreateFilename';
import { FileWithPath } from '@/interfaces/file.interface';
import { ImageInterface } from '@/interfaces/property.interface';
import { MIME_TYPES } from '@mantine/dropzone';
import { Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import CreateListConatiner from './create-list-container';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';

const ImageUploads = () => {
  const { filters, setFilter } = useAgentCreatePropertyContext();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [fileUrls, setFileUrls] = useState<Partial<ImageInterface>[]>(
    filters.images || [],
  );
  const { uploadFile } = useS3Upload();

  const { modifyFileName } = useCreateFilename();

  const handleSetFileUrl = (url: string) => {
    setFileUrls((prev) => [...prev, { url, thumbNail: url }]);
  };

  const handleSetFile = async (files: FileWithPath[]) => {
    // setFiles((prev) => [...prev, ...files]);
    await handleFileUpload(files[0]);
  };

  const uploadType = UploadAction.PROPERTY_IMAGE;

  const handleFileUpload = async (file: FileWithPath) => {
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
      setFileUrls((prev) => [
        ...prev,
        { url: data?.Location, thumbNail: data?.Location },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = (name: string) => {
    setFileUrls((state) => state.filter((item) => item.url !== name));
  };

  React.useEffect(
    () =>
      setFilter({
        field: 'images',
        value: fileUrls,
      }),
    [fileUrls, setFilter],
  );

  return (
    <CreateListConatiner
      className='p-[4rem]'
      form={
        <section>
          <form>
            <HorizontalDropzone
              setFiles={handleSetFile}
              files={files}
              multiple={true}
              accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
              loading={loading}
            />
            <div className='mt-4 flex flex-wrap items-center gap-3'>
              {fileUrls.map((image) => (
                <div key={image.url} className='relative h-[90px] w-[120px]'>
                  <img
                    src={image.thumbNail!}
                    alt={`image-${image.thumbNail}`}
                    className='h-full w-full object-contain'
                    fetchPriority='high'
                  />
                  <Trash2
                    onClick={() => deleteImage(image.url!)}
                    className='text-red absolute right-1 top-2 '
                  />
                </div>
              ))}
            </div>
          </form>
        </section>
      }
      heading={'Would you like to Add images now?'}
      subHeading={
        <div>
          <p>Image Photo</p>
          <p className='text-base font-normal leading-9 text-grey-520'>
            (Optional)
          </p>
        </div>
      }
    />
  );
};

export default ImageUploads;
