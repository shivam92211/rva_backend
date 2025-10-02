import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KucoinController } from './kucoin.controller';
import { KucoinService } from './kucoin.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [KucoinController],
  providers: [KucoinService],
  exports: [KucoinService],
})
export class KucoinModule {}
