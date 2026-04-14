import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BEARER, X_ACCESS_TOKEN } from 'src/common/constants';
import configuration from './../../../common/config/app.config';

const config = configuration();

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (
            (request.headers?.[X_ACCESS_TOKEN] as string) ||
            (request.headers?.[X_ACCESS_TOKEN.toLocaleLowerCase()] as string) ||
            (request.query?.[X_ACCESS_TOKEN.toLocaleLowerCase()] as string)
          )?.replace(`${BEARER} `, '');
        },
      ]),
      ignoreExpiration: false,
      algorithm: config.JWT.ALGORITHM,
      secretOrKey: config.JWT.SECRET,
    });
  }
  async validate(payload: any): Promise<any> {
    return {
      user_id: payload.user_id,
      session_id: payload.session_id,
      version: payload.version,
      is_keyholder: payload?.is_keyholder ?? false,
      role: payload?.role ?? 'user',
    };
  }
}
