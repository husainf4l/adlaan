import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private prisma = new PrismaClient();

  constructor(private smsService: SmsService) {}

  /**
   * Generate and send OTP via SMS
   */
  async generateAndSendOtp(phoneNumber: string, type: 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION' | 'PASSWORD_RESET'): Promise<{ success: boolean; otpCode?: string; error?: string }> {
    try {
      // Generate random 6-digit OTP
      const otpCode = this.smsService.generateOtpCode(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTPs for this phone and type
      await this.prisma.otp.deleteMany({
        where: {
          phoneNumber,
          type,
        },
      });

      // Save OTP to database
      await this.prisma.otp.create({
        data: {
          phoneNumber,
          code: otpCode,
          type,
          expiresAt,
          attempts: 0,
        },
      });

      // Send OTP via SMS
      const smsResult = await this.smsService.sendOtpSms(phoneNumber, otpCode);
      
      if (smsResult.success) {
        this.logger.log(`OTP ${otpCode} sent successfully to ${phoneNumber} for ${type}`);
        return {
          success: true,
          otpCode: otpCode, // For development/testing
        };
      } else {
        this.logger.error(`Failed to send OTP SMS: ${smsResult.error}`);
        return {
          success: false,
          error: 'Failed to send OTP SMS',
        };
      }
    } catch (error) {
      this.logger.error('Error generating and sending OTP:', error);
      return {
        success: false,
        error: 'Failed to generate OTP',
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(phoneNumber: string, code: string, type: 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION' | 'PASSWORD_RESET'): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the OTP record
      const otpRecord = await this.prisma.otp.findFirst({
        where: {
          phoneNumber,
          type,
          used: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpRecord) {
        return {
          success: false,
          error: 'OTP not found or already used',
        };
      }

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        });
        
        return {
          success: false,
          error: 'OTP has expired',
        };
      }

      // Check if too many attempts
      if (otpRecord.attempts >= 3) {
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        });
        
        return {
          success: false,
          error: 'Too many incorrect attempts',
        };
      }

      // Verify the code
      if (otpRecord.code !== code) {
        // Increment attempts
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });
        
        return {
          success: false,
          error: 'Invalid OTP code',
        };
      }

      // Mark OTP as used
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });

      this.logger.log(`OTP verified successfully for ${phoneNumber}`);
      return { success: true };

    } catch (error) {
      this.logger.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP',
      };
    }
  }

  /**
   * Clean up expired OTPs (can be called by a cron job)
   */
  async cleanupExpiredOtps(): Promise<number> {
    try {
      const result = await this.prisma.otp.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired/used OTPs`);
      return result.count;
    } catch (error) {
      this.logger.error('Error cleaning up OTPs:', error);
      return 0;
    }
  }

  /**
   * Get OTP statistics for debugging
   */
  async getOtpStats(phoneNumber: string): Promise<any> {
    try {
      const stats = await this.prisma.otp.findMany({
        where: { phoneNumber },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return stats;
    } catch (error) {
      this.logger.error('Error getting OTP stats:', error);
      return [];
    }
  }
}
