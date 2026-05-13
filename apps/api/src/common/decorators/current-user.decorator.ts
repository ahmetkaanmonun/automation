import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../roles';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtUser => {
  const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
  return request.user;
});

