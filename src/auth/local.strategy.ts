import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passReqToCallback: true, // Pass the request to the validate method
    });
  }

  async validate(req: any, email: string, password: string): Promise<any> {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const admin = await this.authService.validateAdmin(
      email,
      password,
      ip,
      userAgent,
    );
    if (!admin) {
      throw new UnauthorizedException();
    }
    return admin;
  }
}
