import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { HelperModule } from 'src/common/helpers/helpers.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';
import { KeyHoldersModule } from '../key-holders/key-holders.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT.SECRET'),
        algorithm: configService.get('JWT.ALGORITHM'),
        signOptions: {
          algorithm: configService.get('JWT.ALGORITHM'),
          expiresIn: `${configService.get('JWT.ACCESS_TOKEN_EXPIRY')}s`
        }
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => HelperModule),
    forwardRef(() => EmailModule),
    forwardRef(() => KeyHoldersModule)
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtStrategy]
})
export class AuthModule { }
