import { Module } from '@nestjs/common';
import { KycSubmissionsController } from './kyc-submissions.controller';
import { KycSubmissionsService } from './kyc-submissions.service';

@Module({
  controllers: [KycSubmissionsController],
  providers: [KycSubmissionsService],
  exports: [KycSubmissionsService],
})
export class KycSubmissionsModule {}