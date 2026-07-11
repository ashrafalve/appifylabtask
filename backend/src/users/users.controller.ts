import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthRequired } from '../common/decorators/current-user.decorator';

/**
 * GET /users/me -> the currently authenticated user (from the JWT).
 */
@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @AuthRequired()
  @ApiOperation({ summary: 'Get the current authenticated user' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }
}
