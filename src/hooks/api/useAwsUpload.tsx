import {
  awsAccessKey,
  awsS3BucketName,
  awsSecretKey,
} from '@/shared/constants/env';
import AWS from 'aws-sdk';
import { error, success } from '../../components/alert/notify';

export interface IAwsFile {
  Bucket: string;
  Location: string;
  Key: string;
}

const useS3Upload = () => {
  const uploadFile = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    const s3 = new AWS.S3({
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    });

    const params = {
      Bucket: awsS3BucketName,
      Key: selectedFile.name,
      Body: selectedFile,
      ContentType: selectedFile.type,
    };

    try {
      const data: IAwsFile = await s3.upload(params).promise();
      success({ message: 'Success! Your file is now uploaded' });
      return data;
    } catch (err: any) {
      error({ message: err?.message });
      throw err;
    }
  };

  return {
    uploadFile,
    // fileUrl,
  };
};

export default useS3Upload;
