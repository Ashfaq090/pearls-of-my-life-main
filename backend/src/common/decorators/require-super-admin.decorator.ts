import { SetMetadata } from '@nestjs/common';

export const RequireSuperAdmin = () => SetMetadata('requireSuperAdmin', true);
