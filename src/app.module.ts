import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { KycSubmissionsModule } from './kyc-submissions/kyc-submissions.module';

@Module({
  imports: [UsersModule, KycSubmissionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
