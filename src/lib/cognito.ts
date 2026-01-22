import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

export interface SignUpParams {
  email: string;
  password: string;
  attributes?: Record<string, string>;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface VerifyParams {
  email: string;
  code: string;
}

export class CognitoAuth {
  /**
   * Sign up a new user
   */
  static async signUp({ email, password, attributes = {} }: SignUpParams): Promise<any> {
    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = Object.entries(attributes).map(
        ([Name, Value]) => new CognitoUserAttribute({ Name, Value })
      );

      // Add email attribute if not present
      if (!attributes.email) {
        attributeList.push(new CognitoUserAttribute({ Name: 'email', Value: email }));
      }

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Confirm sign up with verification code
   */
  static async confirmSignUp({ email, code }: VerifyParams): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Resend confirmation code
   */
  static async resendConfirmationCode(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Login user
   */
  static async login({ email, password }: LoginParams): Promise<any> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required scenario
          reject(new Error('New password required'));
        },
      });
    });
  }

  /**
   * Get current user
   */
  static getCurrentUser(): CognitoUser | null {
    return userPool.getCurrentUser();
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.getCurrentUser();
      if (!cognitoUser) {
        reject(new Error('No current user'));
        return;
      }

      cognitoUser.getSession((err: any, session: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(session);
      });
    });
  }

  /**
   * Logout user
   */
  static logout(): void {
    const cognitoUser = this.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }

  /**
   * Forgot password - initiate
   */
  static async forgotPassword(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  /**
   * Confirm forgot password
   */
  static async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve({ success: true });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }
}

export default CognitoAuth;


