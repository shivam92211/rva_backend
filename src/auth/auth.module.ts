import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { CaptchaLocalAuthGuard } from './captcha-local-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'rva-admin-secret-key',
      signOptions: { expiresIn: '15m' }, // 15 minutes expiration for enhanced security
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, CaptchaLocalAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
