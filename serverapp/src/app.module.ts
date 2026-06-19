import { Module } from '@nestjs/common';
import { TriageService } from './triage.service';
import { TriageController } from './triage.controller';

@Module({
  imports: [],
  controllers: [TriageController],
  providers: [TriageService],
})
export class AppModule {}
