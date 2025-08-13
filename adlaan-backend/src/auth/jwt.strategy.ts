import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First try Authorization header (Bearer token)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Then try HTTP-only cookie
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['access_token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    // Validate user exists and is active
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phoneNumber: true,
        twoFactorEnabled: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        provider: true,
        providerId: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            email: true,
            phone: true,
            address: true,
            website: true,
            isActive: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
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
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
