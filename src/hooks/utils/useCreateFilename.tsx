import { useAuth } from '@/shared/hooks/useAuth';

// userId/actionType(propertyDocUpload)/fileName_timestamp.ext

export enum UploadAction {
  PROPERTY_DOCUMENT = 'propertyDocUpload',
  OFFER_DOCUMENT = 'offerDocUpload',
  IMAGE_FILE = 'imageFileUpload',
  PROPERTY_IMAGE = 'propertyImageUpload',
}

function useCreateFilename() {
  const { user } = useAuth();
  const currentUser = user?.id;
  const timestamp = new Date()?.toISOString();

  const modifyFileName = (fileName: string, action: UploadAction) => {
    return `${currentUser}/${action}/${fileName}/${timestamp}`;
  };

  return {
    modifyFileName,
  };
}

export default useCreateFilename;
