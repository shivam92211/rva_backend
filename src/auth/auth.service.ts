import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Admin } from '@prisma/client';

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
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<any> {
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
      // Increment failed attempts
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedAttempts: admin.failedAttempts + 1,
          lockedUntil: admin.failedAttempts >= 4 ? new Date(Date.now() + 30 * 60 * 1000) : null, // Lock for 30 minutes after 5 failed attempts
        },
      });
      throw new UnauthorizedException('Invalid email or password');
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

    // Log the login activity
    await this.prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        resource: 'SYSTEM',
        details: { success: true },
        ipAddress: 'unknown', // Will be updated by controller
        userAgent: 'unknown', // Will be updated by controller
      },
    });

    const { password: _, ...result } = admin;
    return result;
  }

  async login(admin: Admin, ip: string, userAgent: string): Promise<{ access_token: string; admin: Omit<Admin, 'password'> }> {
    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    // Update the login log with actual IP and user agent
    await this.prisma.adminLog.updateMany({
      where: {
        adminId: admin.id,
        action: 'LOGIN',
        ipAddress: 'unknown',
      },
      data: {
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;

    return {
      access_token: this.jwtService.sign(payload),
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
}