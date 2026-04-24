const DEFAULT_DEV_JWT_SECRET = 'your-secret-key-here';
const DEFAULT_JWT_EXPIRY = '24h';

function createConfigError(message) {
  const error = new Error(message);
  error.statusCode = 500;
  error.code = 'JWT_CONFIG_MISSING';
  return error;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET && process.env.JWT_SECRET.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEFAULT_DEV_JWT_SECRET;
  }

  throw createConfigError('JWT_SECRET is missing. Please set it in the service environment.');
}

function getJwtExpiry() {
  const expiry = process.env.JWT_EXPIRY && process.env.JWT_EXPIRY.trim();
  return expiry || DEFAULT_JWT_EXPIRY;
}

module.exports = {
  getJwtSecret,
  getJwtExpiry
};
