import { Injectable, Logger } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface TriageResult {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  aiSolution: string;
  targetOperator: 'Frontend' | 'Backend' | 'DevOps' | 'General';
  relevantFiles: string[];
}

@Injectable()
export class TriageService {
  private readonly logger = new Logger(TriageService.name);
  private octokit: Octokit;
  private openai: OpenAI;

  constructor() {
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * The core triage flow: 
   * 1. Analyze bug report
   * 2. Search GitHub for relevant code
   * 3. Use LLM to synthesize a technical brief
   */
  async triageBug(owner: string, repo: string, bugReport: string): Promise<TriageResult> {
    this.logger.log(`Starting triage for bug: ${bugReport.substring(0, 50)}...`);

    // Step 1: Find relevant files in GitHub
    const contextFiles = await this.findRelevantCode(owner, repo, bugReport);
    
    // Step 2: Get LLM to analyze the bug with the code context
    const analysis = await this.analyzeWithLLM(bugReport, contextFiles);

    return analysis;
  }

  private async findRelevantCode(owner: string, repo: string, query: string): Promise<string> {
    this.logger.log(`Searching GitHub for context in ${owner}/${repo}...`);
    
    try {
      // Search for code snippets matching the bug report keywords
      const { data } = await this.octokit.search.code({
        q: `${owner}/${repo} ${query}`,
        per_page: 5,
      });

      if (!data.items) return 'No relevant code snippets found.';

      const snippets = await Promise.all(
        data.items.map(async (item) => {
          const content = await this.octokit.repos.getContent({
            owner: item.repository.full_name.split('/')[0],
            repo: item.repository.full_name.split('/')[1],
            path: item.path,
          });
          return `File: ${item.path}\nContent: ${Buffer.from(content.data.content as string, 'base64').toString()}`;
        })
      );

      return snippets.join('\n\n---\n\n');
    } catch (error) {
      this.logger.error(`GitHub search failed: ${error.message}`);
      return 'Error retrieving code context.';
    }
  }

  private async analyzeWithLLM(bugReport: string, codeContext: string): Promise<TriageResult> {
    this.logger.log('Analyzing context with LLM...');

    const prompt = `
      You are an expert technical triage agent. 
      Analyze the following bug report and the provided code snippets from the repository.
      
      BUG REPORT:
      ${bugReport}

      CODE CONTEXT:
      ${codeContext}

      Return a JSON object with exactly these fields:
      - severity: "Critical", "High", "Medium", or "Low"
      - estimatedHours: number (estimated time to fix)
      - aiSolution: string (detailed technical explanation and suggested fix)
      - targetOperator: "Frontend", "Backend", "DevOps", or "General"
      - relevantFiles: string[] (list of files that likely need modification)
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: 'You are a technical triage bot that outputs strictly JSON.' }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as TriageResult;
  }
}
