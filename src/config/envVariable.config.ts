import dotenv from 'dotenv';
dotenv.config();

interface IEnvVariables {
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    DB_URL: string;
    CLIENT_SITE_URL: string;
};

// Load and validate environment variables
const loadEnvVariables = (): IEnvVariables => {

    const requiredEnvVars = [
        'PORT', 'NODE_ENV', 'DB_URL',
        "CLIENT_SITE_URL",
    ];

    requiredEnvVars.forEach((varName) => {
        if (!process.env[varName]) {
            throw new Error(`Environment variable ${varName} is not set. Please define it in the .env file.`);
        }
    });

    return {
        PORT: process.env.PORT as string,
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
        DB_URL: process.env.DB_URL as string,
        CLIENT_SITE_URL: process.env.CLIENT_SITE_URL as string,
    };
};

export const envVars = loadEnvVariables();