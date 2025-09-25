import $http from 'axios';
import { mlsDeploymentEnv } from '@/shared/constants/env';

const aiClient = $http.create({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  // baseURL: mlsDeploymentEnv,
});

export default aiClient;
