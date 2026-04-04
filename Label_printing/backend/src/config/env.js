import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment configuration object
const envConfig = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
};

// Validation: Check required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

requiredEnvVars.forEach((varName) => {
  if (!envConfig[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Log configuration on startup (sensitive values hidden)
console.log('✓ Environment Configuration Loaded:');
console.log(`  - Server Port: ${envConfig.PORT}`);
console.log(`  - Node Environment: ${envConfig.NODE_ENV}`);
console.log(`  - Database Host: ${envConfig.DB_HOST}`);
console.log(`  - Database Port: ${envConfig.DB_PORT}`);
console.log(`  - Database Name: ${envConfig.DB_NAME}`);
console.log(`  - Database User: ${envConfig.DB_USER}`);

export default envConfig;
