import {
  Controller,
  Post,
  Body,
  Response,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, OtpVerificationDto, GoogleTokenDto, CompleteProfileDto } from './dto/auth.dto';
import { Public } from './public.decorator';
import { GoogleAuthGuard } from './google-auth.guard';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { OtpType } from '../../generated/prisma';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) response: FastifyReply,
  ) {
    const user = await this.authService.register(registerDto);
    const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
    
    this.authService.setTokenCookies(response, accessToken, refreshToken);
    
    return {
      message: 'Registration successful',
      user,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) response: FastifyReply,
  ) {
    const result = await this.authService.login(loginDto);
    
    // If OTP is required, don't set cookies yet
    if (result.requiresOtp) {
      return result;
    }
    
    const { accessToken, refreshToken } = this.authService.generateTokens(result.id);
    this.authService.setTokenCookies(response, accessToken, refreshToken);
    
    return {
      message: 'Login successful',
      user: result,
      // Also return tokens in response body (for development)
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() otpDto: OtpVerificationDto,
    @Response({ passthrough: true }) response: FastifyReply,
  ) {
    const user = await this.authService.verifyOtpAndLogin(otpDto);
    const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
    
    this.authService.setTokenCookies(response, accessToken, refreshToken);
    
    return {
      message: 'OTP verification successful',
      user,
    };
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() body: { phoneNumber: string; type: OtpType }) {
    return this.authService.resendOtp(body.phoneNumber, body.type);
  }

  // Google OAuth routes
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // This route initiates Google OAuth
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Request() req: FastifyRequest & { user: any },
    @Response({ passthrough: true }) response: FastifyReply,
  ) {
    const { accessToken, refreshToken } = this.authService.generateTokens(req.user.id);
    
    this.authService.setTokenCookies(response, accessToken, refreshToken);
    
    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    response.redirect(`${frontendUrl}/auth/success`);
  }

  @Public()
  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  async googleTokenAuth(
    @Body() googleTokenDto: GoogleTokenDto,
    @Response({ passthrough: true }) response: FastifyReply,
  ) {
    const user = await this.authService.validateGoogleToken(googleTokenDto.credential);
    const { accessToken, refreshToken } = this.authService.generateTokens(user.id);
    
    // Set HTTP-only cookies (for production)
    this.authService.setTokenCookies(response, accessToken, refreshToken);
    
    return {
      message: 'Google authentication successful',
      user,
      // Also return tokens in response body (for development)
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Response({ passthrough: true }) response: FastifyReply) {
    this.authService.clearTokenCookies(response);
    
    return {
      message: 'Logout successful',
    };
  }

  @Get('profile')
  getProfile(@Request() req: FastifyRequest & { user: any }) {
    return {
      user: req.user,
    };
  }

  @Public()
  @Post('test-sms')
  @HttpCode(HttpStatus.OK)
  async testSms(@Body() testSmsDto: { phone?: string; message?: string }) {
    const phone = testSmsDto.phone || '00962796026659'; // Your test number
    const message = testSmsDto.message || 'Test SMS from Adlaan backend';
    
    try {
      const result = await this.authService.testSmsService(phone, message);
      return {
        success: result.success,
        message: result.message,
        phone: phone,
        timestamp: result.timestamp,
        otpCode: result.otpCode
      };
    } catch (error) {
      return {
        success: false,
        message: `SMS test failed: ${error.message}`,
        phone: phone
      };
    }
  }

  @Public()
  @Post('test-otp')
  @HttpCode(HttpStatus.OK)
  async testOtp(@Body() testOtpDto: { phone?: string }) {
    const phone = testOtpDto.phone || '00962796026659'; // Your test number
    
    try {
      const result = await this.authService.testOtpGeneration(phone);
      return {
        success: result.success,
        message: result.success ? 'OTP generated and sent successfully' : (result.error || 'OTP generation failed'),
        phone: phone,
        timestamp: result.timestamp,
        // Note: In production, never return the actual OTP
        otp: process.env.NODE_ENV === 'development' ? result.otp : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: `OTP test failed: ${error.message}`,
        phone: phone
      };
    }
  }
}
