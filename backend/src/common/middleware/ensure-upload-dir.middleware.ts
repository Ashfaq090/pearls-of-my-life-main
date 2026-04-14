import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EnsureUploadDirMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const uploadDirs = [
      'uploads',
      'uploads/profile-pictures',
      'uploads/documents',
    ];

    uploadDirs.forEach((dir) => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    next();
  }
}
