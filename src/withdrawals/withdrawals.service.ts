import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  // Withdrawal Requests (from Withdrawal table)
  async getWithdrawals(
    page: number,
    limit: number,
    status?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const totalCount = await this.prisma.withdrawal.count({ where });

    const withdrawals = await this.prisma.withdrawal.findMany({
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
        beneficiary: {
          select: {
            id: true,
            name: true,
            address: true,
            memo: true,
            chain: true,
            currency: true,
          },
        },
      },
    });

    // Convert Decimal to string for JSON serialization
    const serializedWithdrawals = withdrawals.map((withdrawal) => ({
      ...withdrawal,
      amount: withdrawal.amount.toString(),
      fee: withdrawal.fee.toString(),
      totalAmount: withdrawal.totalAmount.toString(),
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      withdrawals: serializedWithdrawals,
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

  async getWithdrawalById(id: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
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
        beneficiary: {
          select: {
            id: true,
            name: true,
            address: true,
            memo: true,
            chain: true,
            currency: true,
            isActive: true,
            isApproved: true,
          },
        },
      },
    });

    if (!withdrawal) {
      throw new NotFoundException(`Withdrawal with ID ${id} not found`);
    }

    return {
      ...withdrawal,
      amount: withdrawal.amount.toString(),
      fee: withdrawal.fee.toString(),
      totalAmount: withdrawal.totalAmount.toString(),
    };
  }

  // Actual Withdrawals (from UserKucoinWithdrawalHistory table)
  async getKucoinWithdrawalHistory(
    page: number,
    limit: number,
    status?: string,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const totalCount = await this.prisma.userKucoinWithdrawalHistory.count({
      where,
    });

    const withdrawals = await this.prisma.userKucoinWithdrawalHistory.findMany({
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

    // Convert BigInt and Decimal to string for JSON serialization
    const serializedWithdrawals = withdrawals.map((withdrawal) => ({
      ...withdrawal,
      amount: withdrawal.amount.toString(),
      fee: withdrawal.fee.toString(),
      createdAt: withdrawal.createdAt.toString(),
      updatedAt: withdrawal.updatedAt.toString(),
      lastScanTimestamp: withdrawal.lastScanTimestamp?.toString() || null,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      withdrawals: serializedWithdrawals,
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

  async getKucoinWithdrawalHistoryById(id: string) {
    const withdrawal =
      await this.prisma.userKucoinWithdrawalHistory.findUnique({
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

    if (!withdrawal) {
      throw new NotFoundException(
        `Withdrawal history with ID ${id} not found`,
      );
    }

    return {
      ...withdrawal,
      amount: withdrawal.amount.toString(),
      fee: withdrawal.fee.toString(),
      createdAt: withdrawal.createdAt.toString(),
      updatedAt: withdrawal.updatedAt.toString(),
      lastScanTimestamp: withdrawal.lastScanTimestamp?.toString() || null,
    };
  }
}
