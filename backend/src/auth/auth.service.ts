import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { TokensService, JwtPayload, TokenPair } from './tokens.service';
import { sanitizeUser } from '../common/utils/sanitize.util';

export const BCRYPT_SALT_ROUNDS = 12;

/**
 * AuthService
 * - register:   hash password, create user, issue tokens
 * - validateUser: verify credentials, throw on failure (no user enumeration)
 * - login:      validate and issue tokens
 * - The returned user is always sanitized (no passwordHash).
 */
@Injectable()
export class AuthService {
  private readonly tokens: TokensService;

  constructor(
    private readonly prisma: PrismaService,
    jwtService: JwtService,
    config: ConfigService,
  ) {
    this.tokens = new TokensService(jwtService, config);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
      },
    });

    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    return this.buildAuthResult(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private buildAuthResult(user: {
    id: string;
    email: string;
    passwordHash: string;
    [k: string]: unknown;
  }) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const tokens: TokenPair = {
      accessToken: this.tokens.generateAccessToken(payload),
      refreshToken: this.tokens.generateRefreshToken(payload),
    };
    return {
      user: sanitizeUser(user),
      tokens,
    };
  }
}
