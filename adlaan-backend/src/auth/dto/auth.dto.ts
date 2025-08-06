import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber, IsEnum } from 'class-validator';
import { OtpType } from '../../../generated/prisma';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phoneNumber?: string;

  @IsOptional()
  twoFactorEnabled?: boolean = false; // Optional 2FA setting
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class OtpVerificationDto {
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phoneNumber: string;

  @IsString({ message: 'OTP code must be a string' })
  @MinLength(4, { message: 'OTP code must be at least 4 characters long' })
  code: string;

  @IsEnum(OtpType, { message: 'Please provide a valid OTP type' })
  type: OtpType;
}

export class GoogleUserDto {
  @IsString({ message: 'Provider ID must be a string' })
  providerId: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar?: string;
}
