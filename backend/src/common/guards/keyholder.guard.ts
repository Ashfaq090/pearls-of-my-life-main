import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../entities';

@Injectable()
export class KeyHolderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // KeyHolders can only view/download, not modify
    const method = request.method;
    const isReadOnly = ['GET', 'HEAD', 'OPTIONS'].includes(method);

    // Check both role and is_keyholder flag
    const isKeyHolder = user.role === UserRole.KEYHOLDER || user.is_keyholder === true;

    if (isKeyHolder && !isReadOnly) {
      throw new ForbiddenException('KeyHolders can only view and download content. Editing, adding, or deleting is not allowed.');
    }

    return true;
  }
}

