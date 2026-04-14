

// export default registerAs('database', () => DB_CONFIG);
import { registerAs } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
export const DB_CONFIG = {
  dialect: 'mssql',
  host: process.env.DB_HOST || 'localhost', // Use environment variable or fallback
  database: process.env.DB_NAME || 'PearlsOfLife',
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'pakistan1@',
  port: parseInt(process.env.DB_PORT) || 1433,

  dialectOptions: {
    options: {
      encrypt: false, // true for production
      trustServerCertificate: true, // true for development
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 30000,
  },

  // Recommended logging configuration
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

export default registerAs('database', () => DB_CONFIG);
