import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return Boolean(user);
  }
}
