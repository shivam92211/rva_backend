import { Injectable, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class CaptchaLocalAuthGuard extends AuthGuard('local') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const body = request.body;

    // Check if CAPTCHA is required for this IP
    if (this.authService.requiresCaptcha(ip)) {
      if (!body.recaptchaToken) {
        throw new BadRequestException('reCAPTCHA verification required');
      }

      const isValidCaptcha = await this.authService.verifyRecaptcha(body.recaptchaToken);
      if (!isValidCaptcha) {
        throw new BadRequestException('Invalid reCAPTCHA');
      }
    }

    // Now proceed with passport local authentication
    return super.canActivate(context) as Promise<boolean>;
  }
}
