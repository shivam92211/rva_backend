import { Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';

@Module({
  controllers: [DepositsController],
  providers: [DepositsService],
})
export class DepositsModule {}
