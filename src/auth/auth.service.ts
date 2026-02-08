import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistRepository: Repository<BlacklistedToken>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    return this.generateTokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokenResponse(user);
  }

  async logout(token: string) {
    const decoded = this.jwtService.decode(token);
    if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
      throw new UnauthorizedException('Invalid token');
    }
    const exp = (decoded as { exp: number }).exp;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.blacklistRepository.save({
      tokenHash,
      expiresAt: new Date(exp * 1000),
    });
    return { message: 'Logged out successfully' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const found = await this.blacklistRepository.findOne({
      where: { tokenHash },
    });
    return !!found;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    await this.userService.update(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 3600000),
    });
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await this.mailService.sendPasswordReset(user.email, resetLink);
    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');
    const user = (await this.userService.findByPasswordResetToken(
      hashedToken,
    )) as { id: string; passwordResetExpires: Date | null } | null;
    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
    return { message: 'Password reset successfully' };
  }

  async validateUser(userId: string) {
    return this.userService.findById(userId);
  }

  private generateTokenResponse(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
