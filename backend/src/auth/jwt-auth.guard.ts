import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard protecting any route decorated with @UseGuards(JwtAuthGuard).
 * Delegates verification to JwtStrategy. Stateless: logout is handled client
 * side by discarding the token (no server-side session store required).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
