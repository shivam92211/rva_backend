import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class KycSubmissionsService {
  private prisma = new PrismaClient();

  async getKycSubmissions(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    level?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build filters
    const filters: any = {};

    // Search filter - search in user details and submission details
    if (search) {
      filters.OR = [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { idNumber: { contains: search, mode: 'insensitive' as const } },
        { nationality: { contains: search, mode: 'insensitive' as const } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              { username: { contains: search, mode: 'insensitive' as const } },
            ],
          },
        },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filters.status = status.toUpperCase();
    }

    // Level filter
    if (level && level !== 'all') {
      filters.level = parseInt(level);
    }

    const [kycSubmissions, totalCount] = await Promise.all([
      this.prisma.kycSubmission.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              phone: true,
              isEmailVerified: true,
              isPhoneVerified: true,
              isKycVerified: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      this.prisma.kycSubmission.count({
        where: filters,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      kycSubmissions,
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

  async getKycSubmissionById(id: string) {
    const kycSubmission = await this.prisma.kycSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phone: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            isKycVerified: true,
          },
        },
      },
    });

    if (!kycSubmission) {
      throw new Error('KYC submission not found');
    }

    return kycSubmission;
  }

  async updateKycSubmissionStatus(
    id: string,
    status: string,
    reviewedBy?: string,
    rejectionReason?: string,
  ) {
    const kycSubmission = await this.prisma.kycSubmission.findUnique({
      where: { id },
      select: { id: true, status: true, user: { select: { username: true } } },
    });

    if (!kycSubmission) {
      throw new Error('KYC submission not found');
    }

    const updateData: any = {
      status: status.toUpperCase(),
      reviewedAt: new Date(),
      reviewedBy: reviewedBy || 'admin',
    };

    if (status.toUpperCase() === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedSubmission = await this.prisma.kycSubmission.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      id: updatedSubmission.id,
      status: updatedSubmission.status,
      message: `KYC submission for ${updatedSubmission.user.username} ${status.toLowerCase()} successfully`,
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
