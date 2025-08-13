import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CompleteProfileDto } from '../auth/dto/auth.dto';
import type { FastifyRequest } from 'fastify';

@Controller('profile')
export class ProfileController {
  constructor(private authService: AuthService) {}

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @Body() completeProfileDto: CompleteProfileDto,
    @Request() req: FastifyRequest & { user: any },
  ) {
    const updatedUser = await this.authService.completeProfile(req.user.id, completeProfileDto);
    
    return {
      message: 'Profile completed successfully',
      user: updatedUser,
    };
  }
}
