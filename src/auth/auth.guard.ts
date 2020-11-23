import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // if role designated, it means user has a role or public.
    const role = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!role) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];

    if (!user) {
      return false;
    }

    return role.includes('Any') || role.includes(user.role);
  }
}
