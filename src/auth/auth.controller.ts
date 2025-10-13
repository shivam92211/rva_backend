import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Ip,
  Headers,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CaptchaLocalAuthGuard } from './captcha-local-auth.guard';

class LoginDto {
  email: string;
  password: string;
  recaptchaToken?: string;
}

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(CaptchaLocalAuthGuard)
  @Post('portal-auth-gate-7a3b9f')
  @ApiOperation({ summary: 'Admin login (obfuscated endpoint)' })
  @ApiResponse({ status: 200, description: 'Login successful or 2FA required' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Request() req: any,
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const ipAddress = ip || 'unknown';
    return this.authService.loginWith2FA(
      req.user,
      ipAddress,
      userAgent || 'unknown',
    );
  }

  @Get('captcha-required')
  @ApiOperation({ summary: 'Check if CAPTCHA is required for this IP' })
  @ApiResponse({ status: 200, description: 'Returns whether CAPTCHA is required' })
  async checkCaptchaRequired(@Ip() ip: string) {
    return {
      required: this.authService.requiresCaptcha(ip || 'unknown'),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Request() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.authService.logout(
      req.user.id,
      ip || 'unknown',
      userAgent || 'unknown',
    );
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid or expired' })
  verifyToken(@Request() req: any) {
    return {
      valid: true,
      admin: req.user,
      message: 'Token is valid',
    };
  }

  @Post('login-2fa')
  @ApiOperation({ summary: 'Complete 2FA login' })
  @ApiResponse({ status: 200, description: '2FA verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code' })
  async login2FA(
    @Body() body: { adminId: string; code: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.complete2FALogin(
      body.adminId,
      body.code,
      ip || 'unknown',
      userAgent || 'unknown',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({ status: 200, description: '2FA secret generated' })
  async generate2FA(@Request() req: any) {
    return this.authService.generateTwoFactorSecret(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA after verifying code' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid 2FA code' })
  async enable2FA(@Request() req: any, @Body() body: { code: string }) {
    return this.authService.enableTwoFactor(req.user.id, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(@Request() req: any) {
    return this.authService.disableTwoFactor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code' })
  @ApiResponse({ status: 200, description: '2FA code verification result' })
  async verify2FA(@Request() req: any, @Body() body: { code: string }) {
    return this.authService.verifyTwoFactorCode(req.user.id, body.code);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Body() body: { refresh_token: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.refreshAccessToken(
      body.refresh_token,
      ip || 'unknown',
      userAgent || 'unknown',
    );
  }
}
