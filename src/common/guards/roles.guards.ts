import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get('roles', context.getHandler());
    if (!roles) return true;

    const req = context.switchToHttp().getRequest();
    return roles.includes(req.user.role);
  }
}
