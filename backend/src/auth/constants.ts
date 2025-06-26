// This file contains constants used for authentication in the application.

// JWT secret key used for signing tokens.
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'defaultSecretKey',
};
