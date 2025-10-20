import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { AuthResponse } from './dto/auth-response.dto';
import { UserRole } from '../user/enums/user-role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(
    name: string, 
    email: string, 
    password: string, 
    role?: UserRole,
    companyId?: number
  ): Promise<AuthResponse> {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role based on business logic:
    // - If role is explicitly provided, use it
    // - If no role provided and user has companyId, default to USER (company user)
    // - If no role provided and no companyId, default to ADMIN (independent admin)
    let userRole = role;
    if (!userRole) {
      userRole = companyId ? UserRole.USER : UserRole.ADMIN;
    }

    // Create user
    const user = await this.userService.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      companyId,
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUserById(userId: number): Promise<User | null> {
    return this.userService.findOne(userId);
  }
}
