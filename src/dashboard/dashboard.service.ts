import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Get total deposits count and sum
    const depositStats = await this.prisma.userKucoinDepositHistory.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });

    // Get total withdrawals count and sum
    const withdrawalStats = await this.prisma.userKucoinWithdrawalHistory.aggregate({
      _count: { id: true },
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });

    // Get total users
    const totalUsers = await this.prisma.user.count();

    // Get total KYC submissions
    const totalKycSubmissions = await this.prisma.kycSubmission.count();

    // Get pending KYC submissions
    const pendingKyc = await this.prisma.kycSubmission.count({
      where: { status: 'pending' }
    });

    // Get spot order stats for last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get all spot orders from last 24 hours
    const spotOrders = await this.prisma.spotOrder.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      select: {
        id: true,
        price: true,
        quantity: true,
        status: true
      }
    });

    // Calculate order placed count and value
    const ordersPlaced = spotOrders.length;
    let ordersPlacedValue = new Decimal(0);

    spotOrders.forEach(order => {
      if (order.price && order.quantity) {
        ordersPlacedValue = ordersPlacedValue.add(order.price.mul(order.quantity));
      }
    });

    // Calculate executed orders (status: DONE, MATCH)
    const executedOrders = spotOrders.filter(order =>
      order.status === 'DONE' || order.status === 'MATCH'
    );
    const ordersExecuted = executedOrders.length;
    let ordersExecutedValue = new Decimal(0);

    executedOrders.forEach(order => {
      if (order.price && order.quantity) {
        ordersExecutedValue = ordersExecutedValue.add(order.price.mul(order.quantity));
      }
    });

    return {
      totalUsers,
      totalKycSubmissions,
      pendingKyc,
      totalDeposits: depositStats._count.id || 0,
      totalDepositAmount: depositStats._sum.amount?.toString() || '0',
      totalWithdrawals: withdrawalStats._count.id || 0,
      totalWithdrawalAmount: withdrawalStats._sum.amount?.toString() || '0',
      ordersPlaced,
      ordersPlacedValue: ordersPlacedValue.toString(),
      ordersExecuted,
      ordersExecutedValue: ordersExecutedValue.toString()
    };
  }

  async getActivityChartData() {
    const chartData: Array<{
      date: string;
      users: number;
      deposits: number;
      withdrawals: number;
      spotOrdersPlaced: number;
      spotOrdersExecuted: number;
    }> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get user count for this day
      const userCount = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });

      // Get deposit count for this day
      const depositCount = await this.prisma.userKucoinDepositHistory.count({
        where: {
          createdAt: {
            gte: BigInt(date.getTime()),
            lt: BigInt(nextDate.getTime())
          }
        }
      });

      // Get withdrawal count for this day
      const withdrawalCount = await this.prisma.userKucoinWithdrawalHistory.count({
        where: {
          createdAt: {
            gte: BigInt(date.getTime()),
            lt: BigInt(nextDate.getTime())
          }
        }
      });

      // Get spot orders placed for this day
      const spotOrdersPlaced = await this.prisma.spotOrder.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });

      // Get spot orders executed for this day
      const spotOrdersExecuted = await this.prisma.spotOrder.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          },
          status: {
            in: ['DONE', 'MATCH']
          }
        }
      });

      chartData.push({
        date: date.toISOString().split('T')[0],
        users: userCount,
        deposits: depositCount,
        withdrawals: withdrawalCount,
        spotOrdersPlaced,
        spotOrdersExecuted
      });
    }

    return chartData;
  }
}
