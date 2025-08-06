import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN: string = '24h';

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT: number = 4007;

  @IsOptional()
  @IsUrl()
  FRONTEND_URL: string = 'http://localhost:3000';

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsOptional()
  @IsUrl()
  GOOGLE_CALLBACK_URL: string;

  @IsOptional()
  @IsString()
  SMS_API_KEY: string;

  @IsOptional()
  @IsString()
  SMS_BASE_URL: string;

  @IsOptional()
  @IsString()
  SMS_SENDER: string;
}
