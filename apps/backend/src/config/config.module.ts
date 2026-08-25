import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './env.validation';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  validate,
});

export type AppConfig = ConfigService<Env>;

interface Env {
  NODE_ENV: string;
  DATABASE_URL: string;
  DIRECT_DATABASE_URL: string;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  FRONTEND_URL: string;
}
