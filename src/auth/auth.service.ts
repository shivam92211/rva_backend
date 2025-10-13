import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as geoip from 'geoip-lite';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { Admin } from '@prisma/client';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  // In-memory store for IP-based failed attempts (reset on server restart)
  // For production, consider using Redis or database
  private failedLoginAttemptsByIP = new Map<string, { count: number; firstAttempt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Check if IP requires CAPTCHA (more than 3 failed attempts in last 15 minutes)
  requiresCaptcha(ip: string): boolean {
    // TODO: Remove this line after testing - forces CAPTCHA to always show
    return true;

    /* Temporarily disabled - uncomment to restore normal behavior
    const attempts = this.failedLoginAttemptsByIP.get(ip);
    if (!attempts) return false;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Reset if first attempt was more than 15 minutes ago
    if (attempts.firstAttempt < fifteenMinutesAgo) {
      this.failedLoginAttemptsByIP.delete(
        ip);
      return false;
    }

    return attempts.count >= 3;
    */
  }

  // Record failed login attempt for IP
  recordFailedLogin(ip: string): void {
    const attempts = this.failedLoginAttemptsByIP.get(ip);
    if (attempts) {
      attempts.count++;
    } else {
      this.failedLoginAttemptsByIP.set(ip, { count: 1, firstAttempt: new Date() });
    }
  }

  // Clear failed attempts for IP (on successful login)
  clearFailedAttempts(ip: string): void {
    this.failedLoginAttemptsByIP.delete(ip);
  }

  // Verify Google reCAPTCHA token
  async verifyRecaptcha(token: string): Promise<boolean> {
    // TODO: Remove this line after testing - bypasses reCAPTCHA validation
    console.log('reCAPTCHA token received:', token?.substring(0, 20) + '...');
    return true;

    /* Temporarily disabled for testing
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not configured');
      return true; // Don't block if not configured
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      });

      const data = await response.json();
      console.log('reCAPTCHA verification result:', data);
      return data.success === true;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
    */
  }

  async validateAdmin(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<any> {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      // Record failed login attempt by IP
      if (ip) {
        this.recordFailedLogin(ip);
      }

      // Get geolocation from IP
      const location = ip ? geoip.lookup(ip) : null;
      const locationData = location
        ? {
            city: location.city,
            country: location.country,
            timezone: location.timezone,
            coordinates: location.ll,
          }
        : null;

      // Log failed login attempt immediately
      await this.prisma.adminLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN_FAILED',
          resource: 'SYSTEM',
          details: {
            success: false,
            reason: 'Invalid password',
            location: locationData,
          },
          ipAddress: ip || 'unknown',
          userAgent: userAgent || 'unknown',
        },
      });

      // Increment failed attempts
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedAttempts: admin.failedAttempts + 1,
          lockedUntil:
            admin.failedAttempts >= 4
              ? new Date(Date.now() + 30 * 60 * 1000)
              : null, // Lock for 30 minutes after 5 failed attempts
        },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Clear IP-based failed attempts on successful password validation
    if (ip) {
      this.clearFailedAttempts(ip);
    }

    // Reset failed attempts on successful login
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Get geolocation from IP for successful login
    const location = ip ? geoip.lookup(ip) : null;
    const locationData = location
      ? {
          city: location.city,
          country: location.country,
          timezone: location.timezone,
          coordinates: location.ll,
        }
      : null;

    // Log the login activity with geolocation
    await this.prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        resource: 'SYSTEM',
        details: { success: true, location: locationData },
        ipAddress: ip || 'unknown',
        userAgent: userAgent || 'unknown',
      },
    });

    const { password: _, ...result } = admin;
    return result;
  }

  async login(
    admin: Admin,
    ip: string,
    userAgent: string,
  ): Promise<{ access_token: string; refresh_token: string; admin: Omit<Admin, 'password'> }> {
    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    // Generate refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const hashedRefreshToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Store hashed refresh token in database (expires in 7 days)
    await this.prisma.adminRefreshToken.create({
      data: {
        adminId: admin.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      admin: adminWithoutPassword,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin not found or inactive');
    }

    const { password: _, ...result } = admin;
    return result;
  }

  async logout(adminId: string, ip: string, userAgent: string): Promise<void> {
    // Invalidate all refresh tokens for this admin
    await this.prisma.adminRefreshToken.updateMany({
      where: { adminId, isActive: true },
      data: { isActive: false },
    });

    // Log the logout activity
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action: 'LOGOUT',
        resource: 'SYSTEM',
        details: { success: true },
        ipAddress: ip,
        userAgent: userAgent,
      },
    });
  }

  // Refresh access token using refresh token
  async refreshAccessToken(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ): Promise<{ access_token: string }> {
    // Hash the provided refresh token
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Find the refresh token in database
    const storedToken = await this.prisma.adminRefreshToken.findUnique({
      where: { token: hashedToken },
      include: { admin: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!storedToken.isActive) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!storedToken.admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    // Generate new access token
    const payload: JwtPayload = {
      sub: storedToken.admin.id,
      email: storedToken.admin.email,
      name: storedToken.admin.name,
      role: storedToken.admin.role,
    };

    // Log token refresh
    await this.prisma.adminLog.create({
      data: {
        adminId: storedToken.admin.id,
        action: 'TOKEN_REFRESH',
        resource: 'SYSTEM',
        details: { success: true },
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Generate 2FA secret and QR code
  async generateTwoFactorSecret(
    adminId: string,
  ): Promise<{ secret: string; qrCodeUrl: string }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // Generate a secret
    const secret = authenticator.generateSecret();

    // Create OTP auth URL
    const otpauth = authenticator.keyuri(
      admin.email,
      'RVA Admin Panel',
      secret,
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Store the secret temporarily (not enabled yet)
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { google2FASecret: secret },
    });

    return { secret, qrCodeUrl };
  }

  // Enable 2FA after verifying the initial code
  async enableTwoFactor(
    adminId: string,
    code: string,
  ): Promise<{ success: boolean }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.google2FASecret) {
      throw new BadRequestException('2FA secret not found');
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: admin.google2FASecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Enable 2FA
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { isGoogle2FAEnabled: true },
    });

    return { success: true };
  }

  // Disable 2FA
  async disableTwoFactor(adminId: string): Promise<{ success: boolean }> {
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        isGoogle2FAEnabled: false,
        google2FASecret: null,
      },
    });

    return { success: true };
  }

  // Verify 2FA code during login
  async verifyTwoFactorCode(
    adminId: string,
    code: string,
  ): Promise<{ valid: boolean }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.google2FASecret) {
      throw new BadRequestException('2FA not configured');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: admin.google2FASecret,
    });

    return { valid: isValid };
  }

  // Login with 2FA - returns partial token if 2FA is required
  async loginWith2FA(
    admin: Admin,
    ip: string,
    userAgent: string,
  ): Promise<
    | { access_token: string; admin: Omit<Admin, 'password'> }
    | { requires2FA: true; adminId: string }
  > {
    // Check if 2FA is enabled
    if (admin.isGoogle2FAEnabled) {
      return {
        requires2FA: true,
        adminId: admin.id,
      };
    }

    // If 2FA not enabled, return normal login response
    return this.login(admin, ip, userAgent);
  }

  // Complete 2FA login after code verification
  async complete2FALogin(
    adminId: string,
    code: string,
    ip: string,
    userAgent: string,
  ): Promise<{ access_token: string; admin: Omit<Admin, 'password'> }> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    // Verify the 2FA code
    const { valid } = await this.verifyTwoFactorCode(adminId, code);

    if (!valid) {
      // Log failed 2FA attempt
      await this.prisma.adminLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN_2FA_FAILED',
          resource: 'SYSTEM',
          details: { success: false, reason: 'Invalid 2FA code' },
          ipAddress: ip,
          userAgent: userAgent,
        },
      });

      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Log successful 2FA verification
    await this.prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN_2FA_SUCCESS',
        resource: 'SYSTEM',
        details: { success: true },
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    // Return the access token
    return this.login(admin, ip, userAgent);
  }
}
