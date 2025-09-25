import useCloudinary from '@/hooks/api/useCloudinary';
import { useEffect } from 'react';
// import { toast } from 'react-toastify';
import { error, success } from '@/components/alert/notify';

type FileUploadProp = {
  setValue: any;
  fieldKey: string;
  fileType: 'video' | 'image';
  children: React.ReactNode;
};

export const CloudinaryUploadWidget = ({
  setValue,
  fieldKey,
  fileType,
  children,
}: FileUploadProp) => {
  const {
    results,
    errors,
    open: openWidget,
  } = useCloudinary({
    fileType,
  });

  useEffect(() => {
    if (results.length > 0) {
      const resInfo = results.map((item) => item.info);
      const imageUrls = resInfo.map((item) => {
        return {
          url: item.url,
          thumbNail: item.thumbnail_url,
        };
      });
      setValue(fieldKey, [...imageUrls]);
    }
  }, [results]);

  useEffect(() => {
    if (errors.length > 0) {
      error({ message: errors[0].statusText });
    }
  }, [errors]);

  return <div onClick={openWidget}>{children}</div>;
};
