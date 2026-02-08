import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashed',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByPasswordResetToken: jest.fn(),
  };

  const mockBlacklistRepo = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            decode: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: MailService, useValue: { sendPasswordReset: jest.fn() } },
        {
          provide: getRepositoryToken(BlacklistedToken),
          useValue: mockBlacklistRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers new user', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'pass123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.accessToken).toBe('token');
      expect(mockUserService.create).toHaveBeenCalled();
    });

    it('throws ConflictException when email exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'pass123',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns token for valid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'pass123',
      });

      expect(result.accessToken).toBe('token');
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
