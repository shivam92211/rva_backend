import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { KycSubmissionsModule } from './kyc-submissions/kyc-submissions.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { KucoinModule } from './kucoin/kucoin.module';
import { DepositsModule } from './deposits/deposits.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    KycSubmissionsModule,
    KucoinModule,
    DepositsModule,
    WithdrawalsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
