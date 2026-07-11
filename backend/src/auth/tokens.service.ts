import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Thin wrapper around @nestjs/jwt. Centralizes token generation/configuration
 * so the expiry and secret live in one place (the .env file).
 */
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '7d',
      secret: this.config.get<string>('JWT_SECRET'),
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
      secret: this.config.get<string>('JWT_SECRET'),
    });
  }
}
