import * as Joi from 'joi';

/**
 * Joi schema used by ConfigModule.forRoot({ validationSchema }) to fail fast at
 * boot time if required environment variables are missing or malformed.
 * Credentials are never hardcoded; everything comes from .env / the environment.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(16),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  CORS_ORIGIN: Joi.string().default('*'),
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
  SUPABASE_BUCKET: Joi.string().default('images'),
  UPLOAD_DEST: Joi.string().default('uploads'),
  UPLOAD_MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024),
  UPLOAD_ALLOWED_MIME_TYPES: Joi.string().default(
    'image/jpeg,image/png,image/gif,image/webp',
  ),
});
