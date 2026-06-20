import { Module } from '@nestjs/common';
import { TriageService } from './service/triage.service';
import { TriageController } from './controller/triage.controller';

@Module({
  imports: [],
  controllers: [TriageController],
  providers: [TriageService],
})
export class AppModule {}
