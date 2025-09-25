import {
  Cloudinary,
  Event,
  IErrorResponse,
  UploadInterface,
} from '@/interfaces/cloudinary';
import { useEffect, useRef, useState } from 'react';
import {
  cloudinaryCloudName,
  cloudinaryUploadPreset,
} from '@/shared/constants/env';

const useCloudinary = ({ fileType }: { fileType?: 'video' | 'image' }) => {
  const [widget, setWidget] = useState<any>(null);
  const [uploadResults, setUploadResults] = useState<Event<'success'>[]>([]);
  const [uploadErrors, setUploadErrors] = useState<IErrorResponse[]>([]);

  const widgetRef = useRef<any>();
  let cloudinaryInstance: Cloudinary | undefined;

  useEffect(() => {
    if (!cloudinaryInstance) {
      cloudinaryInstance = (window as any).cloudinary;
    }

    function onIdle() {
      if (!widgetRef.current) {
        widgetRef.current = createWidget();
        setWidget(widgetRef.current);
      }
    }

    'requestIdleCallback' in window
      ? requestIdleCallback(onIdle)
      : setTimeout(onIdle, 1);

    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = undefined;
    };
  }, []);

  function createWidget() {
    const cloudName = cloudinaryCloudName;
    const uploadPreset = cloudinaryUploadPreset;

    if (!cloudName || !uploadPreset) {
      console.warn(`Kindly ensure you have the cloudName and UploadPreset 
      setup in your .env file at the root of your project.`);
    }

    const typeConfig = {
      resourceType: fileType,
      clientAllowedFormats:
        fileType === 'image' ? ['jpg', 'jpeg', 'png', 'gif'] : ['video'],
    };

    const options: UploadInterface = {
      cloudName: cloudName as string,
      uploadPreset: uploadPreset as string,
      ...typeConfig,
    };

    return cloudinaryInstance?.createUploadWidget(
      options,
      function (error: IErrorResponse, result: Event<'success'>) {
        if (error || result.event === 'success') {
          if (error) {
            setUploadErrors((prevErrors) => [...prevErrors, error]);
          } else {
            setUploadResults((prevResults) => [...prevResults, result]);
          }
        }
      },
    );
  }

  function openWidget() {
    if (!widgetRef.current) {
      widgetRef.current = createWidget();
      setWidget(widgetRef.current);
    }
    widgetRef.current && widgetRef.current.open();
  }

  return {
    results: uploadResults,
    errors: uploadErrors,
    open: openWidget,
    widget,
  };
};

export default useCloudinary;
