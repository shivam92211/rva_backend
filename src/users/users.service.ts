import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(page: number = 1, limit: number = 10, search?: string, status?: string, whitelist?: string) {
    const skip = (page - 1) * limit;

    // Build filters
    const filters: any = {};

    // Search filter
    if (search) {
      filters.OR = [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Status filter
    if (status === 'active') {
      filters.isActive = true;
    } else if (status === 'inactive') {
      filters.isActive = false;
    }

    // Whitelist filter
    if (whitelist === 'whitelisted') {
      filters.withdrawalWhitelist = true;
    } else if (whitelist === 'not_whitelisted') {
      filters.withdrawalWhitelist = false;
    }

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: filters,
        skip,
        take: limit,
        select: {
          id: true,
          uid: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          profilePicture: true,
          loginType: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isKycVerified: true,
          withdrawalWhitelist: true,
          kycLevel: true,
          isActive: true,
          isFrozen: true,
          isGoogle2FAEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({
        where: filters,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async toggleUserStatus(id: string) {
    // First, find the user to get current status
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isActive: true, username: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Toggle the status
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true, username: true }
    });

    return {
      id: updatedUser.id,
      isActive: updatedUser.isActive,
      message: `User ${updatedUser.username} ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  async toggleWithdrawalWhitelist(id: string) {
    // First, find the user to get current whitelist status
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, withdrawalWhitelist: true, username: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Toggle the whitelist status
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { withdrawalWhitelist: !user.withdrawalWhitelist },
      select: { id: true, withdrawalWhitelist: true, username: true }
    });

    return {
      id: updatedUser.id,
      withdrawalWhitelist: updatedUser.withdrawalWhitelist,
      message: `User ${updatedUser.username} ${updatedUser.withdrawalWhitelist ? 'added to' : 'removed from'} withdrawal whitelist successfully`
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        uid: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePicture: true,
        loginType: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isKycVerified: true,
        withdrawalWhitelist: true,
        kycLevel: true,
        isActive: true,
        isFrozen: true,
        isGoogle2FAEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserDevices(id: string) {
    // First check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user devices with refresh tokens
    const devices = await this.prisma.device.findMany({
      where: { userId: id },
      include: {
        refreshTokens: {
          select: {
            id: true,
            isActive: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return {
      userId: id,
      devices: devices.map(device => ({
        id: device.id,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        location: device.location,
        timezone: device.timezone,
        fingerprint: device.fingerprint,
        refreshTokens: device.refreshTokens,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt
      }))
    };
  }

}