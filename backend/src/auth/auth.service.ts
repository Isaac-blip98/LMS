/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload, UserFromJwt } from './interfaces/auth.interface';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailerService } from 'src/mailer/mailer.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  // In-memory store for reset codes (for demo; use DB in production)
  private resetCodes: { [email: string]: { code: string; expires: number } } = {};

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<{ id: string; name: string; email: string; role: Role } | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const dbUser = await this.usersService.findByEmail(loginDto.email);
    if (
      !dbUser ||
      !(await bcrypt.compare(loginDto.password, dbUser.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = {
      sub: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name,
      },
    };
  }
async register(registerDto: RegisterDto) {
  const existingUser = await this.usersService.findByEmail(registerDto.email);
  if (existingUser) {
    throw new ConflictException('Email is already registered');
  }

  const user = await this.usersService.create(registerDto);

  await this.mailerService.sendWelcomeEmail(user.email, user.name);

  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  return {
    access_token: this.jwtService.sign(payload),
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  };
}

  async checkEmailAvailability(email: string) {
    const existingUser = await this.usersService.findByEmail(email);
    return {
      email,
      available: !existingUser,
      message: existingUser
        ? 'Email is already registered'
        : 'Email is available',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security, do not reveal if email exists
      return { message: 'If the email exists, a reset code has been sent.' };
    }
    const code = randomBytes(3).toString('hex').toUpperCase(); // 6-char code
    const expires = Date.now() + 1000 * 60 * 10; // 10 minutes
    this.resetCodes[email] = { code, expires };
    await this.mailerService.sendResetPasswordEmail(email, code);
    return { message: 'If the email exists, a reset code has been sent.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const entry = this.resetCodes[email];
    if (!entry || entry.code !== code || entry.expires < Date.now()) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    await this.usersService.update(user.id, { password: newPassword });
    delete this.resetCodes[email];
    return { message: 'Password reset successful' };
  }

  async updateProfile(user: UserFromJwt, update: { name?: string; email?: string }) {
    return this.usersService.update(user.userId, update);
  }
}
