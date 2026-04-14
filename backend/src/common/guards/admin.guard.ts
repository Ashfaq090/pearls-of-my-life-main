import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and is an admin or super_admin
    if (!user) {
      return false;
    }

    // Check if the route requires super admin
    const requireSuperAdmin = this.reflector.get<boolean>(
      'requireSuperAdmin',
      context.getHandler(),
    );

    if (requireSuperAdmin) {
      return user.role === 'super_admin';
    }

    return user.role === 'admin' || user.role === 'super_admin';
  }
}
