import { applyDecorators, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * Returns the authenticated user object attached to the request by the
 * JwtAuthGuard. Use `@CurrentUser() user: User` inside controller methods.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * Convenience decorator that documents a route as requiring a bearer JWT and
 * wires the standard 401 response. Combines with the global JwtAuthGuard.
 */
export function AuthRequired() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
