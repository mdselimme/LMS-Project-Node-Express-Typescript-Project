import dotenv from 'dotenv';
dotenv.config();

interface IEnvVariables {
  PORT: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DB_URL: string;
  FROENT_END_LINK: string;

  bcrypt_salt_rounds: string;

  jwt_access_secret: string;
  jwt_access_expires_in: string;
  jwt_refresh_secret: string;
  jwt_refresh_expires_in: string;

  jwt_forget_password_access: string;

  forgot_password_time: string;

  provider_email: string;
  provider_email_app_password: string;
}

// Load and validate environment variables
const loadEnvVariables = (): IEnvVariables => {
  const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'DB_URL',
    'FRONT_END_LINK',

    'BCRYPT_SALT_ROUNDS',

    'JWT_ACCESS_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES_IN',

    'JWT_FORGET_PASSWORD_ACCESS',

    'FORGOT_PASSWORD_TIME',

    'PROVIDER_EMAIL',
    'PROVIDER_EMAIL_APP_PASSWORD',
  ];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(
        `Environment variable ${varName} is not set. Please define it in the .env file.`,
      );
    }
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    DB_URL: process.env.DB_URL as string,
    FROENT_END_LINK: process.env.FROENT_END_LINK as string,

    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS as string,

    jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN as string,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string,

    jwt_forget_password_access: process.env.JWT_FORGET_PASSWORD_ACCESS as string,

    forgot_password_time: process.env.FORGOT_PASSWORD_TIME as string,

    provider_email: process.env.PROVIDER_EMAIL as string,
    provider_email_app_password: process.env.PROVIDER_EMAIL_APP_PASSWORD as string,
  };
};

export const envVars = loadEnvVariables();
