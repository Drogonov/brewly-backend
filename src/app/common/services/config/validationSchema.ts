import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid(
    'development',
    'production',
    'example',
  ).default('development'),
  DATABASE_URL: Joi.string(),
  APP_PORT: Joi.number(),
  AT_SECRET: Joi.string(),
  RT_SECRET: Joi.string(),
  BREVO_API_KEY: Joi.string(),
  OTP_DEV: Joi.string(),
  APP_STORE_URL: Joi.string(),
  TELEGRAM_URL: Joi.string(),
  PRIVACY_POLICY_URL: Joi.string(),
});