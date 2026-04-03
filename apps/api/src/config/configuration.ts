export default () => ({
  port: parseInt(process.env.API_PORT || '3000', 10),
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME || 'cryptovault',
    user: process.env.DATABASE_USER || 'cryptovault',
    password: process.env.DATABASE_PASSWORD || 'cryptovault_dev',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    expiresIn: '1h',
  },

  taurus: {
    apiUrl: process.env.TAURUS_API_URL || 'https://api.sandbox.taurusprotect.com',
    apiKey: process.env.TAURUS_API_KEY || '',
    apiSecret: process.env.TAURUS_API_SECRET || '',
    webhookSecret: process.env.TAURUS_WEBHOOK_SECRET || '',
  },

  sumsub: {
    appToken: process.env.SUMSUB_APP_TOKEN || '',
    secretKey: process.env.SUMSUB_SECRET_KEY || '',
    webhookSecret: process.env.SUMSUB_WEBHOOK_SECRET || '',
    levelName: process.env.SUMSUB_LEVEL_NAME || 'cryptovault-kyc',
  },

  chainalysis: {
    apiKey: process.env.CHAINALYSIS_API_KEY || '',
    apiUrl: process.env.CHAINALYSIS_API_URL || 'https://api.chainalysis.com/api/kyt/v2',
  },

  notabene: {
    apiKey: process.env.NOTABENE_API_KEY || '',
    vaspDid: process.env.NOTABENE_VASP_DID || '',
    apiUrl: process.env.NOTABENE_API_URL || 'https://api.notabene.id',
  },

  salesforce: {
    clientId: process.env.SF_CLIENT_ID || '',
    clientSecret: process.env.SF_CLIENT_SECRET || '',
    instanceUrl: process.env.SF_INSTANCE_URL || '',
    webhookSecret: process.env.SF_WEBHOOK_SECRET || '',
  },
});
