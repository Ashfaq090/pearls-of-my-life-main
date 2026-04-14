import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if account is terminated
    if (user.is_terminated) {
      throw new ForbiddenException('Your account has been terminated. Please contact support.');
    }

    // Check if account is active
    if (user.is_active === false) {
      throw new ForbiddenException('Your account is deactivated. Please contact support.');
    }

    return true;
  }
}

