import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TriageService, TriageResult } from '../service/triage.service';

interface TriageRequest {
  owner: string;
  repo: string;
  bugReport: string;
}

@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  async createTriage(@Body() body: TriageRequest): Promise<TriageResult> {
    const { owner, repo, bugReport } = body;

    if (!owner || !repo || !bugReport) {
      throw new HttpException(
        'Missing required fields: owner, repo, and bugReport are mandatory.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.triageService.triageBug(owner, repo, bugReport);
    } catch (error) {
      throw new HttpException(
        `Triage failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
