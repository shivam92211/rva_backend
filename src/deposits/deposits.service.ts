import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

  async getDeposits(
    page: number,
    limit: number,
    status?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    // Get total count for pagination
    const totalCount = await this.prisma.userKucoinDepositHistory.count({
      where,
    });

    // Get deposits with user information
    const deposits = await this.prisma.userKucoinDepositHistory.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedDeposits = deposits.map((deposit) => ({
      ...deposit,
      amount: deposit.amount.toString(),
      fee: deposit.fee.toString(),
      createdAt: deposit.createdAt.toString(),
      updatedAt: deposit.updatedAt.toString(),
      lastScanTimestamp: deposit.lastScanTimestamp?.toString() || null,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      deposits: serializedDeposits,
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

  async getDepositById(id: string) {
    const deposit = await this.prisma.userKucoinDepositHistory.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException(`Deposit with ID ${id} not found`);
    }

    // Get the deposit address for this currency and user
    const depositAddress =
      await this.prisma.userKucoinDepositAddress.findFirst({
        where: {
          userId: deposit.userId,
          currency: deposit.currency,
          chainId: deposit.chain,
        },
        select: {
          address: true,
          memo: true,
          chainName: true,
          contractAddress: true,
          balance: true,
          isActive: true,
        },
      });

    // Convert BigInt to string for JSON serialization
    const serializedDeposit = {
      ...deposit,
      amount: deposit.amount.toString(),
      fee: deposit.fee.toString(),
      createdAt: deposit.createdAt.toString(),
      updatedAt: deposit.updatedAt.toString(),
      lastScanTimestamp: deposit.lastScanTimestamp?.toString() || null,
      depositAddress: depositAddress
        ? {
            ...depositAddress,
            balance: depositAddress.balance.toString(),
          }
        : null,
    };

    return serializedDeposit;
  }
}
