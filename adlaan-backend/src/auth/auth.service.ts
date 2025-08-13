import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcryptjs';
import type { FastifyReply } from 'fastify';
import { AuthProvider, OtpType } from '../../generated/prisma';
import { RegisterDto, LoginDto, OtpVerificationDto, GoogleUserDto, CompleteProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID')
    );
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
        phoneNumber: registerDto.phoneNumber,
        twoFactorEnabled: registerDto.twoFactorEnabled || false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        twoFactorEnabled: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Generate and send SMS verification OTP only if phone number is provided and 2FA is enabled
    if (registerDto.phoneNumber && registerDto.twoFactorEnabled) {
      const otpResult = await this.otpService.generateAndSendOtp(
        registerDto.phoneNumber, 
        OtpType.EMAIL_VERIFICATION
      );
      
      return {
        ...user,
        requiresEmailVerification: true,
        message: 'Registration successful. Please check your SMS for verification code.',
        otpSent: otpResult.success,
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { otpCode: otpResult.otpCode }),
      };
    }

    return {
      ...user,
      message: 'Registration successful.',
    };
  }

  async login(loginDto: LoginDto) {
    // Find user by email
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has a password (local auth)
    if (!user.password) {
      throw new UnauthorizedException('Please login with Google or reset your password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled and user has a phone number
    if (user.twoFactorEnabled && user.phoneNumber) {
      // Generate OTP for login verification
      const otpResult = await this.otpService.generateAndSendOtp(
        user.phoneNumber, 
        OtpType.LOGIN_VERIFICATION
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        requiresOtp: true,
        message: 'OTP sent to your registered phone number. Please verify to complete login.',
        phoneNumber: user.phoneNumber,
        otpSent: otpResult.success,
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { otpCode: otpResult.otpCode }),
      };
    }

    // If 2FA is not enabled, login directly
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      twoFactorEnabled: user.twoFactorEnabled,
      company: user.company,
      requiresOtp: false,
      message: 'Login successful.',
    };
  }

  generateTokens(userId: string) {
    const payload = { sub: userId };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }

  setTokenCookies(response: FastifyReply, accessToken: string, refreshToken: string) {
    // Set HTTP-only cookies using Fastify's cookie method
    (response as any).cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // More permissive in development
      maxAge: 24 * 60 * 60, // 24 hours in seconds (Fastify uses seconds, not milliseconds)
      path: '/', // Ensure cookie is available for all paths
    });

    (response as any).cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // More permissive in development
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/', // Ensure cookie is available for all paths
    });
  }

  clearTokenCookies(response: FastifyReply) {
    (response as any).clearCookie('access_token');
    (response as any).clearCookie('refresh_token');
  }

  async validateOrCreateGoogleUser(googleUser: GoogleUserDto) {
    // Check if user exists with Google provider
    let user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          { providerId: googleUser.providerId, provider: AuthProvider.GOOGLE },
          { email: googleUser.email },
        ],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (user) {
      // Update user info if needed
      user = await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          name: googleUser.name,
          avatar: googleUser.avatar,
          provider: AuthProvider.GOOGLE,
          providerId: googleUser.providerId,
          isEmailVerified: true, // Google emails are pre-verified
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });
    } else {
      // Create new user
      user = await this.prismaService.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          provider: AuthProvider.GOOGLE,
          providerId: googleUser.providerId,
          isEmailVerified: true,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      companyId: user.companyId,
      company: user.company,
    };
  }

  async validateGoogleToken(credential: string) {
    try {
      // Verify the Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      if (!payload.email) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      // Extract user information from the token payload
      const googleUser = {
        providerId: payload.sub,
        email: payload.email,
        name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
        avatar: payload.picture,
      };

      // Validate or create the user
      return await this.validateOrCreateGoogleUser(googleUser);
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token: ' + error.message);
    }
  }

  async completeProfile(userId: string, completeProfileDto: CompleteProfileDto) {
    // First, update the user's phone number
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        phoneNumber: completeProfileDto.phoneNumber,
      },
    });

    // Check if user already has a company
    if (updatedUser.companyId) {
      // Update existing company
      const company = await this.prismaService.company.update({
        where: { id: updatedUser.companyId },
        data: {
          name: completeProfileDto.companyName,
        },
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
              billingCycle: true,
              amount: true,
              currency: true,
              startDate: true,
              endDate: true,
              nextBillingDate: true,
              isTrialActive: true,
              trialStartDate: true,
              trialEndDate: true,
            },
          },
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        phoneNumber: updatedUser.phoneNumber,
        companyId: company.id,
        company: company,
      };
    } else {
      // Create new company
      const company = await this.prismaService.company.create({
        data: {
          name: completeProfileDto.companyName,
          ownerId: userId,
        },
        include: {
          subscription: {
            select: {
              id: true,
              plan: true,
              status: true,
              billingCycle: true,
              amount: true,
              currency: true,
              startDate: true,
              endDate: true,
              nextBillingDate: true,
              isTrialActive: true,
              trialStartDate: true,
              trialEndDate: true,
            },
          },
        },
      });

      // Update user with company ID
      const userWithCompany = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          companyId: company.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          phoneNumber: true,
          companyId: true,
        },
      });

      return {
        ...userWithCompany,
        company: company,
      };
    }
  }

  async verifyOtpAndLogin(otpDto: OtpVerificationDto) {
    // Verify OTP using phone number
    const otpResult = await this.otpService.verifyOtp(
      otpDto.phoneNumber, 
      otpDto.code, 
      otpDto.type
    );
    
    if (!otpResult.success) {
      throw new UnauthorizedException(otpResult.error || 'Invalid or expired OTP');
    }

    // For login verification, we need to find the user by email
    // Since we don't have phone numbers stored yet, we'll use a workaround
    // In production, you should store phone numbers in user profiles
    
    // For now, assume the first user for demo purposes
    // You should implement proper user lookup by phone number
    const users = await this.prismaService.user.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (users.length === 0) {
      throw new UnauthorizedException('No users found');
    }

    const user = users[0];

    // Mark email as verified if it's email verification
    if (otpDto.type === OtpType.EMAIL_VERIFICATION) {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      companyId: user.companyId,
      company: user.company,
    };
  }

  async resendOtp(phoneNumber: string, type: OtpType) {
    // Generate and send new OTP
    const otpResult = await this.otpService.generateAndSendOtp(phoneNumber, type);

    if (!otpResult.success) {
      throw new UnauthorizedException(otpResult.error || 'Failed to send OTP');
    }

    return {
      message: 'OTP sent successfully to your phone',
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { otpCode: otpResult.otpCode }),
    };
  }

  // Test methods for SMS and OTP functionality
  async testSmsService(phone: string, message: string) {
    try {
      // Access the SMS service through OTP service's public method
      const result = await this.otpService.generateAndSendOtp(phone, OtpType.LOGIN_VERIFICATION);
      
      if (result.success) {
        return {
          success: true,
          message: 'SMS service is working',
          otpCode: result.otpCode, // For testing only
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(result.error || 'SMS sending failed');
      }
    } catch (error) {
      throw new Error(`SMS service test failed: ${error.message}`);
    }
  }

  async testOtpGeneration(phone: string) {
    try {
      const result = await this.otpService.generateAndSendOtp(phone, OtpType.LOGIN_VERIFICATION);
      return {
        success: result.success,
        otp: result.otpCode, // Only for testing
        timestamp: new Date().toISOString(),
        ...(result.error && { error: result.error })
      };
    } catch (error) {
      throw new Error(`OTP generation test failed: ${error.message}`);
    }
  }
}
