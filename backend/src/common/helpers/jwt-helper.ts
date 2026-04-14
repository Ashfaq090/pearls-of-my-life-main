import { Injectable } from '@nestjs/common';
import configuration from './../config/app.config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

const config = configuration();
const jwt = new JwtService({ secret: config.JWT.SECRET });

@Injectable()
export class JwtHelper {
  async verifyToken(token: string): Promise<any> {
    return jwt.verify(token, { secret: config.JWT.SECRET });
  }

  generateToken(
    user_id: string,
    is_keyholder: boolean = false,
    role: string = 'user',
    session_id: string = randomUUID(),
  ): any {
    const payload = {
      user_id,
      session_id,
      version: 1,
      is_keyholder,
      role,
    };
    const access_token = jwt.sign(payload, {
      secret: config.JWT.SECRET,
      expiresIn: config.JWT.ACCESS_TOKEN_EXPIRY,
    });
    return {
      access_token,
    };
  }
}
